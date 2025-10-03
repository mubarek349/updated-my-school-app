'use client';

import { useEffect, useState } from 'react';
import {
  assignUstazToCoursePackage,
  getAvailableUstazs,
  getAssignedUstazs,
} from '@/actions/admin/packageassign';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, UserCheck2, UserPlus2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function loadUstazs() {
      try {
        setInitialLoading(true);
        const [available, assigned] = await Promise.all([
          getAvailableUstazs(),
          getAssignedUstazs(coursesPackageId),
        ]);
        if (available) setAvailableUstazs(available);
        if (assigned) setAssignedUstazs(assigned);
      } catch (error) {
        console.error('❌ Failed to load ustazs:', error);
        toast.error('Failed to load ustazs');
      } finally {
        setInitialLoading(false);
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
        setSearchTerm('');
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

  // Filter available ustazs based on search term
  const filteredUstazs = availableUstazs.filter(ustaz =>
    ustaz.ustazname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ustaz.wdt_ID.toString().includes(searchTerm)
  );

  // Convert to react-select options format
  const ustazOptions = filteredUstazs.map(ustaz => ({
    value: ustaz.wdt_ID,
    label: `${ustaz.ustazname ?? 'Unnamed Ustaz'} (ID: ${ustaz.wdt_ID})`
  }));

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
          <div className="flex items-center justify-between mb-2">
            <Label className="block text-lg text-blue-700 font-semibold">
              Select Ustaz:
            </Label>
            <span className="text-sm text-gray-500">
              {searchTerm ? `${filteredUstazs.length} of ${availableUstazs.length}` : `${availableUstazs.length} available`}
            </span>
          </div>
          <div className="relative">
            <Select
              options={ustazOptions}
              value={ustazOptions.find(option => option.value === selectedUstazId) || null}
              onChange={(selectedOption) => {
                setSelectedUstazId(selectedOption?.value || null);
              }}
              onInputChange={(inputValue) => setSearchTerm(inputValue)}
              placeholder={initialLoading ? "Loading ustazs..." : "Search and select an Ustaz..."}
              isSearchable
              isClearable
              isLoading={initialLoading}
              isDisabled={initialLoading}
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '0.75rem',
                  borderColor: '#a78bfa',
                  boxShadow: '0 0 0 2px #a78bfa33',
                  minHeight: '48px',
                  '&:hover': {
                    borderColor: '#8b5cf6',
                  },
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected
                    ? '#a78bfa'
                    : state.isFocused
                    ? '#f3e8ff'
                    : 'white',
                  color: state.isSelected ? 'white' : '#4b5563',
                  fontWeight: state.isSelected ? 'bold' : 'normal',
                  '&:hover': {
                    backgroundColor: state.isSelected ? '#a78bfa' : '#f3e8ff',
                  },
                }),
                placeholder: (base) => ({
                  ...base,
                  color: '#9ca3af',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: '#4b5563',
                }),
                input: (base) => ({
                  ...base,
                  color: '#4b5563',
                }),
              }}
              noOptionsMessage={() => (
                <div className="text-center py-2 text-gray-500">
                  <Search className="w-4 h-4 mx-auto mb-1" />
                  {availableUstazs.length === 0 
                    ? "No ustazs available" 
                    : "No ustazs found matching your search"
                  }
                </div>
              )}
            />
          </div>
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
