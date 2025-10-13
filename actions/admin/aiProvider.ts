"use server";

import prisma from "@/lib/db";
import { AIProvider } from "@/lib/ask";

export async function updateAiProvider(packageId: string, aiProvider: string) {
  try {
    await prisma.coursePackage.update({
      where: { id: packageId },
      data: { aiProvider: aiProvider as AIProvider },
    });
  } catch (error) {
    console.error("Error updating AI provider:", error);
    return { success: false, message: "Failed to update AI provider" };
  }

  return { success: true, message: "AI provider updated successfully" };
}

export async function getCurrentAiProvider(packageId: string) {
    try {
      const aiProvider=await prisma.coursePackage.findFirst({
        where: { id: packageId },
        select:{
            aiProvider:true,
        }
      });
      return aiProvider?.aiProvider;
    } catch (error) {
      console.error("Error getting AI provider:", error);
      return { success: false, message: "Failed to getting AI provider" };
    }
  }
  export async function getCurrentAiPdfData(packageId: string) {
    try {
      const aiPdfData=await prisma.coursePackage.findFirst({
        where: { id: packageId },
        select:{
            aiPdfData:true,
        }
      });
      return aiPdfData?.aiPdfData;
    } catch (error) {
      console.error("Error getting AI PDF data:", error);
      return { success: false, message: "Failed to getting AI PDF data" };
    }
  }