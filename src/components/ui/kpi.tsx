"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface KPIProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  variant?: "default" | "compact" | "large";
}

const KPI = forwardRef<HTMLDivElement, KPIProps>(
  (
    {
      className,
      label,
      value,
      unit,
      change,
      changeLabel,
      icon,
      variant = "default",
      ...props
    },
    ref
  ) => {
    const getTrendIcon = () => {
      if (change === undefined) return null;
      if (change > 0) return <TrendingUp className="h-4 w-4" />;
      if (change < 0) return <TrendingDown className="h-4 w-4" />;
      return <Minus className="h-4 w-4" />;
    };

    const getTrendColor = () => {
      if (change === undefined) return "";
      if (change > 0) return "text-emerald-600";
      if (change < 0) return "text-red-600";
      return "text-slate-400";
    };

    const sizes = {
      default: {
        container: "p-5",
        label: "text-sm",
        value: "text-2xl",
        change: "text-sm",
      },
      compact: {
        container: "p-4",
        label: "text-xs",
        value: "text-xl",
        change: "text-xs",
      },
      large: {
        container: "p-8",
        label: "text-base",
        value: "text-4xl",
        change: "text-base",
      },
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-slate-200 bg-white shadow-sm",
          sizes[variant].container,
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <span
            className={cn(
              "font-medium text-slate-600",
              sizes[variant].label
            )}
          >
            {label}
          </span>
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-2 flex items-baseline gap-1">
          <span
            className={cn(
              "font-bold text-slate-900",
              sizes[variant].value
            )}
          >
            {value}
          </span>
          {unit && (
            <span className="text-sm text-slate-400">{unit}</span>
          )}
        </div>

        {change !== undefined && (
          <div
            className={cn(
              "mt-2 flex items-center gap-1",
              getTrendColor(),
              sizes[variant].change
            )}
          >
            {getTrendIcon()}
            <span className="font-medium">{Math.abs(change)}%</span>
            {changeLabel && (
              <span className="text-slate-400">{changeLabel}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

KPI.displayName = "KPI";

export { KPI };
