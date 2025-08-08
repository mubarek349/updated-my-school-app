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
  onSelectRow: (
    rowId: string | number,
    checked: boolean | "indeterminate"
  ) => void;
}

const PAGE_SIZES = [1, 10, 25, 100, 250, 500];

export default function CustomTable({
  rows,
  columns,
  pageSize,
  onPageSizeChange,
  searchValue,
  onSearch,
  isLoading = false,
  selectedRowIds,
  onSelectAll,
  onSelectRow,
}: CustomTableProps) {
  // Local state for search input
  const [localSearch, setLocalSearch] = useState(searchValue);

  // Keep local input in sync if parent changes searchValue
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  // Selection logic is now controlled by parent
  const allSelected =
    rows.length > 0 &&
    rows.every((row) => selectedRowIds.has(String(row.id ?? row.key)));

  return (
    <div className="w-full space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Search & Page Size Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-4 gap-x-6">
        {/* Search Input & Button */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            disabled={isLoading}
            className="border border-gray-300 focus:border-blue-500 transition px-4 py-2 rounded-md w-full sm:max-w-sm"
            aria-label="Search input"
          />
          <Button
            type="button"
            onClick={() => onSearch(localSearch)}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md shadow-md"
          >
            Search
          </Button>
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="pageSize" className="text-gray-700">
            Show:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-2 py-1 focus:border-blue-500 transition bg-white"
            aria-label="Select page size"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-gray-700">entries</span>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="w-full overflow-x-auto scrollbar-hide rounded-xl border border-gray-200 shadow-sm bg-white p-4 sm:p-6">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow>
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
                  className="uppercase text-xs font-semibold text-gray-700 bg-gray-100 px-4 py-3 tracking-wide border-b border-gray-200"
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
                const rowId = String(row.id ?? row.key ?? "");
                return (
                  <TableRow
                    key={rowId}
                    className={cn(
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50",
                      "hover:bg-blue-50 transition"
                    )}
                  >
                    <TableCell className="w-8">
                      <Checkbox
                        checked={selectedRowIds.has(rowId)}
                        onCheckedChange={(checked) =>
                          onSelectRow(rowId, checked)
                        }
                        aria-label={`Select row ${rowId}`}
                      />
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className="text-gray-700 px-4 py-3 text-xs sm:text-sm break-words"
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
