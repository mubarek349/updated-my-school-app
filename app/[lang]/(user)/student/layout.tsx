"use client";
import React, { createContext, useContext, useState } from "react";
import MainMenu from "@/components/custom/student/main-menu";
import MenuTitle from "@/components/custom/student/menu-title";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { MenuIcon } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import useAction from "@/hooks/useAction";
import { getPackageData } from "@/actions/student/package";
import { useParams } from "next/navigation";
// import { useParams } from "next/navigation";
// import useAction from "@/hooks/useAction";
// import { getActivePackageProgress } from "@/actions/student/progress";
// import { Progress } from "@/components/ui/progress";

// // Skeleton loader for progress bar
// function ProgressSkeleton() {
//   return (
//     <div className="w-[60%] mx-auto h-4 bg-gray-200 rounded animate-pulse mb-2" />
//   );
// }

const MenuContext = createContext<{ refresh: () => void } | null>(null);

export const useMainMenu = () => {
  const value = useContext(MenuContext);

  if (!value) throw new Error("you need to provide first");

  return value;
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // const [progress, setProgress] = useState(0);
  // const [completed, setCompleted] = useState(0);
  // const [total, setTotal] = useState(1); // set to 1 to avoid division by zero

  // // UseAction for progress data
  // const [progressData, , isLoading] = useAction(
  //   getActivePackageProgress,
  //   [true, (response) => console.log(response)],
  //   String(useParams().wdt_ID)
  // );

  // useEffect(() => {
  //   if (progressData && !isLoading) {
  //     const completedChapters = progressData.completedChapters || 0;
  //     const totalChapters = progressData.totalChapters || 1;
  //     // setCompleted(completedChapters);
  //     // setTotal(totalChapters);
  //     setProgress((completedChapters / totalChapters) * 100);
  //   }
  // }, [progressData, isLoading]);
  const { wdt_ID } = useParams<{ wdt_ID: string }>();
  const [data, refresh] = useAction(
    getPackageData,
    [true, (response) => console.log(response)],
    Number(wdt_ID)
  );

  return (
    <div className="md:grid md:grid-cols-[250px_1fr] h-auto overflow-hidden">
      <MainMenu data={data} className="hidden md:flex" />
      {isMobile && (
        <div className="p-4 flex justify-between md:hidden sticky top-0 left-0  border-b border-border">
          <MenuTitle />
          {/* Hamburger button outside Drawer */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-md hover:bg-sky-100"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
          <Drawer
            direction="right"
            open={mobileMenuOpen}
            onOpenChange={(open) => setMobileMenuOpen(open)}
          >
            <DrawerContent>
              <MainMenu data={data} className="w-64" />
              {/* Close button inside Drawer */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 px-4 py-2 bg-sky-200 rounded w-full"
              >
                Close
              </button>
            </DrawerContent>
          </Drawer>
        </div>
      )}
      <MenuContext.Provider value={{ refresh }}>
        <div className="h-dvh overflow-hidden grid ">{children}</div>
      </MenuContext.Provider>
    </div>
  );
}
