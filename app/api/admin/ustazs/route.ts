import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

// GET - Fetch all ustazs
export async function GET() {
  try {
    const session = await auth();
    console.log("Admin ustazs API session:", session);
    
    if (!session?.user) {
      console.log("No session or user found");
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    if ((session.user as any).userType !== "admin") {
      console.log("User is not admin, userType:", (session.user as any).userType);
      return NextResponse.json({ 
        error: "Admin access required", 
        currentUserType: (session.user as any).userType 
      }, { status: 401 });
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

    return NextResponse.json(ustazs);
  } catch (error) {
    console.error("Error fetching ustazs:", error);
    return NextResponse.json(
      { error: "Failed to fetch ustazs" },
      { status: 500 }
    );
  }
}

// POST - Create new ustaz
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as any).userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ustazname, phoneno, passcode } = body;

    if (!ustazname || !phoneno || !passcode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if phone number already exists
    const existingUstaz = await prisma.responseUstaz.findFirst({
      where: { phoneno },
    });

    if (existingUstaz) {
      return NextResponse.json(
        { error: "Phone number already exists" },
        { status: 400 }
      );
    }

    const newUstaz = await prisma.responseUstaz.create({
      data: {
        ustazname,
        phoneno,
        passcode,
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

    return NextResponse.json(newUstaz, { status: 201 });
  } catch (error) {
    console.error("Error creating ustaz:", error);
    return NextResponse.json(
      { error: "Failed to create ustaz" },
      { status: 500 }
    );
  }
}