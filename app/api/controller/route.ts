import { NextRequest, NextResponse } from "next/server";
import { getStudentAnalyticsperPackageForController } from "@/actions/controller/controller";

// GET /api/controller?search=...&page=...&perPage=...&progress=...
export async function GET(req: NextRequest) {
  // Get query params
  const searchTerm = req.nextUrl.searchParams.get("search") || undefined;
  const currentPage = req.nextUrl.searchParams.get("page")
    ? Number(req.nextUrl.searchParams.get("page"))
    : undefined;
  const itemsPerPage = req.nextUrl.searchParams.get("perPage")
    ? Number(req.nextUrl.searchParams.get("perPage"))
    : undefined;
  const progressFilter = req.nextUrl.searchParams.get("progress") as
    | "notstarted"
    | "inprogress"
    | "completed"
    | "all"
    | undefined;

  try {
    const data = await getStudentAnalyticsperPackageForController(
      searchTerm,
      currentPage,
      itemsPerPage,
      progressFilter
    );
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 401 }
    );
  }
}
