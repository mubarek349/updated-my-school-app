"use server";

import prisma from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface Ustaz {
  id: number;
  ustazname: string;
  phoneno: string;
  permissioned: boolean;
  chat_id: string;
  _count?: {
    qandAResponse: number;
  };
}

export interface CreateUstazData {
  ustazname: string;
  phoneno: string;
  passcode?: string;
}

export interface UpdateUstazData {
  ustazname: string;
  phoneno: string;
  passcode: string;
}

// Fetch all ustazs
export async function getUstazs(): Promise<{ success: boolean; data?: Ustaz[]; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "No session found" };
    }

    if ((session.user as any).userType !== "admin") {
      return { 
        success: false, 
        error: "Admin access required",
        currentUserType: (session.user as any).userType
      };
    }

    const ustazs = await prisma.responseUstaz.findMany({
      select: {
        id: true,
        ustazname: true,
        phoneno: true,
        permissioned: true,
        chat_id: true,
        _count: {
          select: {
            qandAResponse: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return { success: true, data: ustazs };
  } catch (error) {
    console.error("Error fetching ustazs:", error);
    return { success: false, error: "Failed to fetch ustazs" };
  }
}

// Create new ustaz
export async function createUstaz(data: CreateUstazData): Promise<{ success: boolean; data?: Ustaz; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).userType !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const { ustazname, phoneno, passcode } = data;

    if (!ustazname || !phoneno) {
      return { success: false, error: "Missing required fields" };
    }

    // Check if phone number already exists
    const existingUstaz = await prisma.responseUstaz.findFirst({
      where: { phoneno },
    });

    if (existingUstaz) {
      return { success: false, error: "Phone number already exists" };
    }

    // Generate a unique passcode if not provided
    let finalPasscode = passcode;
    if (!finalPasscode) {
      // Generate a random 6-digit passcode
      finalPasscode = Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Check if passcode already exists and generate a new one if needed
    let passcodeExists = true;
    let attempts = 0;
    const maxAttempts = 10;

    while (passcodeExists && attempts < maxAttempts) {
      const existingPasscode = await prisma.responseUstaz.findFirst({
        where: { passcode: finalPasscode },
      });

      if (!existingPasscode) {
        passcodeExists = false;
      } else {
        // Generate a new passcode
        finalPasscode = Math.floor(100000 + Math.random() * 900000).toString();
        attempts++;
      }
    }

    if (passcodeExists) {
      return { success: false, error: "Unable to generate unique passcode. Please try again." };
    }

    const newUstaz = await prisma.responseUstaz.create({
      data: {
        ustazname,
        phoneno,
        passcode: finalPasscode,
        permissioned: true,
        chat_id: `ustaz_${Date.now()}`, // Generate a unique chat_id
      },
      select: {
        id: true,
        ustazname: true,
        phoneno: true,
        permissioned: true,
        chat_id: true,
        _count: {
          select: {
            qandAResponse: true,
          },
        },
      },
    });

    revalidatePath("/en/admin/ustazs");
    return { success: true, data: newUstaz };
  } catch (error) {
    console.error("Error creating ustaz:", error);
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return { success: false, error: "Duplicate data detected. Please try again." };
      }
    }
    
    return { success: false, error: "Failed to create ustaz" };
  }
}

// Update ustaz
export async function updateUstaz(ustazId: number, data: UpdateUstazData): Promise<{ success: boolean; data?: Ustaz; error?: string }> {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as any).userType !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const { ustazname, phoneno, passcode } = data;

    if (!ustazname || !phoneno || !passcode) {
      return { success: false, error: "Missing required fields" };
    }

    // Check if phone number already exists for another ustaz
    const existingUstaz = await prisma.responseUstaz.findFirst({
      where: { 
        phoneno,
        NOT: { id: ustazId }
      },
    });

    if (existingUstaz) {
      return { success: false, error: "Phone number already exists" };
    }

    const updatedUstaz = await prisma.responseUstaz.update({
      where: { id: ustazId },
      data: {
        ustazname,
        phoneno,
        passcode,
      },
      select: {
        id: true,
        ustazname: true,
        phoneno: true,
        permissioned: true,
        chat_id: true,
        _count: {
          select: {
            qandAResponse: true,
          },
        },
      },
    });

    revalidatePath("/en/admin/ustazs");
    return { success: true, data: updatedUstaz };
  } catch (error) {
    console.error("Error updating ustaz:", error);
    return { success: false, error: "Failed to update ustaz" };
  }
}

// Toggle ustaz permission
export async function toggleUstazPermission(ustazId: number, permissioned: boolean): Promise<{ success: boolean; data?: Ustaz; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).userType !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const updatedUstaz = await prisma.responseUstaz.update({
      where: { id: ustazId },
      data: {
        permissioned,
      },
      select: {
        id: true,
        ustazname: true,
        phoneno: true,
        permissioned: true,
        chat_id: true,
        _count: {
          select: {
            qandAResponse: true,
          },
        },
      },
    });

    revalidatePath("/en/admin/ustazs");
    return { success: true, data: updatedUstaz };
  } catch (error) {
    console.error("Error updating ustaz permission:", error);
    return { success: false, error: "Failed to update ustaz permission" };
  }
}

// Delete ustaz
export async function deleteUstaz(ustazId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as any).userType !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    // Check if ustaz has existing responses
    const ustazWithResponses = await prisma.responseUstaz.findUnique({
      where: { id: ustazId },
      include: {
        _count: {
          select: {
            qandAResponse: true,
          },
        },
      },
    });

    if (!ustazWithResponses) {
      return { success: false, error: "Ustaz not found" };
    }

    if (ustazWithResponses._count.qandAResponse > 0) {
      return { success: false, error: "Cannot delete ustaz with existing responses" };
    }

    await prisma.responseUstaz.delete({
      where: { id: ustazId },
    });

    revalidatePath("/en/admin/ustazs");
    return { success: true };
  } catch (error) {
    console.error("Error deleting ustaz:", error);
    return { success: false, error: "Failed to delete ustaz" };
  }
}
