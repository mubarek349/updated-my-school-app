"use client";

import { BarChart, List, Layout, Sheet } from "lucide-react";
import { SidebarItem } from "./sidebar-item";
import { usePathname } from "next/navigation";

const teacherRoutes = [
  {
    icon: List,
    label: "Courses Packages",
    href: "/en/admin/coursesPackages",
  },
  {
    icon: BarChart,
    label: "Analytics",
    href: "/en/admin/analytics",
  },
];

const studentRoutes = [
  {
    icon: Layout,
    label: "Home",
    href: "/en",
  },
  // You can add more student routes here if needed
];

export const SidebarRoutes = () => {
  const pathname = usePathname();
  const isTeacherPage = pathname?.includes("/en/admin");

  const routes = isTeacherPage ? teacherRoutes : studentRoutes;

  return (
    <div className="flex flex-col w-full">
      
      {routes.map((route) => (
        <SidebarItem
          key={route.href}
          icon={route.icon}
          label={route.label}
          href={route.href}
        />
      ))}
    </div>
  );
};
