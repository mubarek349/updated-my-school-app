'use client';

import {
  getAssignedPacakgesWithSubjects,
  unAssignPackage,
} from '@/actions/admin/packageassign';
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import StudentAssignmentForm from './student-assignment-form';
import { Baby, Check, UserMinus2 } from 'lucide-react';
import { UnassigningConfirmModal } from '@/components/modals/confirm-modal';
import toast from 'react-hot-toast';

type AssignedItem = {
  package: string;
  subject: string;
  isKid?: boolean;
};

type AssignedStudentsListProps = {
  coursesPackageId: string;
};

function AssignedStudentsList({ coursesPackageId }: AssignedStudentsListProps) {
  const [assigned, setAssigned] = useState<AssignedItem[]>([]);
  const [refresh, setRefresh] = useState(new Date().toISOString());

  useEffect(() => {
    async function fetchAssigned() {
      const result = await getAssignedPacakgesWithSubjects(coursesPackageId);
      setAssigned(
        result.map((item) => ({
          package: item.package ?? '',
          subject: item.subject ?? '',
          isKid: item.isKid ?? false,
        }))
      );
    }
    fetchAssigned();
  }, [coursesPackageId, refresh]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Assigned Packages Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-green-100">
        <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Check className="text-green-600 w-4 h-4" />
          Assigned Packages
        </h2>

        {assigned.length === 0 ? (
          <p className="text-sm text-gray-500">No packages assigned yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {assigned.map((item, idx) => (
              <UnassigningConfirmModal
                key={item.package + item.subject + idx}
                onConfirm={async () => {
                  try {
                    await unAssignPackage(
                      coursesPackageId,
                      item.isKid ?? false,
                      item.package,
                      item.subject
                    );
                    toast.success('Successfully unassigned');
                    setRefresh(new Date().toISOString());
                  } catch {
                    toast.error('Failed to unassign package');
                  }
                }}
              >
                <div
                  className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2 text-sm text-green-800 hover:bg-green-100 transition cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span className={cn(item.isKid && 'text-yellow-700 flex items-center gap-1')}>
                      {item.package} - {item.subject}
                      {item.isKid && <Baby className="w-3 h-3 ml-1" />}
                    </span>
                  </div>
                  <UserMinus2 className="text-red-500 w-3 h-3" />
                </div>
              </UnassigningConfirmModal>
            ))}
          </div>
        )}
      </div>

      {/* Assignment Form */}
      <StudentAssignmentForm setRefresh={setRefresh} />
    </div>
  );
}

export default AssignedStudentsList;
