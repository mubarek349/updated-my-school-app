"use client";
import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";

interface MenuTitleProps {
  className?: string;
  title?: string;
  subtitle?: string;
  showBadge?: boolean;
  badgeText?: string;
  badgeVariant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "premium";
  logoSrc?: string;
  logoAlt?: string;
  logoSize?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const MenuTitle: React.FC<MenuTitleProps> = ({
  className,
  title = "Darulkubra",
  subtitle,
  showBadge = false,
  badgeText = "New",
  badgeVariant = "default",
  logoSrc = "https://darelkubra.com/wp-content/uploads/2024/06/cropped-ዳሩል-ሎጎ-150x150.png",
  logoAlt = "Darulkubra logo",
  logoSize = "md",
  onClick,
}) => {
  const { theme } = useTheme();

  // Responsive logo size
  const logoSizeClasses = {
    sm: "w-8 h-8 md:w-10 md:h-10",
    md: "w-10 h-10 md:w-12 md:h-12",
    lg: "w-14 h-14 md:w-16 md:h-16",
  };

  return (
    <motion.div
      className={cn(
        "flex items-center gap-3 sm:gap-4 w-full",
        "transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400",
        onClick ? "cursor-pointer" : "cursor-default",
        className
      )}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : "presentation"}
      initial={false}
      animate={false}
    >
      <div className={cn("relative flex-shrink-0", logoSizeClasses[logoSize])}>
        <Image
          src={logoSrc}
          alt={logoAlt}
          fill
          sizes="(max-width: 768px) 40px, 48px"
          className="object-cover rounded-lg border border-gray-200 dark:border-gray-700 bg-white"
          priority
        />
        {showBadge && (
          <Badge
            className={cn(
              "absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5 rounded-full",
              "shadow-sm",
              badgeVariant === "premium" &&
                "bg-gradient-to-r from-amber-500 to-pink-500"
            )}
          >
            {badgeText}
          </Badge>
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span
          className={cn(
            "text-base sm:text-lg font-semibold truncate",
            theme === "dark" ? "text-white" : "text-gray-900"
          )}
        >
          {title}
        </span>
        {subtitle && (
          <span
            className={cn(
              "text-xs sm:text-sm truncate",
              theme === "dark"
                ? "text-gray-400"
                : "text-gray-600"
            )}
          >
            {subtitle}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default MenuTitle;
        
