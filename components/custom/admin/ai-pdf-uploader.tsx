"use client";

import { useState } from "react";
import { Upload, Trash2, Brain, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { uploadAiPdfData, removeAiPdfData } from "@/actions/admin/ai-pdf-data";

interface AiPdfUploaderProps {
  packageId: string;
  packageName: string;
  currentAiPdfData: string | null;
}

export function AiPdfUploader({ packageId, currentAiPdfData }: AiPdfUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    if (file.size > 1000 * 1024 * 1024) { // 1000MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('packageId', packageId);

      const result = await uploadAiPdfData(formData);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      toast.success('AI PDF Data uploaded successfully!');
      router.refresh();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload AI PDF Data');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleRemove = async () => {
    if (!currentAiPdfData) return;

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
    }
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
                onClick={handleRemove}
                disabled={isRemoving}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {isRemoving ? 'Removing...' : 'Remove'}
              </Button>
            </div>
          </div>
        ) : (
          /* Upload Section */
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
                <Upload className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {isUploading ? 'Processing AI PDF Data...' : 'Upload AI PDF Data'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  PDF files only • Max 10MB
                </p>
              </div>
            </label>
          </div>
        )}

      
      </CardContent>
    </Card>
  );
}