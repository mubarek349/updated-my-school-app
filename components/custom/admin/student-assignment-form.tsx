"use client";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import useAction from "@/hooks/useAction";
import {
  assignPackage,
  // getStudent,
  getStudSubject,
  // setPackage,
} from "@/actions/admin/packageassign";
import { useParams } from "next/navigation";
import { Button } from "../../ui/button";
// import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Label } from "../../ui/label";

function StudentAssignmentForm() {
  const { coursesPackageId } = useParams<{ coursesPackageId: string }>();
  // const [students] = useAction(getStudent, [true, () => {}], coursesPackageId);
  const [subjects] = useAction(getStudSubject, [true, () => {}]);
  // const router = useRouter();
  const [res, addPackage, loading] = useAction(assignPackage, [, () => {}]);

  useEffect(() => {
    if (res) {
      toast.success("successfully assigned");
      
    }
  }, [res]);

  const [selectedSubject, setSelectedSubject] = useState<
    { value: string; label: string }[]
  >([]);

  const studentOptions =
    Array.isArray(subjects) && subjects.length > 0
      ? subjects.map((subject) => ({
          value: subject.subject,
          label: subject.subject,
        }))
      : [];

  return (
    <div
    // onSubmit={handleSubmit}
    >
      {/* <div>
        <label>Select Subject:</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="" disabled>
            Select a subject
          </option>
          {Array.isArray(subjects) && subjects.length > 0 ? (
            subjects.map(({ subject }) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))
          ) : (
            <option disabled>No subjects found</option>
          )}
        </select>
      </div> */}
      <div style={{ margin: "1rem 0" }}>
        <Label className="font-medium">
          Select Student&apos;s Subject to be assigned:
        </Label>
        <Select
          closeMenuOnSelect={false}
          isMulti
          name="subjects"
          options={studentOptions.map((v) => ({
            label: v.label ?? "",
            value: v.value ?? "",
          }))}
          value={selectedSubject}
          onChange={(selected) =>
            setSelectedSubject(selected as { value: string; label: string }[])
          }
          className="basic-multi-select mt-4"
          classNamePrefix="select"
        />
      </div>
      <Button
        disabled={loading}
        className="mb-4"
        onClick={() => {
          if (selectedSubject.length > 0) {
            addPackage(
              coursesPackageId,
              selectedSubject.map((s) => s.label)
            );

          }
          console.log("AK >> ");
        }}
      >
        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
        Assign
      </Button>
    </div>
  );
}

export default StudentAssignmentForm;
