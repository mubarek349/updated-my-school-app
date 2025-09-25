"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const announcementSchema = z.object({
  coursePackageId: z.string().min(1, "Course package is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
});

export async function createAnnouncement(
  data: z.infer<typeof announcementSchema>
) {
  try {
    const validatedData = announcementSchema.parse(data);

    // Verify course package exists
    const coursePackage = await prisma.coursePackage.findUnique({
      where: { id: validatedData.coursePackageId },
    });

    if (!coursePackage) {
      return { success: false, message: "Course package not found" };
    }

    await prisma.announcement.create({
      data: {
        coursesPackageId: validatedData.coursePackageId,
        anouncementDescription: validatedData.description,
      },
    });

    revalidatePath("/en/admin/announcements");
    return { success: true, message: "Announcement created successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }
    console.error("Error creating announcement:", error);
    return { success: false, message: "Failed to create announcement" };
  }
}

export async function getAnnouncements() {
  try {
    const announcements = await prisma.announcement.findMany({
      include: {
        coursePackage: {
          select: {
            name: true,
            isPublished: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: announcements };
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return { success: false, message: "Failed to fetch announcements" };
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    await prisma.announcement.delete({
      where: { id },
    });

    revalidatePath("/en/admin/announcements");
    return { success: true, message: "Announcement deleted successfully" };
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return { success: false, message: "Failed to delete announcement" };
  }
}

export async function updateAnnouncement(
  id: string,
  data: { description: string }
) {
  try {
    const validatedData = z
      .object({
        description: z
          .string()
          .min(1, "Description is required")
          .max(500, "Description must be less than 500 characters"),
      })
      .parse(data);

    await prisma.announcement.update({
      where: { id },
      data: { anouncementDescription: validatedData.description },
    });

    revalidatePath("/en/admin/announcements");
    return { success: true, message: "Announcement updated successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }
    console.error("Error updating announcement:", error);
    return { success: false, message: "Failed to update announcement" };
  }
}

export async function getCoursePackagesForAnnouncements() {
  try {
    const packages = await prisma.coursePackage.findMany({
      select: {
        id: true,
        name: true,
        isPublished: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, data: packages };
  } catch (error) {
    console.error("Error fetching course packages:", error);
    return { success: false, message: "Failed to fetch course packages" };
  }
}
