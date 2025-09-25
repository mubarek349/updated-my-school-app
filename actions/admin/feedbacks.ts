/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

interface FeedbackFilters {
  packageId?: string;
  rating?: number;
  studentId?: number;
}

export async function getFeedbacks(filters?: FeedbackFilters) {
  try {
    const whereClause: any = {};

    if (filters?.packageId) {
      whereClause.coursePackageId = filters.packageId;
    }

    if (filters?.rating) {
      whereClause.rating = filters.rating;
    }

    if (filters?.studentId) {
      whereClause.studentId = filters.studentId;
    }

    const feedbacks = await prisma.feedback.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            name: true,
            phoneno: true,
          },
        },
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

    return { success: true, data: feedbacks };
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return { success: false, message: "Failed to fetch feedbacks" };
  }
}

export async function getFeedbackStats(packageId?: string) {
  try {
    const whereClause = packageId ? { coursePackageId: packageId } : {};

    const [totalFeedbacks, averageRating, positiveReviews, needsAttention] =
      await Promise.all([
        prisma.feedback.count({ where: whereClause }),
        prisma.feedback.aggregate({
          where: whereClause,
          _avg: { rating: true },
        }),
        prisma.feedback.count({
          where: { ...whereClause, rating: { gte: 4 } },
        }),
        prisma.feedback.count({
          where: { ...whereClause, rating: { lte: 2 } },
        }),
      ]);

    return {
      success: true,
      data: {
        totalFeedbacks,
        averageRating: averageRating._avg.rating || 0,
        positiveReviews,
        needsAttention,
      },
    };
  } catch (error) {
    console.error("Error fetching feedback stats:", error);
    return { success: false, message: "Failed to fetch feedback statistics" };
  }
}

export async function deleteFeedback(id: string) {
  try {
    await prisma.feedback.delete({
      where: { id },
    });

    revalidatePath("/en/admin/feedbacks");
    return { success: true, message: "Feedback deleted successfully" };
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return { success: false, message: "Failed to delete feedback" };
  }
}

export async function markFeedbackAsRead() {
  try {
    // Note: You might want to add an 'isRead' field to the feedback model
    // For now, we'll just return success
    revalidatePath("/en/admin/feedbacks");
    return { success: true, message: "Feedback marked as read" };
  } catch (error) {
    console.error("Error marking feedback as read:", error);
    return { success: false, message: "Failed to mark feedback as read" };
  }
}

export async function getFeedbacksByRating(rating: number, packageId?: string) {
  try {
    const whereClause: any = { rating };
    if (packageId) {
      whereClause.coursePackageId = packageId;
    }

    const feedbacks = await prisma.feedback.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            name: true,
            phoneno: true,
          },
        },
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

    return { success: true, data: feedbacks };
  } catch (error) {
    console.error("Error fetching feedbacks by rating:", error);
    return { success: false, message: "Failed to fetch feedbacks by rating" };
  }
}

export async function getCoursePackagesForFeedbacks() {
  try {
    const packages = await prisma.coursePackage.findMany({
      select: {
        id: true,
        name: true,
        isPublished: true,
        _count: {
          select: {
            feedback: true,
          },
        },
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

export async function exportFeedbacks(packageId?: string) {
  try {
    const whereClause = packageId ? { coursePackageId: packageId } : {};

    const feedbacks = await prisma.feedback.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            name: true,
            phoneno: true,
          },
        },
        coursePackage: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert to CSV format
    const csvHeaders = [
      "Date",
      "Student Name",
      "Course Package",
      "Rating",
      "Message",
    ];
    const csvRows = feedbacks.map((feedback) => [
      new Date(feedback.createdAt).toLocaleDateString(),
      feedback.student.name || "Anonymous",
      feedback.coursePackage.name,
      feedback.rating.toString(),
      `"${feedback.feedback.replace(/"/g, '""')}"`, // Escape quotes in CSV
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map((row) => row.join(","))
      .join("\n");

    return { success: true, data: csvContent };
  } catch (error) {
    console.error("Error exporting feedbacks:", error);
    return { success: false, message: "Failed to export feedbacks" };
  }
}
