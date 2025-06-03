"use client";
import { Menu } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export const MobileSidebar = () => {
    return (
        <Sheet>
            <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
                <Menu />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-white" aria-describedby="dialog-description">
                {/* Ensure accessibility */}
                <VisuallyHidden>
                    <SheetTitle>Menu</SheetTitle>
                
                    {/* Add SheetDescription for screen reader users */}
                    <SheetDescription id="dialog-description" className="text-sm text-muted-foreground">
                    </SheetDescription>
                </VisuallyHidden>

                <Sidebar />
            </SheetContent>
        </Sheet>
    );
};
