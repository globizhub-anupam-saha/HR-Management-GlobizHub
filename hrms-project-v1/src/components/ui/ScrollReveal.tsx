"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom-in" | "fade";
  delay?: number; // milliseconds
  duration?: number; // milliseconds
  threshold?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 700,
  threshold = 0.12,
  once = true,
  className,
  style,
  ...props
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.unobserve(el);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        },
        { threshold, rootMargin: "0px 0px -40px 0px" }
      );

      observer.observe(el);
      return () => observer.disconnect();
    } else {
      setIsVisible(true);
    }
  }, [threshold, once]);

  const getTransform = () => {
    if (isVisible) return "translate3d(0, 0, 0) scale(1)";
    switch (animation) {
      case "fade-up":
        return "translate3d(0, 28px, 0)";
      case "fade-down":
        return "translate3d(0, -28px, 0)";
      case "fade-left":
        return "translate3d(28px, 0, 0)";
      case "fade-right":
        return "translate3d(-28px, 0, 0)";
      case "zoom-in":
        return "scale(0.96)";
      case "fade":
      default:
        return "translate3d(0, 0, 0)";
    }
  };

  return (
    <div
      ref={ref}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionProperty: "opacity, transform",
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: isVisible ? "auto" : "opacity, transform",
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default ScrollReveal;
