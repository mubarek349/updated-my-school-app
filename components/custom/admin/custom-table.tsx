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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

const PAGE_SIZES = [1, 5, 25, 50];

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
}: CustomTableProps) {
  const totalPages = Math.max(Math.ceil(totalRows / pageSize), 1);

  // Local state for search input
  const [localSearch, setLocalSearch] = useState(searchValue);

  // Keep local input in sync if parent changes searchValue
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  return (
    <div className="w-svw space-y-8">
      {/* Search & Page Size */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            disabled={isLoading}
            className="max-w-sm border border-gray-300 focus:border-blue-400 transition px-4 py-2 rounded w-full sm:w-auto"
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
                <TableCell colSpan={columns.length} className="text-center py-6 text-gray-500">
                  No data to display.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow
                  key={row.id || row.key}
                  className={cn(
                    idx % 2 === 0
                      ? "bg-white"
                      : "bg-gray-50",
                    "hover:bg-blue-50 transition"
                  )}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className="font-medium text-gray-700 sm:px-6 px-2 sm:py-4 py-2 text-xs sm:text-sm break-words"
                    >
                      {row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Loading */}
      {isLoading && rows.length === 0 && (
        <div className="text-center text-blue-500 py-4 font-semibold">
          <span className="inline-block w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mr-2"></span>
          Loading data...
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
        <div>
          Showing{" "}
          <span className="font-bold text-blue-600">
            {rows.length > 0 ? (page - 1) * pageSize + 1 : 0}
          </span>{" "}
          to{" "}
          <span className="font-bold text-blue-600">
            {Math.min(page * pageSize, totalRows)}
          </span>{" "}
          of <span className="font-bold text-gray-700">{totalRows}</span> results
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1 || isLoading}
              className="border border-gray-300 text-blue-600 px-2 py-1 rounded"
            >
              <ChevronLeft size={16} />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((pg) => {
                if (totalPages <= 3) return true;
                if (page <= 2) return pg <= 3;
                if (page >= totalPages - 1) return pg >= totalPages - 2;
                return Math.abs(pg - page) <= 1;
              })
              .map((pg) => (
                <Button
                  key={pg}
                  variant={pg === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pg)}
                  disabled={pg === page || isLoading}
                  className={cn(
                    pg === page
                      ? "bg-blue-600 text-white font-bold px-3 py-1 rounded"
                      : "border border-gray-300 text-blue-600 px-3 py-1 rounded"
                  )}
                >
                  {pg}
                </Button>
              ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || isLoading}
              className="border border-gray-300 text-blue-600 px-2 py-1 rounded"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}