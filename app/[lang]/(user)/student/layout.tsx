"use client";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="grid overflow-hidden ">{children}</div>;
}
