"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function finalizeAiPdfUpload(packageId: string, filename: string) {
  try {
    await prisma.coursePackage.update({
      where: { id: packageId },
      data: { aiPdfData: filename },
    });

    revalidatePath("/en/admin/courseMaterials");

    return {
      success: true,
      message: "AI PDF Data updated in database successfully",
    };
  } catch (error) {
    console.error("Finalize AI PDF upload error:", error);
    return {
      success: false,
      message: "Failed to update AI PDF Data in database",
    };
  }
}
