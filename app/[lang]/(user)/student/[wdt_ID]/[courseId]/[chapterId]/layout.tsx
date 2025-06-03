import React from "react";

export default async function layout({
  children,
}: // params,
{
  children: React.ReactNode;
  params: Promise<{ wdt_ID: number; courseId: string; chapterId: string }>;
}) {
  // const wdt_ID
  // const student = await prisma.wpos_wpdatatable_23.findFirst({
  //   where: {
  //     wdt_ID: wdt_ID,
  //     status: { in: ["active", "notyet"] },
  //   },
  //   select: {
  //     wdt_ID: true,
  //     name: true,
  //   },
  // });
  return <div className="overflow-hidden grid">{children}</div>;
}
