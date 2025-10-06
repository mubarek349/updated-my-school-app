/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

interface ChunkedUploaderOptions {
  chunkSize?: number; // in bytes, default to 5MB
  maxRetries?: number;
  onProgress?: (progress: number) => void;
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

export class ChunkedUploader {
  private chunkSize: number;
  private maxRetries: number;
  private onProgress: (progress: number) => void;
  private onError: (error: string) => void;
  private onSuccess: () => void;
  private uploadAction: (formData: FormData) => Promise<any>;

  constructor(uploadAction: (formData: FormData) => Promise<any>, options?: ChunkedUploaderOptions) {
    this.uploadAction = uploadAction;
    this.chunkSize = options?.chunkSize || 5 * 1024 * 1024; // Default 5MB
    this.maxRetries = options?.maxRetries || 3;
    this.onProgress = options?.onProgress || (() => {});
    this.onError = options?.onError || (() => {});
    this.onSuccess = options?.onSuccess || (() => {});
  }

  async uploadFile(file: File, packageId: string): Promise<{ success: boolean; filename?: string; error?: string }> {
    const totalChunks = Math.ceil(file.size / this.chunkSize);
    let uploadedBytes = 0;
    const fileId = `${file.name}-${file.size}-${Date.now()}`; // Unique ID for this upload session

    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.chunkSize;
      const end = Math.min(start + this.chunkSize, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("filename", file.name);
      formData.append("chunkIndex", i.toString());
      formData.append("totalChunks", totalChunks.toString());
      formData.append("fileId", fileId);
      formData.append("packageId", packageId); // Pass packageId with each chunk

      let attempt = 0;
      let chunkUploaded = false;

      while (attempt < this.maxRetries && !chunkUploaded) {
        try {
          const response = await this.uploadAction(formData);

          if (!response.success) {
            throw new Error(response.error || `Upload failed for chunk ${i}`);
          }

          uploadedBytes += chunk.size;
          const progress = (uploadedBytes / file.size) * 100;
          this.onProgress(progress);
          chunkUploaded = true;

          if (i === totalChunks - 1) {
            this.onSuccess();
            return { success: true, filename: file.name };
          }
        } catch (error: any) {
          console.error(`Error uploading chunk ${i} (attempt ${attempt + 1}):`, error);
          attempt++;
          if (attempt >= this.maxRetries) {
            this.onError(`Failed to upload chunk ${i} after ${this.maxRetries} attempts.`);
            return { success: false, error: `Failed to upload chunk ${i}` };
          }
          // Optional: Add a delay before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    return { success: true, filename: file.name }; // Should be caught by onSuccess above
  }
}
