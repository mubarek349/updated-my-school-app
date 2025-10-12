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