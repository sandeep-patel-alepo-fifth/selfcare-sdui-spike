"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      variant = "default",
      size = "md",
      showLabel = false,
      label,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const variants = {
      default: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      success: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      warning: "bg-gradient-to-r from-amber-500 to-amber-600",
      error: "bg-gradient-to-r from-red-500 to-red-600",
      info: "bg-gradient-to-r from-blue-500 to-blue-600",
    };

    const sizes = {
      sm: "h-1",
      md: "h-2",
      lg: "h-3",
    };

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {(showLabel || label) && (
          <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-600">{label}</span>
            {showLabel && (
              <span className="font-medium text-slate-900">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        <div
          className={cn(
            "w-full overflow-hidden rounded-full bg-slate-100",
            sizes[size]
          )}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300 ease-out",
              variants[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
