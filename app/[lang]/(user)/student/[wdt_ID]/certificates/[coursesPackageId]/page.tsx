"use client";

import { useRef } from "react";
import html2canvas from "html2canvas";
import { PDFDocument } from "pdf-lib";
import Certificate from "@/components/Certificate";
import getCertificateData from "@/actions/student/certificate";
import { useParams } from "next/navigation";
import useAction from "@/hooks/useAction";
// const dat=await getCertificateData(wdt_ID,coursesPackageId);

export default function CertificatePage() {
  const params = useParams();
  const wdt_ID = Number(params.wdt_ID);
  const coursesPackageId = String(params.coursesPackageId);
  const [data] = useAction(
    getCertificateData,
    [true, (response) => console.log(response)],
    wdt_ID,
    coursesPackageId
  );
  const studentName = data?.sName;
  const studentId = data?.studId;
  const packageName = data?.cName;
  const packageId = data?.cId;
  const startTime=data?.startTime.toLocaleDateString();
  const endTime = data?.endTime.toLocaleDateString();
  const score = data?.result.score;
  const correct = data?.result.correct;
  const total = data?.result.total;

  // const [name, setName] = useState('John Doe');
  // const [course, setCourse] = useState('Next.js Masterclass');
  // const [date, setDate] = useState(new Date().toLocaleDateString());
  // useEffect(()={return true;}[data]);
  const certRef = useRef<HTMLDivElement>(null);
  if (
    !studentName ||
    !studentId ||
    !packageId ||
    !packageName ||
    !startTime ||
    !endTime ||
    !score ||
    !correct ||
    !total
  ) {
    return;
  }

  const handleDownloadAndSave = async () => {
    // 1. Save to MySQL via API
    const res = await fetch("/api/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, packageId }),
    });
    console.log("result", res);
    if (!res.ok) {
      alert("Failed to save certificate.");
      return;
    }

    // 2. Generate PDF (same as before)
    if (!certRef.current) return;

    const canvas = await html2canvas(certRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([canvas.width, canvas.height]);
    const pngImage = await pdf.embedPng(imgData);
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
    });

    const pdfBytes = await pdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.sName.replace(/\s+/g, "_")}_certificate.pdf`;
    a.click();
    URL.revokeObjectURL(url);

    alert("Certificate saved and downloaded!");
  };

  return (
    <div className="md:ml-35 overflow-y-auto">
      <h1 className="text-2xl font-bold m-4">Generated Certificate</h1>
      <button
        className="flex md:hidden bg-blue-600 text-white mx-4 px-4 py-2 rounded"
        onClick={handleDownloadAndSave}
      >
        Download Certificate as PDF
      </button>
      <div ref={certRef} className="mx-4 overflow-hidden">
        <Certificate
          studentName={studentName}
          packageName={packageName}
          correct={correct}
          total={total}
          score={score}
          startDate={startTime}
          endDate={endTime}
        />{" "}
      </div>
      <button
        className="hidden md:flex mb-8 bg-blue-600 text-white mx-4 px-4 py-2 rounded"
        onClick={handleDownloadAndSave}
      >
        Download Certificate as PDF
      </button>
    </div>
  );
}
