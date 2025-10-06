"use client";

import { useState } from "react";
import { Upload, FileText, Eye, Trash2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { updateCourseMaterials } from "@/actions/admin/course-materials";
import { ChunkedUploader } from "@/lib/chunkedUploaderServerAction";
import { uploadMaterialChunk } from "@/actions/api/material-upload";

interface CourseMaterialsManagerProps {
  packageId: string;
  packageName: string;
  initialMaterials: string | null;
}

interface UploadProgress {
  filename: string;
  progress: number;
  status: string;
  isComplete: boolean;
  error?: string;
}

export function CourseMaterialsManager({
  packageId,
  initialMaterials,
}: CourseMaterialsManagerProps) {
  const [materials, setMaterials] = useState<string[]>(
    initialMaterials ? initialMaterials.split(',').filter(Boolean) : []
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedFiles: string[] = [];
    
    // Initialize progress tracking for all files
    const initialProgress: UploadProgress[] = Array.from(files).map(file => ({
      filename: file.name,
      progress: 0,
      status: "Preparing...",
      isComplete: false,
    }));
    setUploadProgress(initialProgress);

    try {
      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const file = files[fileIndex];
        
        // Validate file size
        if (file.size > 1000 * 1024 * 1024) {
          setUploadProgress(prev => prev.map((p, i) => 
            i === fileIndex 
              ? { ...p, status: "File too large", error: "File exceeds 1000MB limit", isComplete: true }
              : p
          ));
          continue;
        }

        // Update progress to uploading
        setUploadProgress(prev => prev.map((p, i) => 
          i === fileIndex 
            ? { ...p, progress: 10, status: "Starting upload..." }
            : p
        ));

        const uploader = new ChunkedUploader(uploadMaterialChunk, {
          chunkSize: 5 * 1024 * 1024, // 5MB chunks
          maxRetries: 3,
          onProgress: (progress) => {
            setUploadProgress(prev => prev.map((p, i) => 
              i === fileIndex 
                ? { ...p, progress: Math.min(90, progress), status: `Uploading... ${Math.round(progress)}%` }
                : p
            ));
          },
          onError: (error) => {
            setUploadProgress(prev => prev.map((p, i) => 
              i === fileIndex 
                ? { ...p, status: "Upload failed", error: error, isComplete: true }
                : p
            ));
          },
          onSuccess: () => {
            setUploadProgress(prev => prev.map((p, i) => 
              i === fileIndex 
                ? { ...p, progress: 100, status: "Upload complete", isComplete: true }
                : p
            ));
            uploadedFiles.push(file.name);
          }
        });

        await uploader.uploadFile(file, packageId);
      }

      // Wait a moment for all uploads to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (uploadedFiles.length > 0) {
        const updatedMaterials = [...materials, ...uploadedFiles];
        setMaterials(updatedMaterials);

        // Update database
        const updateResult = await updateCourseMaterials(packageId, updatedMaterials.join(','));
        
        if (!updateResult.success) {
          throw new Error(updateResult.message);
        }

        toast.success(`${uploadedFiles.length} file(s) uploaded successfully!`);
        router.refresh();
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload files');
    } finally {
      setIsUploading(false);
      event.target.value = '';
      // Clear progress after 3 seconds
      setTimeout(() => {
        setUploadProgress([]);
      }, 3000);
    }
  };

  const handleDeleteClick = (filename: string) => {
    setMaterialToDelete(filename);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!materialToDelete) return;

    setIsDeleting(true);
    try {
      const updatedMaterials = materials.filter(m => m !== materialToDelete);
      setMaterials(updatedMaterials);

      const result = await updateCourseMaterials(packageId, updatedMaterials.join(','));
      
      if (!result.success) {
        throw new Error(result.message);
      }

      toast.success('Material deleted successfully!');
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete material');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setMaterialToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setMaterialToDelete(null);
  };

  const getFileIcon = () => {
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
        <input
          type="file"
          multiple
          accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.xls,.xlsx"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="hidden"
          id={`upload-${packageId}`}
        />
        <label
          htmlFor={`upload-${packageId}`}
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <div className="rounded-full bg-slate-100 p-3">
            {isUploading ? (
              <Loader2 className="h-6 w-6 text-slate-600 animate-spin" />
            ) : (
              <Upload className="h-6 w-6 text-slate-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">
              {isUploading ? 'Uploading...' : 'Upload Materials'}
            </p>
            <p className="text-xs text-slate-500">
              PDF, PPT, DOC, XLS files supported (Max 1000MB each)
            </p>
          </div>
        </label>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-800">
            Upload Progress ({uploadProgress.length} files)
          </h4>
          {uploadProgress.map((progress, index) => (
            <div key={index} className="bg-slate-50 rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-800 truncate">
                    {progress.filename}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {progress.isComplete ? (
                    progress.error ? (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Failed
                      </Badge>
                    ) : (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                    )
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      {progress.status}
                    </Badge>
                  )}
                </div>
              </div>
              <Progress 
                value={progress.progress} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>{progress.status}</span>
                <span>{progress.progress}%</span>
              </div>
              {progress.error && (
                <p className="text-xs text-red-600 mt-1">{progress.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Materials List */}
      {materials.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-800">
            Uploaded Materials ({materials.length})
          </h4>
            {materials.map((material, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-slate-50 rounded-md border"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getFileIcon()}
                  <span className="text-sm text-slate-700 truncate">
                    {material}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(`/api/materials/${material}`, '_blank')}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteClick(material)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}

      {materials.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-slate-500">No materials uploaded yet</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Delete Material
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>&quot;{materialToDelete}&quot;</strong>? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}