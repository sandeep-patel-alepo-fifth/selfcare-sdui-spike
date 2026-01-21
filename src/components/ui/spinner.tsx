"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
}

const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", label, ...props }, ref) => {
    const sizes = {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    };

    return (
      <div
        ref={ref}
        role="status"
        className={cn("flex items-center gap-2", className)}
        {...props}
      >
        <Loader2 className={cn("animate-spin text-indigo-500", sizes[size])} />
        {label && (
          <span className="text-sm text-slate-600">{label}</span>
        )}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

Spinner.displayName = "Spinner";

export { Spinner };
