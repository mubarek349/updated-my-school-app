'use client';

import { useEffect, useState } from 'react';
import {
  assignUstazToCoursePackage,
  getAvailableUstazs,
  getAssignedUstazs,
} from '@/actions/admin/packageassign';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, UserCheck2, UserPlus2 } from 'lucide-react';
import toast from 'react-hot-toast';

type Ustaz = {
  wdt_ID: number;
  ustazname: string | null;
};

type UstazSelectorProps = {
  coursesPackageId: string;
};

export default function UstazSelector({ coursesPackageId }: UstazSelectorProps) {
  const [availableUstazs, setAvailableUstazs] = useState<Ustaz[]>([]);
  const [assignedUstazs, setAssignedUstazs] = useState<Ustaz[]>([]);
  const [selectedUstazId, setSelectedUstazId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUstazs() {
      try {
        const [available, assigned] = await Promise.all([
          getAvailableUstazs(),
          getAssignedUstazs(coursesPackageId),
        ]);
        if (available) setAvailableUstazs(available);
        if (assigned) setAssignedUstazs(assigned);
      } catch (error) {
        console.error('❌ Failed to load ustazs:', error);
        toast.error('Failed to load ustazs');
      }
    }

    loadUstazs();
  }, [coursesPackageId]);

  const handleAssign = async () => {
    if (!selectedUstazId) return;
    setLoading(true);
    try {
      const assigned = await assignUstazToCoursePackage(
        selectedUstazId,
        coursesPackageId
      );
      if (assigned) {
        toast.success('Successfully assigned');
        const updatedAssigned = await getAssignedUstazs(coursesPackageId);
        setAssignedUstazs(updatedAssigned ?? []);
        setSelectedUstazId(null);
      } else {
        toast.error('Assignment failed');
      }
    } catch (error) {
      console.error('Assignment error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Assigned Ustazs Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-purple-100">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck2 className="text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-800">Assigned Ustazs</h3>
        </div>
        {assignedUstazs.length === 0 ? (
          <p className="text-sm text-gray-500">No ustazs assigned yet.</p>
        ) : (
          <ul className="space-y-2">
            {assignedUstazs.map((ustaz) => (
              <li
                key={ustaz.wdt_ID}
                className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 text-purple-800 shadow-sm"
              >
                <span>{ustaz.ustazname ?? 'Unnamed Ustaz'}</span>
                <span className="text-xs text-purple-600">ID: {ustaz.wdt_ID}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Assign Form Section */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 shadow-xl rounded-2xl p-6 border border-purple-200">
        <div className="flex items-center gap-2 mb-6">
          <UserPlus2 className="text-pink-600" />
          <h2 className="text-2xl font-bold text-purple-700">Assign New Ustaz</h2>
        </div>

        <div className="mb-4">
          <Label className="block text-lg text-blue-700 font-semibold mb-2">
            Select Ustaz:
          </Label>
          <select
            value={selectedUstazId ?? ''}
            onChange={(e) => setSelectedUstazId(Number(e.target.value))}
            className="w-full px-4 py-3 border border-purple-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-700 transition-all duration-200"
          >
            <option value="" disabled>
              Choose an Ustaz
            </option>
            {availableUstazs.map((ustaz) => (
              <option key={ustaz.wdt_ID} value={ustaz.wdt_ID}>
                {ustaz.ustazname ?? 'Unnamed Ustaz'}
              </option>
            ))}
          </select>
        </div>

        <Button
          disabled={loading || selectedUstazId === null}
          onClick={handleAssign}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:from-pink-500 hover:to-purple-500 transition-all duration-300 flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : null}
          Assign Ustaz
        </Button>
      </div>
    </div>
  );
}
