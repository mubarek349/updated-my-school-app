"use client";

import React, { useRef } from "react";
import Certificate from "@/components/Certificate";
import getCertificateData from "@/actions/student/certificate";
import { useParams } from "next/navigation";
import useAction from "@/hooks/useAction";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export default function CertificatePage() {
  const params = useParams();
  const wdt_ID = Number(params?.wdt_ID);
  const coursesPackageId = String(params?.coursesPackageId);

  const [data] = useAction(
    getCertificateData,
    [true, (response) => console.log("fetched data", response)],
    wdt_ID,
    coursesPackageId
  );

  const certRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    const node = certRef.current;
    if (!node) return;

    // Force desktop layout for export
    node.classList.add("force-desktop");

    window.scrollTo(0, 0); // Prevent clipping on mobile

    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [img.width, img.height],
        });

        pdf.addImage(dataUrl, "PNG", 0, 0, img.width, img.height);
        pdf.save("certificate.pdf");
      };
    } catch (error) {
      console.error("Failed to generate certificate:", error);
    } finally {
      node.classList.remove("force-desktop");
    }
  };

  const studentName = data?.sName;
  const studentId = data?.studId;
  const packageName = data?.cName;
  const packageId = data?.cId;
  const startTime = data?.startTime.toLocaleDateString();
  const endTime = data?.endTime.toLocaleDateString();
  const score = data?.result.score;
  const correct = data?.result.correct;
  const total = data?.result.total;

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
    return null;
  }

  return (
    <div className="md:ml-35 overflow-y-auto">
      <Link
        href={`/en/student/${studentId}/profile`}
        className="flex items-center text-sm hover:opacity-75 transition mb-6 mt-4 ml-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        ወደ ፕሮፋይል ገጽ
      </Link>

      <h1 className="text-xl font-bold m-4">Generated Certificate</h1>

      <button
        className="flex md:hidden bg-blue-600 text-white mx-4 px-4 py-2 rounded gap-2"
        onClick={handleDownload}
      >
       <Download className=""/>
        Certificate as PDF
      </button>

      <div ref={certRef} className="mx-4 overflow-hidden certificate-container">
        <Certificate
          studentName={studentName}
          packageName={packageName}
          correct={correct}
          total={total}
          score={score}
          startDate={startTime}
          endDate={endTime}
        />
      </div>

      <button
        className="hidden md:flex mb-8 bg-blue-600 text-white mx-4 px-4 py-2 rounded gap-2"
        onClick={handleDownload}
      >
        <Download className=""/>
        Certificate as PDF
      </button>
    </div>
  );
}
