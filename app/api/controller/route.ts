import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // NextAuth v5's auth() helper
import { getStudentAnalyticsperPackageForEachController } from "@/actions/controller/controller";

export async function GET(req: NextRequest) {
  // 1. Authenticate the user (NextAuth v5)
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized: No session or missing user ID" },
      { status: 401 }
    );
  }

  // 2. Extract query params
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

  // 3. Fetch data for the authenticated controller
  try {
    const data = await getStudentAnalyticsperPackageForEachController(
      searchTerm,
      currentPage,
      itemsPerPage,
      progressFilter,
      Number(session.user.id) // Ensure ID is a number
    );
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error:  "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
