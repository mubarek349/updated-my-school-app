"use client";

import { useState } from "react";
import { Upload, FileText, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { uploadCourseMaterial, updateCourseMaterials } from "@/actions/admin/course-materials";

interface CourseMaterialsManagerProps {
  packageId: string;
  packageName: string;
  initialMaterials: string | null;
}

export function CourseMaterialsManager({
  packageId,
  initialMaterials,
}: CourseMaterialsManagerProps) {
  const [materials, setMaterials] = useState<string[]>(
    initialMaterials ? initialMaterials.split(',').filter(Boolean) : []
  );
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedFiles: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('packageId', packageId);

        const result = await uploadCourseMaterial(formData);
        
        if (!result.success) {
          throw new Error(result.message);
        }

        uploadedFiles.push(result.filename!);
      }

      const updatedMaterials = [...materials, ...uploadedFiles];
      setMaterials(updatedMaterials);

      // Update database
      const updateResult = await updateCourseMaterials(packageId, updatedMaterials.join(','));
      
      if (!updateResult.success) {
        throw new Error(updateResult.message);
      }

      toast.success(`${uploadedFiles.length} file(s) uploaded successfully!`);
      router.refresh();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload files');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleDeleteMaterial = async (filename: string) => {
    try {
      const updatedMaterials = materials.filter(m => m !== filename);
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
    }
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
            <Upload className="h-6 w-6 text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">
              {isUploading ? 'Uploading...' : 'Upload Materials'}
            </p>
            <p className="text-xs text-slate-500">
              PDF, PPT, DOC, XLS files supported
            </p>
          </div>
        </label>
      </div>

      {/* Materials List */}
      {materials.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-800">
            Uploaded Materials ({materials.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
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
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteMaterial(material)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {materials.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-slate-500">No materials uploaded yet</p>
        </div>
      )}
    </div>
  );
}