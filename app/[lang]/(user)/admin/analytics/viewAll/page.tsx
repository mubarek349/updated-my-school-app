"use client";
import React, { useState } from "react";
import { getStudentAnalyticsperPackage } from "@/actions/admin/analysis";
import useAction from "@/hooks/useAction";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CustomViewAllTable from "@/components/custom/admin/custom-view-all-table";

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
  const [data, , isLoading] = useAction(
    getStudentAnalyticsperPackage,
    [true, () => {}],
    searchTerm,
    currentPage,
    itemsPerPage,
    progressFilter || undefined, // Pass undefined if no filter selected
    statusFilter || undefined // Pass undefined if no filter selected
  );

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "isKid", label: "Is Kid" },
    { key: "phoneNo", label: "Phone Number" },
    { key: "ustazname", label: "Ustaz Name" },
    { key: "activePackage", label: "activePackage" },
    { key: "studentProgress", label: "Student Progress" },
    { key: "finalExamStatus", label: "Final Exam Status" },
    { key: "result", label: "Result" },
  ];

  const rows =
    data && "data" in data
      ? data.data.map((row) => ({
          id: String(row.id ?? ""),
          name: row.name ?? "",
          isKid: row.isKid ? "Yes" : "No",
          phoneNo: row.phoneNo ?? "",
          activePackage: row.activePackage ?? "",
          studentProgress: row.studentProgress ?? "",
          ustazname: row.ustazname ?? "",
          finalExamStatus: row.checkStausOfFinalExam
            ? row.checkUpdateProhibition
              ? row.result?.result.score >= 0.75
                ? "Passed"
                : "Failed"
              : "In Progress"
            : "Not Started",
          result: row.checkStausOfFinalExam
            ? row.result &&
              `${row.result.result.score * 100}% አግኝተዋል -> ${
                row.result.result.correct
              }/${row.result.result.total} በመመለስ`
            : "-",
        }))
      : [];

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
        />
      </div>
    </div>
  );
}

export default Page;
