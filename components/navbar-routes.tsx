"use client";

import { Button } from "@/components/ui/button";
import { AlignLeft, LogOut, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface CourseNavbarProps {
  chat_id: string;
  sidebar: boolean;
  setSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NavbarRoutes = ({
  chat_id,
  sidebar,
  setSidebar,
}: CourseNavbarProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const isTeacherPage = pathname?.startsWith("/en/admin");
  const isCoursePage = pathname?.includes(`/${chat_id}`);

  const lang = "en";
  const onClick = () => {
    router.push("/");
  };

  return (
    <nav className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md flex gap-2">
      <Button
        className="md:hidden"
        onClick={() => {
          setSidebar((prev) => !prev);
        }}
      >
        {sidebar ? <X className="size-4" /> : <AlignLeft className="size-4" />}
      </Button>

      {/* <div className="flex-1"></div> */}

      <div className="flex gap-x-2 ml-auto">
        {isTeacherPage || isCoursePage ? (
          <Button
            onClick={onClick}
            className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Exit</span>
          </Button>
        ) : (
          <Link href={`/${lang}/admin/coursesPackages`}>
            <Button
              size="sm"
              variant="ghost"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Teacher Mode
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};
