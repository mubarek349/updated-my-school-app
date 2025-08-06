"use client";

import {
  getAssignedPacakgesWithSubjects,
  unAssignPackage,
} from "@/actions/admin/packageassign";
import { cn } from "@/lib/utils";
import React from "react";

// Example prop type. Replace with your actual data fetching logic or props.
type AssignedItem = {
  package: string;
  subject: string;
  isKid?: boolean;
};

type AssignedStudentsListProps = {
  coursesPackageId: string;
};

import { useEffect, useState } from "react";
import StudentAssignmentForm from "./student-assignment-form";
import { Baby, Check } from "lucide-react";
import { UnassigningConfirmModal } from "@/components/modals/confirm-modal";
import toast from "react-hot-toast";

function AssignedStudentsList({ coursesPackageId }: AssignedStudentsListProps) {
  const [assigned, setAssigned] = useState<AssignedItem[]>();
  const [refresh, setRefresh] = useState(new Date().toISOString());
  useEffect(() => {
    async function fetchAssigned() {
      const result = await getAssignedPacakgesWithSubjects(coursesPackageId);
      // Map nulls to empty strings or booleans as needed
      setAssigned(
        result.map((item) => ({
          package: item.package ?? "",
          subject: item.subject ?? "",
          isKid: item.isKid ?? false,
        }))
      );
    }
    fetchAssigned();
  }, [coursesPackageId, refresh]);

  return (
    <>
      <div className="max-w-2xl mx-auto mt-8 mb-10">
        <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">
          Assigned Student Types
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {assigned?.map((item, idx) => (
            <div
              key={item.package + item.subject + idx}
              className="flex items-center bg-white border border-gray-200 rounded text-sm font-medium text-gray-700 px-2 py-1"
              style={{
                minHeight: "2rem",
                boxShadow: "0 2px 8px 0 rgba(34,197,94,0.18)", // green shadow
              }}
            >
              <UnassigningConfirmModal
                onConfirm={async () => {
                  try {
                    await unAssignPackage(
                      coursesPackageId,
                      item.isKid ?? false,
                      item.package,
                      item.subject
                    );
                    toast.success("successfully unAssigned");
                    setRefresh(new Date().toISOString());
                  } catch {
                    toast.error("Failed to unassign package");
                  }
                }}
              >
                <>
                  <Check className="text-green-500 w-4 h-4 mr-2" />
                  <span
                    className={cn(
                      item.isKid && "text-yellow-700 flex items-center gap-1"
                    )}
                  >
                    {item.package} - {item.subject}
                    {item.isKid && <Baby className="w-4 h-4 ml-1" />}
                  </span>
                </>
              </UnassigningConfirmModal>
            </div>
          ))}
        </div>
      </div>
      <StudentAssignmentForm setRefresh={setRefresh} />
    </>
  );
}

export default AssignedStudentsList;
// {assigned?.map((item, idx) => (
//             <div
//               key={item.package + item.subject + idx}
//               className="flex items-center bg-white border border-gray-200 rounded text-sm font-medium text-gray-700 px-2 py-1"
//               style={{
//                 minHeight: "2rem",
//                 boxShadow: "0 2px 8px 0 rgba(34,197,94,0.18)", // green shadow
//               }}
//             >
//               <Check className="text-green-500 w-4 h-4 mr-2" />
//               <span
//                 className={cn(
//                   item.isKid && "text-yellow-700 flex items-center gap-1"
//                 )}
//               >
//                 {item.package} - {item.subject}
//                 {item.isKid && <Baby className="w-4 h-4 ml-1" />}
//               </span>
//             </div>
//           ))}
