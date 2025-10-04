"use client";
import React, { useState } from "react";
import {
  getStudentAnalyticsperPackage,
  getAvailablePackagesForStudent,
} from "@/actions/admin/analysis";
import useAction from "@/hooks/useAction";
import Link from "next/link";
import { ArrowLeft, Filter, BookOpen } from "lucide-react";
import CustomViewAllTable from "@/components/custom/admin/custom-view-all-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  const [tefsirFilter, setTefsirFilter] = useState<boolean>(false);
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
    lastSeenFilter || undefined, // Pass undefined if no filter selected
    tefsirFilter // Pass tefsir filter
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
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-lg">
        <div className="px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/en/admin/analytics"
              className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-all duration-200 bg-blue-50 px-4 py-2.5 rounded-lg border border-blue-200 hover:bg-blue-100 hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Analytics</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                <span className="hidden sm:inline">Student Analytics Dashboard</span>
                <span className="sm:hidden">Analytics</span>
              </h1>
              {tefsirFilter && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-md px-2 py-1">
                  <BookOpen className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Tefsir</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Professional Filter Card */}
          <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-purple-200 shadow-lg mb-6">
            <CardHeader className="pb-6 px-6 pt-6">
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-purple-800">
                <Filter className="h-6 w-6" />
                Advanced Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                 {/* Progress Filter */}
                 <div className="space-y-3">
                   <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                     📈 Progress Status
                   </label>
                   <select
                     value={progressFilter}
                     onChange={(e) => {
                       setProgressFilter(
                         e.target.value as
                           | "notstarted"
                           | "inprogress"
                           | "completed"
                           | ""
                       );
                       setCurrentPage(1);
                     }}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm transition-all duration-200 hover:border-purple-400 shadow-sm"
                   >
                    <option value="">All Students</option>
                    <option value="notstarted">Not Started</option>
                    <option value="inprogress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                 {/* Final Exam Status Filter */}
                 <div className="space-y-3">
                   <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                     🎯 Exam Status
                   </label>
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
                       setCurrentPage(1);
                     }}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm transition-all duration-200 hover:border-purple-400 shadow-sm"
                   >
                    <option value="">All Exams</option>
                    <option value="notstarted">Not Started</option>
                    <option value="inprogress">In Progress</option>
                    <option value="failed">Failed</option>
                    <option value="passed">Passed</option>
                  </select>
                </div>

                 {/* Last Seen Filter */}
                 <div className="space-y-3">
                   <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                     ⏰ Last Active
                   </label>
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
                       setCurrentPage(1);
                     }}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm transition-all duration-200 hover:border-purple-400 shadow-sm"
                   >
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="1day">1 day ago</option>
                    <option value="2days">2 days ago</option>
                    <option value="3days">3 days ago</option>
                    <option value="3plus">3+ days ago</option>
                  </select>
                </div>

                 {/* Tefsir Filter */}
                 <div className="space-y-3">
                   <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                     <BookOpen className="h-4 w-4" />
                     Tefsir Filter
                   </label>
                   <div className="relative">
                     <select
                       value={tefsirFilter ? "tefsir_only" : ""}
                       onChange={(e) => {
                         setTefsirFilter(e.target.value === "tefsir_only");
                         setCurrentPage(1);
                       }}
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm transition-all duration-200 hover:border-purple-400 appearance-none shadow-sm"
                     >
                      <option value="">All Students (Default)</option>
                      <option value="tefsir_only">
                        Tefsir: {'"'}On Progress{'"'} Students Only
                      </option>
                    </select>
                  </div>
                </div>

                 {/* Filter Actions */}
                 <div className="space-y-3 flex flex-col justify-end">
                   <Button
                     onClick={() => {
                       setProgressFilter("");
                       setStatusFilter("");
                       setLastSeenFilter("");
                       setTefsirFilter(false);
                       setCurrentPage(1);
                     }}
                     variant="outline"
                     className="w-full py-3 text-sm font-medium border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 shadow-sm"
                   >
                     Clear All Filters
                   </Button>
                 </div>
              </div>

               {/* Active Filter Summary */}
               <div className="mt-6 pt-6 border-t border-gray-200">
                 <div className="flex flex-wrap gap-3">
                {(progressFilter ||
                  statusFilter ||
                  lastSeenFilter ||
                  tefsirFilter) && (
                  <>
                     <span className="text-sm text-gray-700 font-semibold">
                       Active Filters:
                     </span>
                    {progressFilter && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 text-xs"
                      >
                        Progress: {progressFilter}
                      </Badge>
                    )}
                    {statusFilter && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 text-xs"
                      >
                        Exam: {statusFilter}
                      </Badge>
                    )}
                    {lastSeenFilter && (
                      <Badge
                        variant="secondary"
                        className="bg-orange-100 text-orange-800 text-xs"
                      >
                        Last Seen: {lastSeenFilter}
                      </Badge>
                    )}
                    {tefsirFilter && (
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-800 text-xs"
                      >
                        <BookOpen className="h-3 w-3 mr-1" />
                        Tefsir: On Progress Only
                      </Badge>
                    )}
                 </>
               )}
                 </div>
               </div>
             </CardContent>
           </Card>
         
         {/* Results Section */}
         <div className="mt-8 space-y-6">
           {/* Results Header */}
           <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <h2 className="text-2xl font-bold text-gray-900">
                   Student Results
                 </h2>
                 {tefsirFilter && (
                   <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-md px-3 py-1">
                     <BookOpen className="h-4 w-4 mr-2" />
                     Tefsir: On Progress Only
                   </Badge>
                 )}
               </div>
               <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                 Showing {(currentPage - 1) * itemsPerPage + 1}-
                 {Math.min(
                   currentPage * itemsPerPage,
                   data?.pagination?.totalRecords ?? 0
                 )}{" "}
                 of {data?.pagination?.totalRecords ?? 0} students
               </div>
             </div>
           </div>

           {/* Table */}
           <Card className="shadow-lg border-0">
             <CardContent className="p-6">
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
             </CardContent>
           </Card>
         </div>

          <Dialog
            open={isPackageDialogOpen}
            onOpenChange={setIsPackageDialogOpen}
          >
            <DialogContent className="w-[95vw] max-w-lg sm:max-w-2xl lg:max-w-4xl h-[85vh] sm:h-[80vh] p-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Package Details - {selectedStudentName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {availablePackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`p-4 border rounded-lg ${
                    pkg.isActive
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 bg-white shadow-sm"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h3
                        className={`text-lg font-semibold ${
                          pkg.isActive ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        {pkg.name}
                      </h3>
                      {pkg.isActive && (
                        <Badge className="bg-blue-600 text-white text-sm px-3 py-1 w-fit">
                          Active Package
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
      </div>
    </div>
  );
}

export default Page;
