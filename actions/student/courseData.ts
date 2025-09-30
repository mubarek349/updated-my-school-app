/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "@/lib/db";


// Define the CourseMaterial type
interface CourseMaterial {
  name: string;
  url: string;
  type: string;
}

export async function getCourseMaterials(coursePackageId: string) {
  try {
    const course = await prisma.coursePackage.findUnique({
      where: { id: coursePackageId },
      select: { courseMaterials: true },
    });

    const raw = course?.courseMaterials ?? [];

    // If courseMaterials is a single comma-separated string, split it
    const items: string[] = Array.isArray(raw)
      ? raw
      : typeof raw === "string"
      ? raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const parsed: CourseMaterial[] = items.map((item) => {
      try {
        const obj = JSON.parse(item as unknown as string);
        if (obj && typeof obj === "object" && (obj as any).url) {
          const filename = (obj as any).url as string;
          const name = (obj as any).name ?? filename.split("/").pop() ?? "material";
          const type = ((obj as any).type ?? filename.split(".").pop() ?? "file")
            .toString()
            .toLowerCase();
          const url = `/api/materials/${encodeURIComponent(filename)}`;
          return { name, url, type };
        }
        // If parsed but not as expected, fall back to treating it as a filename
        const filename = String(item);
        return {
          name: filename.split("/").pop() ?? "material",
          url: `/api/materials/${encodeURIComponent(filename)}`,
          type: filename.split(".").pop() ?? "file",
        };
      } catch {
        // Backward compatibility: previously stored plain filenames in the array or comma-separated
        const filename = String(item);
        return {
          name: filename.split("/").pop() ?? "material",
          url: `/api/materials/${encodeURIComponent(filename)}`,
          type: filename.split(".").pop() ?? "file",
        };
      }
    });

    return parsed;
  } catch (error) {
    console.error("Error fetching course materials:", error);
    return [];
  }
}

// ---------------- Announcements ----------------
export async function addAnnouncement(courseId: string, description: string) {
  try {
    if (!courseId || !description?.trim()) {
      return { success: false, error: "Invalid payload" };
    }
    const created = await prisma.announcement.create({
      data: {
        coursesPackageId: courseId,
        anouncementDescription: description.trim(),
      },
      select: { id: true },
    });
    return { success: true, id: created.id };
  } catch (error) {
    console.error("Error adding announcement:", error);
    return { success: false, error: "Failed to add announcement" };
  }
}

export async function getAnnouncements(courseId: string) {
  try {
    if (!courseId) return [];
    const items = await prisma.announcement.findMany({
      where: { coursesPackageId: courseId },
      orderBy: { createdAt: "desc" },
      select: { id: true, anouncementDescription: true, createdAt: true },
    });
    return items;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
}

// ---------------- Feedback ----------------
export async function addFeedback(
  coursePackageId: string,
  studentId: number,
  feedback: string,
  rating: number
) {
  try {
    if (!coursePackageId || !feedback?.trim() || !rating) {
      return { success: false, error: "Invalid payload" };
    }
    
    const existingFeedback = await prisma.feedback.findFirst({
      where: { coursePackageId, studentId }
    });
    
    if (existingFeedback) {
      await prisma.feedback.update({
        where: { id: existingFeedback.id },
        data: {
          feedback: feedback.trim(),
          rating: Number(Math.max(1, Math.min(5, Math.round(Number(rating))))),
        },
      });
    } else {
      await prisma.feedback.create({
        data: {
          coursePackageId,
          studentId,
          feedback: feedback.trim(),
          rating: Number(Math.max(1, Math.min(5, Math.round(Number(rating))))),
        },
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error adding feedback:", error);
    return { success: false, error: "Failed to add feedback" };
  }
}

export async function getFeedback(coursePackageId: string) {
  try {
    if (!coursePackageId) return [];
    const items = await prisma.feedback.findMany({
      where: { coursePackageId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        feedback: true,
        rating: true,
        createdAt: true,
        student: { select: { name: true } },
      },
    });
    return items;
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return [];
  }
}

export async function getAverageRating(coursePackageId: string) {
  try {
    if (!coursePackageId) return { average: 0, count: 0 };
    const result = await prisma.feedback.aggregate({
      where: { coursePackageId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return {
      average: Number(result._avg.rating ?? 0),
      count: Number(result._count.rating ?? 0),
    };
  } catch (error) {
    console.error("Error calculating average rating:", error);
    return { average: 0, count: 0 };
  }
}
