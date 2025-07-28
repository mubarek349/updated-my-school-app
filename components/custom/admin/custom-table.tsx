"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export interface ColumnDef {
  key: string;
  label: string;
}

interface CustomTableProps {
  rows: Array<
    Record<string, string> & { key?: string | number; id?: string | number }
  >;
  columns: Array<ColumnDef>;
  totalRows: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  searchValue: string;
  onSearch: (value: string) => void;
  isLoading?: boolean;
  // New props for controlled selection
  selectedRowIds: Set<string | number>;
  onSelectAll: (checked: boolean | "indeterminate") => void;
  onSelectRow: (rowId: string | number, checked: boolean | "indeterminate") => void;
}

const PAGE_SIZES = [1, 10, 25, 100, 250, 500];

export default function CustomTable({
  rows,
  columns,
  totalRows,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  searchValue,
  onSearch,
  isLoading = false,
  selectedRowIds,
  onSelectAll,
  onSelectRow,
}: CustomTableProps) {
  const totalPages = Math.max(Math.ceil(totalRows / pageSize), 1);

  // Local state for search input
  const [localSearch, setLocalSearch] = useState(searchValue);

  // Keep local input in sync if parent changes searchValue
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  // Selection logic is now controlled by parent
 const allSelected = rows.length > 0 && rows.every(row => selectedRowIds.has(String(row.id ?? row.key)));
const someSelected = rows.some(row => selectedRowIds.has(String(row.id ?? row.key)));

  return (
    <div className="w-svw space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            disabled={isLoading}
            className="max-w-sm border ml-3 border-gray-300 focus:border-blue-400 transition px-4 py-2 rounded w-full sm:w-auto"
          />
          <Button
            type="button"
            onClick={() => onSearch(localSearch)}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow"
          >
            Search
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 focus:border-blue-400 transition bg-white"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>entries</span>
        </div>
      </div>
      {/* Responsive Table */}
      <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-gray-200 shadow bg-white p-2 sm:p-6 my-4">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              {/* Selection checkbox header */}
              <TableHead className="w-8">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all rows"
                />
              </TableHead>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className="uppercase text-xs font-semibold text-gray-700 bg-gray-100 sm:px-6 px-2 sm:py-4 py-2 rounded-t-lg tracking-wider shadow-sm"
                  style={{
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoading && rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="text-center py-6 text-gray-500"
                >
                  No data to display.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => {
                // Always use string for rowId
                const rowId = String(row.id ?? row.key ?? "");
                return (
                  <TableRow
                    key={rowId}
                    className={cn(
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50",
                      "hover:bg-blue-50 transition"
                    )}
                  >
                    {/* Selection checkbox cell */}
                    <TableCell className="w-8">
                      <Checkbox
                        checked={selectedRowIds.has(rowId)}
                        onCheckedChange={(checked) => onSelectRow(rowId, checked)}
                        aria-label={`Select row ${rowId}`}
                      />
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className="font-medium text-gray-700 sm:px-6 px-2 sm:py-4 py-2 text-xs sm:text-sm break-words"
                      >
                        {row[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}