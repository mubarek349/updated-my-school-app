"use client";
import React, { useState } from 'react'
import CustomTable from '@/components/custom/admin/custom-table';
import { getStudentAnalyticsperPackage } from '@/actions/admin/analysis';
import useAction from '@/hooks/useAction';

function Page() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [data, refresh, isLoading] = useAction(
    getStudentAnalyticsperPackage,
    [true, () => {}],
    searchTerm,
    currentPage,
    itemsPerPage
  );

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "isKid", label: "Is Kid" },
    { key: "phoneNo", label: "Phone Number" },
    { key: "activePackage", label: "activePackage" },
    { key: "studentProgress", label: "Student Progress" },
    { key: "chatid", label: "Telegram Link" },
  ];

  const rows = (data && "data" in data)
    ? data.data.map((row: any) => ({
        id: String(row.id ?? ""),
        name: row.name ?? "",
        isKid: row.isKid ? "Yes" : "No",
        phoneNo: row.phoneNo ?? "",
        activePackage: row.activePackage ?? "",
        studentProgress: row.studentProgress ?? "",
        chatid: row.chatid ?? ""
      }))
    : [];

  return (
    <div className='m-2'>
      <h1 className="text-xl font-bold mb-1">Student Progress In Package</h1>
      <div className='m-1'>
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