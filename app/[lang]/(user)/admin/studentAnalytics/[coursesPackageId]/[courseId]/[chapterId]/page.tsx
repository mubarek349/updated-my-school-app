"use client";
import React, { useState } from "react";
import CustomTable from "@/components/custom/admin/custom-table";
import useAction from "@/hooks/useAction";
import { getStudentAnalyticsperchapter } from "@/actions/admin/analysis";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function Page() {
  const { chapterId } = useParams();
  const { coursesPackageId } = useParams();
  const { courseId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [progressFilter, setProgressFilter] = useState<"notstarted" | "inprogress" | "completed" | "">("");

  const [data, , isLoading] = useAction(
    getStudentAnalyticsperchapter,
    [true, () => {}],
    chapterId as string,
    searchTerm,
    currentPage,
    itemsPerPage,
    progressFilter || undefined // Pass undefined if no filter selected
  );

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "phoneNo", label: "Phone Number" },
    { key: "studentProgress", label: "Student Progress" },
    // { key: "chatid", label: "Telegram Link" },
  ];

  const rows =
    data && "data" in data
      ? data.data.map((row) => ({
          id: String(row.id ?? ""),
          name: row.name ?? "",
          phoneNo: row.phoneNo ?? "",
          studentProgress: row.studentProgress ?? "",
          // chatid: row.chatid ?? "",
        }))
      : [];

  return (
    <div className="m-2">
      <Link
        href={`/en/admin/coursesPackages/${coursesPackageId}/${courseId}`}
        className="flex items-center text-sm hover:opacity-75 transition mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Chapters setup
      </Link>
      <h1 className="text-xl font-bold mb-4">Student Analytics Per Chapter</h1>
      {/* Progress Filter */}
      <div className="m-1">
        <label className="mr-2 font-medium">Filter by Progress:</label>
        <select
          value={progressFilter}
          onChange={e => setProgressFilter(e.target.value as "notstarted" | "inprogress" | "completed" | "")}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="">All</option>
          <option value="notstarted">Not Started</option>
          <option value="inprogress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <CustomTable
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
      {isLoading && <div>Loading...</div>}
    </div>
  );
}

export default Page;