"use client";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import useAction from "@/hooks/useAction";
import {
  assignPackage,
  getDistinctPackagesWithSubjects,
} from "@/actions/admin/packageassign";
import { useParams } from "next/navigation";
import { Button } from "../../ui/button";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Label } from "../../ui/label";

function StudentAssignmentForm({setRefresh}:{setRefresh:(value:string)=>void}) {
  const { coursesPackageId } = useParams<{ coursesPackageId: string }>();
  const [packagesWithSubject] = useAction(getDistinctPackagesWithSubjects, [
    true,
    () => {},
  ]);
  const [res, addPackage, loading] = useAction(assignPackage, [, () => {}]);
  const [selectedSubject, setSelectedSubject] = useState<
    { value: { package: string; subject: string }; label: string }[]
  >([]);
  const [isKid, setIsKid] = useState(false);

  useEffect(() => {
    if (res) {
      setRefresh(new Date().toISOString());
      toast.success("Successfully assigned!");
    }
  }, [res,setRefresh]);

  const studentOptions =
    Array.isArray(packagesWithSubject) && packagesWithSubject.length > 0
      ? packagesWithSubject.map((item) => ({
          value: {
            subject: item.subject ?? "",
            package: item.package ?? "",
          },
          label: `${item.package} - ${item.subject}`,
        }))
      : [];

  return (
    <div className="max-w-xl mx-auto mt-10 mb-10 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 shadow-xl rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">
        Assign Students Type
      </h2>
      <div className="mb-6">
        <Label className="font-semibold text-lg text-blue-700">
          Select Student&apos;s Package with their corresponding Subject to be assigned:
        </Label>
        {/* Toggle Button */}
        <div className="flex items-center gap-3 mt-4 mb-6">
          <span className="text-sm text-gray-600">Assign for only kids</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isKid}
              onChange={() => setIsKid((prev) => !prev)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 transition-all duration-300"></div>
            <div
              className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${
                isKid ? "translate-x-5" : ""
              }`}
            ></div>
          </label>
        </div>
        <Select
          closeMenuOnSelect={false}
          isMulti
          name="subjects"
          options={studentOptions.filter(
            (value) =>
              !selectedSubject.some(
                (v) =>
                  v.value.subject == value.value.subject &&
                  v.value.package == value.value.package
              )
          )}
          value={selectedSubject}
          onChange={(selected) =>
            setSelectedSubject(
              (selected ?? []) as {
                value: { package: string; subject: string };
                label: string;
              }[]
            )
          }
          className="mt-2"
          classNamePrefix="select"
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: "0.75rem",
              borderColor: "#a78bfa",
              boxShadow: "0 0 0 2px #a78bfa33",
              minHeight: "48px",
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected
                ? "#a78bfa"
                : state.isFocused
                ? "#f3e8ff"
                : "white",
              color: state.isSelected ? "white" : "#4b5563",
              fontWeight: state.isSelected ? "bold" : "normal",
            }),
          }}
        />
      </div>
      <Button
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:from-pink-500 hover:to-purple-500 transition-all duration-300 flex items-center justify-center"
        onClick={() => {
          if (selectedSubject.length > 0) {
            addPackage(
              coursesPackageId,
              isKid,
              selectedSubject.map((s) => s.value)
            );
          }
        }}
      >
        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
        Assign
      </Button>
    </div>
  );
}

export default StudentAssignmentForm;