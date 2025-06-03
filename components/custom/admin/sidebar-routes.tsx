"use client";
import { BarChart, List, Layout } from "lucide-react";
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
export const SidebarRoutes = () => {
  const pathname = usePathname();

  //   const segments = pathname?.split("/") ?? [];
  //   const chat_id = segments[0]; // Extracts the last segment

  const isTeacherPage = pathname?.includes("/en/admin");

  // const chatId = pathname.split("/")[1];

  const routes = isTeacherPage
    ? teacherRoutes
    : [
        {
          icon: Layout,
          label: "Home",
          href: "/en",
        },
        // {
        //   icon: Compass,
        //   label: "Browse",
        //   href: `/${chatId}/search`,
        // },
      ];
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
