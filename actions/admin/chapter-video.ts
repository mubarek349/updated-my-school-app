/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "@/lib/db";

interface UpdateChapterVideoResult {
  success: boolean;
  chapter?: any;
  error?: string;
}

export async function updateChapterVideo(
  chapterId: string,
  customVideo: string | null
): Promise<UpdateChapterVideoResult> {
  try {
    console.log("Video update request:", { chapterId, customVideo });

    if (!chapterId) {
      return {
        success: false,
        error: "Chapter ID is required"
      };
    }

    // Allow customVideo to be null for removal
    if (customVideo === undefined) {
      return {
        success: false,
        error: "customVideo field is required (can be null for removal)"
      };
    }

    // Test database connection first
    try {
      await prisma.$connect();
      console.log("Database connected successfully");
    } catch (dbError) {
      console.error("Database connection failed:", dbError);
      return {
        success: false,
        error: "Database connection failed"
      };
    }

    // Check if chapter exists first
    const existingChapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { id: true, customVideo: true }
    });

    if (!existingChapter) {
      return {
        success: false,
        error: "Chapter not found"
      };
    }

    console.log("Existing chapter:", existingChapter);

    // Update the chapter with timeout protection
    const updatePromise = prisma.chapter.update({
      where: {
        id: chapterId,
      },
      data: {
        customVideo: customVideo,
      },
    });

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Database operation timeout")), 15000);
    });

    const chapter = await Promise.race([updatePromise, timeoutPromise]);

    console.log("Chapter updated successfully:", chapter);

    return { success: true, chapter };
  } catch (error) {
    console.error("Error updating chapter video:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        return {
          success: false,
          error: "Database operation timeout"
        };
      }
      if (error.message.includes("connection") || error.message.includes("ECONNREFUSED")) {
        return {
          success: false,
          error: "Database connection error"
        };
      }
      if (error.message.includes("PrismaClientKnownRequestError")) {
        return {
          success: false,
          error: "Database query error"
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  } finally {
    // Ensure connection is closed
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting from database:", disconnectError);
    }
  }
}
