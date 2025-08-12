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
import Image from "next/image";

export interface ColumnDef {
  key: string;
  label: string;
}

interface CustomViewAllTableProps {
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

const PAGE_SIZES = [10, 25, 100, 250, 500];

export default function CustomViewAllTable({
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
}: CustomViewAllTableProps) {
  const totalPages = Math.max(Math.ceil(totalRows / pageSize), 1);

  // Local state for search input
  const [localSearch, setLocalSearch] = useState(searchValue);

  // Keep local input in sync if parent changes searchValue
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  return (
    <div className="w-full space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Search & Page Size */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-4 gap-x-6">
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

      {/* Table */}
      <div className="w-full overflow-x-auto scrollbar-hide rounded-xl border border-gray-200 shadow-sm bg-white p-4 sm:p-6">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow>
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
                  colSpan={columns.length}
                  className="text-center py-6 text-gray-500"
                >
                  No data to display.
                </TableCell>
              </TableRow>
            ) :(
              rows.map((row, idx) => (
                <TableRow
                  key={row.id || row.key}
                  className={cn(
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50",
                    "hover:bg-blue-50 transition"
                  )}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className="font-medium text-gray-700 sm:px-6 px-2 sm:py-4 py-2 text-xs sm:text-sm break-words"
                    >
                      {["tglink", "whatsapplink"].includes(col.key) &&
                      typeof row[col.key] === "string" &&
                      row[col.key] ? (
                        <a
                          href={row[col.key]}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Image
                            src={col.key === "tglink" ? "/tg.png" : "/wa.png"}
                            alt={col.key === "tglink" ? "Telegram" : "WhatsApp"}
                            width={32}
                            height={32}
                            style={{ objectFit: "contain", borderRadius: 6 }}
                          />
                        </a>
                      ) : (
                        row[col.key]
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Loading Spinner */}
      {isLoading && rows.length === 0 && (
        <div className="flex justify-center items-center py-6 text-blue-500 font-semibold">
          <span className="inline-block w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mr-2"></span>
          Loading data...
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-4 gap-x-6 text-sm">
        <div>
          Showing{" "}
          <span className="font-bold text-blue-600">
            {rows.length > 0 ? (page - 1) * pageSize + 1 : 0}
          </span>{" "}
          to{" "}
          <span className="font-bold text-blue-600">
            {Math.min(page * pageSize, totalRows)}
          </span>{" "}
          of <span className="font-bold text-gray-700">{totalRows}</span>{" "}
          results
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center gap-2">
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
