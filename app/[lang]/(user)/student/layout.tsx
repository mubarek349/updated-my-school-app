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

const MenuContext = createContext<{ refresh: () => void } | null>(null);

export const useMainMenu = () => {
  const value = useContext(MenuContext);

  if (!value) throw new Error("you need to provide first");

  return value;
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const params = useParams<{ wdt_ID: string }>();
  const wdt_ID = params?.wdt_ID;
  const [data, refresh] = useAction(
    getPackageData,
    [true, (response) => console.log(response)],
    Number(wdt_ID)
  );
  return (
    <MenuContext.Provider value={{ refresh }}>
      <div className="grid overflow-hidden ">{children}</div>;
    </MenuContext.Provider>
  );
}
