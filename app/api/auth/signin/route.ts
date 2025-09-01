import { authenticate } from "@/actions/admin/authentication";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await authenticate(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("API Authentication error:", error);
    return NextResponse.json(
      { 
        ok: false, 
        message: "Authentication failed. Please try again.",
        field: "form" 
      },
      { status: 500 }
    );
  }
}