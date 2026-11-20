"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "emblem" | "full" | "horizontal" | "text-lockup";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showTagline?: boolean;
  priority?: boolean;
}

const sizeConfig = {
  xs: {
    emblem: 20,
    text: "text-sm",
    tagline: "text-[9px]",
    horizontalH: 22,
    horizontalW: 88,
    fullH: 30,
    fullW: 36,
  },
  sm: {
    emblem: 28,
    text: "text-base",
    tagline: "text-[10px]",
    horizontalH: 28,
    horizontalW: 115,
    fullH: 42,
    fullW: 50,
  },
  md: {
    emblem: 36,
    text: "text-xl",
    tagline: "text-[11px]",
    horizontalH: 36,
    horizontalW: 150,
    fullH: 56,
    fullW: 68,
  },
  lg: {
    emblem: 48,
    text: "text-2xl",
    tagline: "text-xs",
    horizontalH: 48,
    horizontalW: 200,
    fullH: 72,
    fullW: 88,
  },
  xl: {
    emblem: 64,
    text: "text-3xl",
    tagline: "text-sm",
    horizontalH: 64,
    horizontalW: 260,
    fullH: 96,
    fullW: 116,
  },
};

export default function Logo({
  variant = "text-lockup",
  size = "md",
  className,
  showTagline = false,
  priority = false,
}: LogoProps) {
  const cfg = sizeConfig[size];

  if (variant === "emblem") {
    return (
      <div className={cn("relative inline-flex items-center justify-center shrink-0", className)}>
        <Image
          src="/logo-emblem.png"
          alt="GlobizHR Logo"
          width={cfg.emblem}
          height={cfg.emblem}
          priority={priority}
          className="object-contain"
        />
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div className={cn("relative inline-flex flex-col items-center justify-center shrink-0", className)}>
        <Image
          src="/logo.png"
          alt="GlobizHR Logo"
          width={cfg.fullW * 2}
          height={cfg.fullH * 2}
          priority={priority}
          className="object-contain max-h-full w-auto"
        />
      </div>
    );
  }

  if (variant === "horizontal") {
    return (
      <div className={cn("relative inline-flex items-center shrink-0", className)}>
        <Image
          src="/logo-horizontal.png"
          alt="GlobizHR"
          width={cfg.horizontalW}
          height={cfg.horizontalH}
          priority={priority}
          className="object-contain max-h-full w-auto"
        />
      </div>
    );
  }

  // "text-lockup": Emblem + Crisp Typography (with optional tagline)
  return (
    <div className={cn("inline-flex items-center gap-2.5 shrink-0 select-none", className)}>
      <div className="relative shrink-0 flex items-center justify-center">
        <Image
          src="/logo-emblem.png"
          alt="GlobizHR Logo"
          width={cfg.emblem}
          height={cfg.emblem}
          priority={priority}
          className="object-contain"
        />
      </div>
      <div className="flex flex-col leading-none">
        <div className={cn("font-black tracking-tight", cfg.text)}>
          <span className="text-[#0066B2] dark:text-[#38BDF8]">Globiz</span>
          <span className="text-[#F7941D]">Hr</span>
        </div>
        {showTagline && (
          <span className={cn("text-muted-foreground font-medium tracking-tight mt-0.5", cfg.tagline)}>
            A complete HR management solution
          </span>
        )}
      </div>
    </div>
  );
}
