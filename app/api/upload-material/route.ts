import { NextRequest, NextResponse } from "next/server";
import { uploadCourseMaterial } from "@/actions/admin/course-materials";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await uploadCourseMaterial(formData);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Error in upload-material API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}