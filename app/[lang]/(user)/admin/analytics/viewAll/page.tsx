"use client";
import React, { useState } from "react";
import CustomTable from "@/components/custom/admin/custom-table";
import { getStudentAnalyticsperPackage } from "@/actions/admin/analysis";
import useAction from "@/hooks/useAction";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function Page() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [progressFilter, setProgressFilter] = useState<
    "notstarted" | "inprogress" | "completed" | ""
  >("");

  const [data, , isLoading] = useAction(
    getStudentAnalyticsperPackage,
    [true, () => {}],
    searchTerm,
    currentPage,
    itemsPerPage,
    progressFilter || undefined // Pass undefined if no filter selected
  );

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "isKid", label: "Is Kid" },
    { key: "phoneNo", label: "Phone Number" },
    { key: "tglink", label: "Telegram Link" },
    { key: "whatsapplink", label: "WhatsApp Link" },
    { key: "activePackage", label: "activePackage" },
    { key: "studentProgress", label: "Student Progress" },
    // { key: "chatid", label: "Telegram Link" },
  ];

  const rows =
    data && "data" in data
      ? data.data.map((row) => ({
          id: String(row.id ?? ""),
          name: row.name ?? "",
          isKid: row.isKid ? "Yes" : "No",
          phoneNo: row.phoneNo ?? "",
          tglink: row.tglink ?? "",
          whatsapplink: row.whatsapplink ?? "",
          activePackage: row.activePackage ?? "",
          studentProgress: row.studentProgress ?? "",
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
      <div>
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
      </div>
    </div>
  );
}

export default Page;
