"use server";

import prisma from "@/lib/db";

export async function getCoursePackages() {
  try {
    const coursePackages = await prisma.coursePackage.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        courseMaterials: true,
        aiPdfData: true,
        aiProvider: true,
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

    return { success: true, data: coursePackages };
  } catch (error) {
    console.error("Failed to fetch course packages:", error);
    
    // More specific error handling
    if (error instanceof Error) {
      return { 
        success: false, 
        error: `Database error: ${error.message}` 
      };
    }
    
    return { 
      success: false, 
      error: "Failed to fetch course packages" 
    };
  }
}