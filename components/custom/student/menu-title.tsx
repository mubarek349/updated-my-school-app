"use client";
import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";
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
  gradientEffect?: boolean;
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
  gradientEffect = true,
}) => {
  const { theme } = useTheme();
  const controls = useAnimation();

  // Logo size classes
  const logoSizeClasses = {
    sm: "w-10 h-10 md:w-12 md:h-12",
    md: "w-12 h-12 md:w-16 md:h-16",
    lg: "w-16 h-16 md:w-20 md:h-20",
  };

  // Animation variants
  const logoVariants = {
    initial: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      filter:
        theme === "dark"
          ? "drop-shadow(0 4px 12px rgba(255,255,255,0.15))"
          : "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10,
      },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  };

  const badgeVariants = {
    initial: { scale: 1, y: 0 },
    hover: {
      scale: 1.1,
      y: -2,
      transition: { type: "spring", stiffness: 500 },
    },
  };

  const titleVariants = {
    initial: {
      y: 0,
      opacity: 1,
      background: "transparent",
      color: theme === "dark" ? "#ffffff" : "#1e293b",
    },
    hover: {
      y: -2,
      ...(gradientEffect && {
        background:
          theme === "dark"
            ? "linear-gradient(90deg, #ffffff 0%, #60a5fa 80%)"
            : "linear-gradient(90deg, #1e293b 0%, #3b82f6 80%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }),
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className={cn(
        "flex items-center gap-4 ",
        "transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400",
        onClick ? "cursor-pointer" : "cursor-default",
        className
      )}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : "presentation"}
      whileHover="hover"
      whileTap="tap"
      initial="initial"
      animate={controls}
    >
      {/* Logo without rounded corners or background */}
      <motion.div
        className={cn("relative", logoSizeClasses[logoSize])}
        variants={logoVariants}
        animate={controls}
      >
        <Image
          src={logoSrc}
          alt={logoAlt}
          fill
          sizes="(max-width: 768px) 48px, 64px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority
        />
        {showBadge && (
          <motion.div variants={badgeVariants}>
            <Badge
              className={cn(
                "absolute -top-2 -right-2 text-xs font-bold px-2 py-0.5 rounded-full",
                "shadow-md hover:shadow-lg transition-all duration-300",
                badgeVariant === "premium" &&
                  "bg-gradient-to-r from-amber-500 to-pink-500"
              )}
            >
              {badgeText}
            </Badge>
          </motion.div>
        )}
      </motion.div>

      {/* Title and Subtitle */}
      <div className="flex flex-col gap-1 overflow-hidden">
        <motion.h1
          className={cn(
            "text-xl md:text-2xl font-bold tracking-tight truncate",
            "bg-clip-text",
            theme === "dark" ? "text-white" : "text-gray-900",
            "transition-all duration-300"
          )}
          variants={titleVariants}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className={cn(
              "text-xs md:text-sm font-medium truncate",
              theme === "dark"
                ? "text-gray-400 group-hover:text-blue-300"
                : "text-gray-600 group-hover:text-blue-600",
              "transition-colors duration-300"
            )}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default MenuTitle;
