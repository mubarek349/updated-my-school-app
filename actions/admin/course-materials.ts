"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function updateCourseMaterials(packageId: string, materials: string) {
  try {
    await prisma.coursePackage.update({
      where: { id: packageId },
      data: { courseMaterials: materials },
    });

    revalidatePath("/en/admin/courseMaterials");
    return { success: true, message: "Course materials updated successfully" };
  } catch (error) {
    console.error("Error updating course materials:", error);
    return { success: false, message: "Failed to update course materials" };
  }
}

export async function uploadCourseMaterial(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const packageId = formData.get("packageId") as string;

    if (!file || !packageId) {
      return { success: false, message: "File and package ID are required" };
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads", "materials");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'pdf';
    const filename = `${timestamp}-${Math.floor(Math.random() * 100000)}.${ext}`;
    const filepath = join(uploadsDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    return { success: true, filename, message: "File uploaded successfully" };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { success: false, message: "Failed to upload file" };
  }
}

export async function deleteCourseMaterial(packageId: string, filename: string) {
  try {
    // Get current materials
    const coursePackage = await prisma.coursePackage.findUnique({
      where: { id: packageId },
      select: { courseMaterials: true },
    });

    if (!coursePackage) {
      return { success: false, message: "Course package not found" };
    }

    // Remove filename from materials list
    const currentMaterials = coursePackage.courseMaterials?.split(',').filter(Boolean) || [];
    const updatedMaterials = currentMaterials.filter(m => m !== filename);

    // Update database
    await prisma.coursePackage.update({
      where: { id: packageId },
      data: { courseMaterials: updatedMaterials.join(',') },
    });

    revalidatePath("/en/admin/courseMaterials");
    return { success: true, message: "Material deleted successfully" };
  } catch (error) {
    console.error("Error deleting material:", error);
    return { success: false, message: "Failed to delete material" };
  }
}

export async function getCoursePackages() {
  try {
    const packages = await prisma.coursePackage.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        courseMaterials: true,
        isPublished: true,
        _count: {
          select: {
            courses: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: packages };
  } catch (error) {
    console.error("Error fetching course packages:", error);
    return { success: false, message: "Failed to fetch course packages" };
  }
}