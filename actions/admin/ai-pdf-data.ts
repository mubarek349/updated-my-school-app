"use server";

import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";

export async function uploadAiPdfData(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const packageId = formData.get("packageId") as string;

    if (!file || !packageId) {
      return { success: false, message: "Missing file or package ID" };
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return { success: false, message: "Only PDF files are allowed" };
    }

    // Validate file size (10MB limit)
    if (file.size > 1000 * 1024 * 1024) {
      return { success: false, message: "File size must be less than 1000MB" };
    }

    // Generate unique filename
    const filename = `ai-pdf-${randomUUID()}.pdf`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), "docs", "ai-pdfs");

    try {
      await writeFile(join(uploadDir, filename), buffer);
    } catch {
      // If directory doesn't exist, create it and try again
      const { mkdir } = await import("fs/promises");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(join(uploadDir, filename), buffer);
    }

    // Update database
    await prisma.coursePackage.update({
      where: { id: packageId },
      data: { aiPdfData: filename },
    });

    revalidatePath("/en/admin/courseMaterials");

    return {
      success: true,
      message: "AI PDF Data uploaded successfully",
      filename,
    };
  } catch (error) {
    console.error("AI PDF upload error:", error);
    return {
      success: false,
      message: "Failed to upload AI PDF Data",
    };
  }
}

export async function removeAiPdfData(packageId: string) {
  try {
    // Get current AI PDF data
    const coursePackage = await prisma.coursePackage.findUnique({
      where: { id: packageId },
      select: { aiPdfData: true },
    });

    if (!coursePackage?.aiPdfData) {
      return { success: false, message: "No AI PDF Data found" };
    }

    // Remove file from filesystem
    const filePath = join(
      process.cwd(),
      "docs",
      "ai-pdfs",
      coursePackage.aiPdfData
    );

    try {
      await unlink(filePath);
    } catch (error) {
      console.warn("File not found on filesystem:", error);
      // Continue with database update even if file doesn't exist
    }

    // Update database
    await prisma.coursePackage.update({
      where: { id: packageId },
      data: { aiPdfData: null },
    });

    revalidatePath("/en/admin/courseMaterials");

    return {
      success: true,
      message: "AI PDF Data removed successfully",
    };
  } catch (error) {
    console.error("AI PDF removal error:", error);
    return {
      success: false,
      message: "Failed to remove AI PDF Data",
    };
  }
}
