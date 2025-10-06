"use client";

import { useState } from "react";
import { Upload, Trash2, Brain, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { removeAiPdfData } from "@/actions/admin/ai-pdf-data";
import { finalizeAiPdfUpload } from "@/actions/admin/ai-pdf-data-chunked";
import { ChunkedUploader } from "@/lib/chunkedUploaderServerAction";
import { uploadPdfChunk } from "@/actions/api/pdf-upload";

interface AiPdfUploaderProps {
  packageId: string;
  packageName: string;
  currentAiPdfData: string | null;
}

export function AiPdfUploader({ packageId, currentAiPdfData }: AiPdfUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const router = useRouter();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    if (file.size > 1000 * 1024 * 1024) { // 1000MB limit
      toast.error('File size must be less than 1000MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus("Preparing upload...");

    try {
      const uploader = new ChunkedUploader(uploadPdfChunk, {
        chunkSize: 5 * 1024 * 1024, // 5MB chunks
        maxRetries: 3,
        onProgress: (progress) => {
          setUploadProgress(progress);
          setUploadStatus(`Uploading... ${Math.round(progress)}%`);
        },
        onError: (error) => {
          console.error('Chunked upload error:', error);
          toast.error(error);
          setIsUploading(false);
        },
        onSuccess: async () => {
          setUploadStatus("Finalizing upload...");
          setUploadProgress(95);
          
          // Update database with filename
          const result = await finalizeAiPdfUpload(packageId, file.name);
          
          if (result.success) {
            setUploadProgress(100);
            setUploadStatus("Upload complete!");
            toast.success('AI PDF Data uploaded successfully!');
            router.refresh();
          } else {
            throw new Error(result.message);
          }
          
          setIsUploading(false);
        }
      });

      await uploader.uploadFile(file, packageId);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload AI PDF Data');
      setIsUploading(false);
    } finally {
      event.target.value = '';
      // Clear progress after 3 seconds
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus("");
      }, 3000);
    }
  };

  const handleRemoveClick = () => {
    if (!currentAiPdfData) return;
    setDeleteModalOpen(true);
  };

  const handleRemoveConfirm = async () => {
    setIsRemoving(true);

    try {
      const result = await removeAiPdfData(packageId);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      toast.success('AI PDF Data removed successfully!');
      router.refresh();
    } catch (error) {
      console.error('Remove error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove AI PDF Data');
    } finally {
      setIsRemoving(false);
      setDeleteModalOpen(false);
    }
  };

  const handleRemoveCancel = () => {
    setDeleteModalOpen(false);
  };

  return (
    <Card className="shadow-sm border-0 bg-gradient-to-br from-purple-50 to-blue-50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-purple-100 p-2">
            <Brain className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-lg text-slate-800">AI PDF Data</CardTitle>
            <p className="text-sm text-slate-600">Upload PDF for AI-powered course assistance</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current AI PDF Status */}
        {currentAiPdfData ? (
          <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-slate-800">AI PDF Data Active</p>
                <p className="text-xs text-slate-600">{currentAiPdfData}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                Ready
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRemoveClick}
                disabled={isRemoving}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          /* Upload Section */
          <div className="space-y-4">
            <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors bg-white/50">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id={`ai-pdf-upload-${packageId}`}
              />
              <label
                htmlFor={`ai-pdf-upload-${packageId}`}
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <div className="rounded-full bg-purple-100 p-4">
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                  ) : (
                    <Upload className="h-8 w-8 text-purple-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {isUploading ? 'Processing AI PDF Data...' : 'Upload AI PDF Data'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PDF files only • Max 1000MB
                  </p>
                </div>
              </label>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="bg-white/70 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-800">
                    {uploadStatus}
                  </span>
                  <span className="text-sm text-slate-600">
                    {Math.round(uploadProgress)}%
                  </span>
                </div>
                <Progress 
                  value={uploadProgress} 
                  className="h-2"
                />
              </div>
            )}
          </div>
        )}

      </CardContent>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Remove AI PDF Data
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove the AI PDF Data? 
              This action cannot be undone and will disable AI-powered course assistance.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleRemoveCancel}
              disabled={isRemoving}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveConfirm}
              disabled={isRemoving}
              className="w-full sm:w-auto"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove AI PDF Data
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}