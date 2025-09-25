"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

interface FeedbackFiltersProps {
  coursePackages: Array<{
    id: string;
    name: string;
    isPublished: boolean;
  }>;
}

export function FeedbackFilters({ coursePackages }: FeedbackFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPackage, setSelectedPackage] = useState(searchParams?.get("package") || "all");
  const [selectedRating, setSelectedRating] = useState(searchParams?.get("rating") || "all");

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (selectedPackage && selectedPackage !== "all") params.set("package", selectedPackage);
    if (selectedRating && selectedRating !== "all") params.set("rating", selectedRating);
    
    router.push(`/en/admin/feedbacks?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedPackage("all");
    setSelectedRating("all");
    router.push("/en/admin/feedbacks");
  };

  const hasFilters = (selectedPackage && selectedPackage !== "all") || (selectedRating && selectedRating !== "all");

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-600" />
        <span className="text-sm font-medium text-slate-700">Filters:</span>
      </div>
      
      <Select value={selectedPackage} onValueChange={setSelectedPackage}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Packages" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Packages</SelectItem>
          {coursePackages.map((pkg) => (
            <SelectItem key={pkg.id} value={pkg.id}>
              {pkg.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedRating} onValueChange={setSelectedRating}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="All Ratings" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Ratings</SelectItem>
          <SelectItem value="5">5 Stars</SelectItem>
          <SelectItem value="4">4 Stars</SelectItem>
          <SelectItem value="3">3 Stars</SelectItem>
          <SelectItem value="2">2 Stars</SelectItem>
          <SelectItem value="1">1 Star</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={applyFilters} size="sm">
        Apply
      </Button>

      {hasFilters && (
        <Button onClick={clearFilters} size="sm" variant="outline">
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}