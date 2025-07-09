import { NextRequest, NextResponse } from "next/server";
import { getStudentAnalyticsperPackageForEachController } from "@/actions/controller/controller";

// GET /api/controller/[id]?search=...&page=...&perPage=...&progress=...
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const controllerId = Number(params.id);
  if (!controllerId) {
    return NextResponse.json(
      { error: "Missing or invalid controller ID" },
      { status: 400 }
    );
  }

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
    const data = await getStudentAnalyticsperPackageForEachController(
      searchTerm,
      currentPage,
      itemsPerPage,
      progressFilter,
      controllerId // Pass the controller ID to your function
    );
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 401 }
    );
  }
}
