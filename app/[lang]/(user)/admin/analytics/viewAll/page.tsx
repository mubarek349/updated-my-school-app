"use client";
import React, { useState } from "react";
import {
  getStudentAnalyticsperPackage,
  getAvailablePackagesForStudent,
} from "@/actions/admin/analysis";
import useAction from "@/hooks/useAction";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CustomViewAllTable from "@/components/custom/admin/custom-view-all-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

function Page() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [progressFilter, setProgressFilter] = useState<
    "notstarted" | "inprogress" | "completed" | ""
  >("");
  const [statusFilter, setStatusFilter] = useState<
    "notstarted" | "inprogress" | "failed" | "passed" | ""
  >("");
  const [lastSeenFilter, setLastSeenFilter] = useState<
    "today" | "1day" | "2days" | "3days" | "3plus" | ""
  >("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [data, , isLoading] = useAction(
    getStudentAnalyticsperPackage,
    [true, () => {}],
    searchTerm,
    currentPage,
    itemsPerPage,
    progressFilter || undefined, // Pass undefined if no filter selected
    statusFilter || undefined, // Pass undefined if no filter selected
    lastSeenFilter || undefined // Pass undefined if no filter selected
  );

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "isKid", label: "Is Kid" },
    { key: "phoneNo", label: "Phone Number" },
    { key: "tglink", label: "Tg" },
    { key: "whatsapplink", label: "Wa" },
    { key: "ustazname", label: "Ustaz Name" },
    { key: "activePackage", label: "activePackage" },
    { key: "studentProgress", label: "Student Progress" },
    { key: "lastseen", label: "Last Seen " },
    { key: "finalExamStatus", label: "Final Exam Status" },
    { key: "result", label: "Result" },
    { key: "attendances", label: "Attendances" },
  ];

  const handleActivePackageClick = async (studentId: string) => {
    const id = parseInt(studentId);
    const studentName = rows.find((row) => row.id === studentId)?.name || "";
    setSelectedStudentId(id);
    setSelectedStudentName(studentName);
    try {
      const packages = await getAvailablePackagesForStudent(id);
      setAvailablePackages(packages);
      setIsPackageDialogOpen(true);
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  const rows =
    data && "data" in data
      ? data.data.map((row) => ({
          id: String(row?.id ?? ""),
          name: row?.name ?? "",
          isKid: row?.isKid ? "Yes" : "No",
          phoneNo: row?.phoneNo ?? "-",
          tglink: row?.tglink ?? "-",
          whatsapplink: row?.whatsapplink ?? "-",
          activePackage: row?.activePackage ?? "",
          studentProgress: row?.studentProgress ?? "",
          lastseen: row?.lastseen ?? "",
          ustazname: row?.ustazname ?? "",
          finalExamStatus: row?.hasFinalExam
            ? row.isUpdateProhibited
              ? row.result?.score >= 0.75
                ? "Passed"
                : "Failed"
              : "In Progress"
            : "Not Started",
          result: row?.hasFinalExam
            ? row.result &&
              `${row.result.score * 100}% አግኝተዋል -> ${row.result.correct}/${
                row.result.total
              } በመመለስ`
            : "-",
          attendances: row?.attendances ?? "",
        }))
      : [];
  console.log("rows", rows);
  return (
    <div className="m-2 overflow-y-auto">
      <Link
        href="/en/admin/analytics"
        className="flex items-center text-sm hover:opacity-75 transition mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Analytics
      </Link>
      <h1 className="text-xl font-bold mb-1">Student Progress In Package</h1>
      {/* Progress Filter */}
      <div className="m-1">
        <label className="mr-2 font-medium">Filter by Progress:</label>
        <select
          value={progressFilter}
          onChange={(e) => {
            setProgressFilter(
              e.target.value as "notstarted" | "inprogress" | "completed" | ""
            );
            setCurrentPage(1); // Reset page to 1 when filter changes
          }}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="">All</option>
          <option value="notstarted">Not Started</option>
          <option value="inprogress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="m-1">
        <label className="mr-2 font-medium">Filter by Final Exam Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(
              e.target.value as
                | "notstarted"
                | "inprogress"
                | "failed"
                | "passed"
                | ""
            );
            setCurrentPage(1); // Reset page to 1 when filter changes
          }}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="">All</option>
          <option value="notstarted">Not Started</option>
          <option value="inprogress">In Progress</option>
          <option value="failed">Failed</option>
          <option value="passed">Passed</option>
        </select>
      </div>
      <div className="m-1">
        <label className="mr-2 font-medium">Filter by Last Seen:</label>
        <select
          value={lastSeenFilter}
          onChange={(e) => {
            setLastSeenFilter(
              e.target.value as
                | "today"
                | "1day"
                | "2days"
                | "3days"
                | "3plus"
                | ""
            );
            setCurrentPage(1); // Reset page to 1 when filter changes
          }}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="">All</option>
          <option value="today">Today</option>
          <option value="1day">1 day ago</option>
          <option value="2days">2 days ago</option>
          <option value="3days">3 days ago</option>
          <option value="3plus">3+ days ago</option>
        </select>
      </div>
      <div>
        <CustomViewAllTable
          columns={columns}
          rows={rows}
          totalRows={data?.pagination?.totalRecords ?? rows.length}
          page={currentPage}
          pageSize={itemsPerPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={setItemsPerPage}
          searchValue={searchTerm}
          onSearch={setSearchTerm}
          isLoading={isLoading}
          onActivePackageClick={handleActivePackageClick}
        />
      </div>

      <Dialog open={isPackageDialogOpen} onOpenChange={setIsPackageDialogOpen}>
        <DialogContent className="w-[95vw] max-w-lg sm:max-w-2xl lg:max-w-4xl h-[85vh] sm:h-[80vh] p-2 sm:p-4">
          <DialogHeader className="mb-3 sm:mb-4">
            <DialogTitle className="text-sm sm:text-lg lg:text-xl font-semibold">
              Packages of {selectedStudentName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 sm:space-y-3 max-h-[70vh] overflow-y-auto">
            {availablePackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`p-2 sm:p-3 lg:p-4 border rounded-lg ${
                  pkg.isActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <h3
                      className={`text-sm sm:text-base lg:text-lg font-medium ${
                        pkg.isActive ? "text-blue-900" : "text-gray-900"
                      }`}
                    >
                      {pkg.name}
                    </h3>
                    {pkg.isActive && (
                      <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5 w-fit">
                        Active
                      </Badge>
                    )}
                  </div>

                  {pkg.status === "inprogress" && pkg.progressDetails && (
                    <div
                      className={`text-xs sm:text-sm p-2 rounded ${
                        pkg.isActive ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      <div className="font-medium mb-1">Current:</div>
                      <div className="break-words">{pkg.progressDetails}</div>
                    </div>
                  )}

                  {(pkg.status === "inprogress" ||
                    pkg.status === "completed") && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>
                          {pkg.completedChapters}/{pkg.totalChapters} chapters
                        </span>
                        <span className="font-bold">
                          {pkg.progressPercentage}%
                        </span>
                      </div>
                      <div
                        className={`h-1.5 sm:h-2 rounded-full ${
                          pkg.isActive ? "bg-blue-200" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className={`h-full rounded-full ${
                            pkg.status === "completed"
                              ? "bg-green-500"
                              : pkg.isActive
                              ? "bg-blue-600"
                              : "bg-gray-500"
                          }`}
                          style={{ width: `${pkg.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Badge
                    className={`text-xs ${
                      pkg.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : pkg.status === "inprogress"
                        ? pkg.isActive
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {pkg.status === "completed"
                      ? "✅ Done"
                      : pkg.status === "inprogress"
                      ? "🔄 Progress"
                      : "⏳ Pending"}
                  </Badge>
                </div>
              </div>
            ))}
            {availablePackages.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-3xl sm:text-5xl mb-2">
                  📦
                </div>
                <p className="text-gray-500 text-sm">No packages available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Page;
