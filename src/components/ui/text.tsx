"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface TextProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "body" | "small" | "caption" | "overline";
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?: "primary" | "secondary" | "muted" | "success" | "warning" | "error" | "info";
  align?: "left" | "center" | "right";
  truncate?: boolean;
}

const Text = forwardRef<HTMLSpanElement, TextProps>(
  (
    {
      className,
      variant = "body",
      weight = "normal",
      color = "primary",
      align,
      truncate = false,
      ...props
    },
    ref
  ) => {
    const variants = {
      body: "text-base",
      small: "text-sm",
      caption: "text-xs",
      overline: "text-xs uppercase tracking-wider",
    };

    const weights = {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    };

    const colors = {
      primary: "text-slate-900",
      secondary: "text-slate-600",
      muted: "text-slate-400",
      success: "text-emerald-600",
      warning: "text-amber-600",
      error: "text-red-600",
      info: "text-blue-600",
    };

    const aligns = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    };

    return (
      <span
        ref={ref}
        className={cn(
          variants[variant],
          weights[weight],
          colors[color],
          align && aligns[align],
          truncate && "truncate",
          className
        )}
        {...props}
      />
    );
  }
);

Text.displayName = "Text";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  color?: "primary" | "secondary" | "muted";
  align?: "left" | "center" | "right";
}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 1, color = "primary", align, ...props }, ref) => {
    const Tag = `h${level}` as const;

    const levels = {
      1: "text-4xl font-bold tracking-tight",
      2: "text-3xl font-bold tracking-tight",
      3: "text-2xl font-semibold",
      4: "text-xl font-semibold",
      5: "text-lg font-medium",
      6: "text-base font-medium",
    };

    const colors = {
      primary: "text-slate-900",
      secondary: "text-slate-600",
      muted: "text-slate-400",
    };

    const aligns = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    };

    return (
      <Tag
        ref={ref}
        className={cn(levels[level], colors[color], align && aligns[align], className)}
        {...props}
      />
    );
  }
);

Heading.displayName = "Heading";

export { Text, Heading };
