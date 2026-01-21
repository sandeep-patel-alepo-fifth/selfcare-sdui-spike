"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  description?: string;
  switchSize?: "sm" | "md" | "lg";
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, switchSize = "md", id, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s/g, "-");

    const sizes = {
      sm: { track: "w-8 h-4", thumb: "h-3 w-3", translate: "translate-x-4" },
      md: { track: "w-11 h-6", thumb: "h-5 w-5", translate: "translate-x-5" },
      lg: { track: "w-14 h-7", thumb: "h-6 w-6", translate: "translate-x-7" },
    };

    return (
      <div className="flex items-center gap-3">
        <div className="relative inline-flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={switchId}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "rounded-full bg-slate-200 transition-colors duration-200",
              "peer-checked:bg-indigo-500",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
              sizes[switchSize].track,
              className
            )}
          />
          <div
            className={cn(
              "absolute left-0.5 rounded-full bg-white shadow-md transition-transform duration-200",
              "peer-checked:" + sizes[switchSize].translate,
              sizes[switchSize].thumb
            )}
          />
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={switchId}
                className="text-sm font-medium text-slate-900 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <span className="text-sm text-slate-500">{description}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
