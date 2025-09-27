/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ responseId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as any).userType !== "ustaz") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const responseId = resolvedParams.responseId;
    const { response } = await request.json();

    if (!response?.trim()) {
      return NextResponse.json({ error: "Response is required" }, { status: 400 });
    }

    const updatedResponse = await prisma.qandAResponse.update({
      where: { 
        id: responseId
      },
      data: { response: response.trim() }
    });

    return NextResponse.json(updatedResponse);
  } catch (error) {
    console.error("Error updating response:", error);
    return NextResponse.json({ error: "Failed to update response" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ responseId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as any).userType !== "ustaz") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const responseId = resolvedParams.responseId;

    await prisma.qandAResponse.delete({
      where: { 
        id: responseId
      }
    });

    return NextResponse.json({ message: "Response deleted successfully" });
  } catch (error) {
    console.error("Error deleting response:", error);
    return NextResponse.json({ error: "Failed to delete response" }, { status: 500 });
  }
}