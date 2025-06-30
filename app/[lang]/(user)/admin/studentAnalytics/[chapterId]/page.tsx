"use client";
import React from 'react'
import CustomTable from '@/components/custom/admin/custom-table';
import useAction from '@/hooks/useAction';   
import { getStudentAnalyticsperchapter } from '@/actions/admin/analysis';
import { useParams } from 'next/navigation';

function Page() {
  const { chapterId } = useParams();
  const [data, refresh, isLoading] = useAction(getStudentAnalyticsperchapter, [
    true, () => {}
  ], chapterId as string);

  const columns = [
    { key: "id", label: "ID" },   
    { key: "name", label: "Name" },
    { key: "phoneNo", label: "Phone Number" },
    { key: "studentProgress", label: "Student Progress" },
    { key: "chatid", label: "Telegram Link" },
  ];

  // Use data from backend, fallback to empty array if not loaded yet
  const rows = (data && "data" in data)
    ? data.data.map((row: any) => ({
        id: String(row.id ?? ""),
        name: row.name ?? "",
        phoneNo: row.phoneNo ?? "",
        studentProgress: row.studentProgress ?? "",
        chatid: row.chatid ?? ""
      }))
    : [];

  return (
    <div className='m-2'>
      <h1 className="text-xl font-bold mb-4">Student Analytics Per Chapter</h1>
      <CustomTable
        columns={columns}
        rows={rows}
        totalRows={rows.length}
        page={1}
        pageSize={10}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        searchValue={""}
        onSearch={() => {}}
        // Add other required props with default or mock values as needed
      />
      {isLoading && <div>Loading...</div>}
    </div>
  );
}

export default Page;