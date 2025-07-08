import { NextRequest, NextResponse } from "next/server";
import { getControllerStudents } from "@/actions/controller/controller";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json(
      { error: "Missing controller code" },
      { status: 400 }
    );
  }
  try {
    const students = await getControllerStudents(code);
    return NextResponse.json({ students });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
