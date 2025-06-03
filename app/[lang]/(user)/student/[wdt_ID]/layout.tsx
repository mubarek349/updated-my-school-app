import React from "react";

async function layout({
  children,
  // params,
}: {
  children: React.ReactNode;
  params: Promise<{ wdt_ID: number; lang: string }>;
}) {
  
  return <div className="overflow-hidden grid">{children}</div>;
}

export default layout;
