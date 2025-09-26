/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

// PATCH - Toggle ustaz permission
export async function PATCH(
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
    const { permissioned } = body;

    if (typeof permissioned !== "boolean") {
      return NextResponse.json(
        { error: "Permission value must be a boolean" },
        { status: 400 }
      );
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

    return NextResponse.json(updatedUstaz);
  } catch (error) {
    console.error("Error updating ustaz permission:", error);
    return NextResponse.json(
      { error: "Failed to update ustaz permission" },
      { status: 500 }
    );
  }
}
