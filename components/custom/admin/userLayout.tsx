"use client";
import React from "react";
import { useState } from "react";
import Link from "next/link";
import { LightDarkToggle } from "../../ui/light-dark-toggle";

export default function UserLayout({
  menu,
  children,
}: {
  menu: {
    label: string;
    url: string;
    icon: React.ReactNode;
  }[];
  children: React.ReactNode;
}) {
  const [sidebar, setSidebar] = useState(false);
  return (
    <div className="grid lg:grid-cols-[auto_1fr] overflow-hidden ">
      <Sidebar {...{ sidebar, setSidebar, menu }} />
      <div className="flex gap-2 flex-col overflow-hidden ">
        <Header setSidebar={setSidebar} />
        <div className="min-h-[calc(100dvh-3.6rem)] p-2 rounded-xl overflow-hidden grid">
          {children}
        </div>
      </div>
    </div>
  );
}

// function Sidebar({
//   sidebar,
//   setSidebar,
//   menu,
// }: {
//   sidebar: boolean;
//   setSidebar: React.Dispatch<React.SetStateAction<boolean>>;
//   menu: {
//     label: string;
//     url: string;
//     icon: React.ReactNode;
//   }[];
// }) {
//   return (
//     <div
//       className={`${
//         sidebar ? "translate-x-0" : "-translate-x-full"
//       } lg:translate-x-0 transition-transform duration-300 lg:block bg-complementary-400 shadow-lg rounded-xl p-4`}
//     >
//       <div className="flex flex-col gap-4">
//         <h1>hello fuad</h1>
//         {menu.map((item) => (
//           <Link
//             key={item.label}
//             href={item.url}
//             className="flex items-center gap-2"
//           >
//             {item.icon}
//             <span>{item.label}</span>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }

function Sidebar({
  sidebar,
  // setSidebar,
  menu,
}: {
  sidebar: boolean;
  // setSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  menu: { label: string; url: string; icon: React.ReactNode }[];
}) {
  return (
    <aside
      className={`fixed z-40 top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl rounded-r-xl p-6 transform ${
        sidebar ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 lg:static lg:translate-x-0`}
    >
      {/* Sidebar Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Codelingo</h1>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex flex-col gap-2">
        {menu.map((item) => (
          <Link
            key={item.label}
            href={item.url}
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-gray-700 hover:text-blue-400 group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">
              {item.icon}
            </span>
            <span className="text-base font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Info */}
      <div className="absolute bottom-6 left-6 right-6 border-t border-gray-700 pt-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">
          SM
        </div>
        <div>
          <p className="font-semibold">Scott M.</p>
          <p className="text-xs text-gray-400">Instructor</p>
        </div>
      </div>
    </aside>
  );
}

// function Header({
//   setSidebar,
// }: {
//   setSidebar: React.Dispatch<React.SetStateAction<boolean>>;
// }) {
//   return (
//     <div className="flex justify-between items-center p-3 bg-accent-300 shadow-lg rounded-xl">
//       <button onClick={() => setSidebar((prev) => !prev)}>
//         Toggle Sidebar
//       </button>
//       <h1 className="text-xl font-bold">Header</h1>
//       <LightDarkToggle/>
//     </div>
//   );
// }

// import { Button } from "@/components/ui/button";

function Header({
  setSidebar,
}: {
  setSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-md rounded-xl">
      <button
        onClick={() => setSidebar((prev) => !prev)}
        className="text-gray-700 hover:text-black"
      >
        ☰
      </button>
      {/* <h1 className="text-xl font-bold">Figma from A to Z</h1>
      <div className="flex gap-3">
        <Button variant="outline">Share</Button>
        <Button className="bg-blue-500 text-white">Enroll Now</Button>
      </div> */}
      <LightDarkToggle />
    </header>
  );
}
