/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

// PUT - Update ustaz
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ ustazId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as any).userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const ustazId = parseInt(resolvedParams.ustazId);
    if (isNaN(ustazId)) {
      return NextResponse.json({ error: "Invalid ustaz ID" }, { status: 400 });
    }

    const body = await request.json();
    const { ustazname, phoneno, passcode } = body;

    if (!ustazname || !phoneno || !passcode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if phone number already exists for another ustaz
    const existingUstaz = await prisma.responseUstaz.findFirst({
      where: { 
        phoneno,
        NOT: { id: ustazId }
      },
    });

    if (existingUstaz) {
      return NextResponse.json(
        { error: "Phone number already exists" },
        { status: 400 }
      );
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

    return NextResponse.json(updatedUstaz);
  } catch (error) {
    console.error("Error updating ustaz:", error);
    return NextResponse.json(
      { error: "Failed to update ustaz" },
      { status: 500 }
    );
  }
}

// DELETE - Delete ustaz
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ ustazId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as any).userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const ustazId = parseInt(resolvedParams.ustazId);
    if (isNaN(ustazId)) {
      return NextResponse.json({ error: "Invalid ustaz ID" }, { status: 400 });
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
      return NextResponse.json({ error: "Ustaz not found" }, { status: 404 });
    }

    if (ustazWithResponses._count.qandAResponse > 0) {
      return NextResponse.json(
        { error: "Cannot delete ustaz with existing responses" },
        { status: 400 }
      );
    }

    await prisma.responseUstaz.delete({
      where: { id: ustazId },
    });

    return NextResponse.json({ message: "Ustaz deleted successfully" });
  } catch (error) {
    console.error("Error deleting ustaz:", error);
    return NextResponse.json(
      { error: "Failed to delete ustaz" },
      { status: 500 }
    );
  }
}