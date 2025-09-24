import { NextRequest, NextResponse } from "next/server";
import { createAnnouncement } from "@/actions/admin/announcements";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const result = await createAnnouncement(data);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Error in announcements API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}