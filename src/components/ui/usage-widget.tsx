"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { Smartphone, Phone, MessageSquare, Wifi } from "lucide-react";
import { Progress } from "./progress";

export interface UsageItem {
  type: "data" | "voice" | "sms" | "wifi";
  used: number | string;
  total: number | string;
  unit: string;
  label?: string;
}

export interface UsageWidgetProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  items: UsageItem[];
  variant?: "card" | "compact" | "detailed";
}

const icons = {
  data: Smartphone,
  voice: Phone,
  sms: MessageSquare,
  wifi: Wifi,
};

const formatUsage = (value: number, unit: string): string => {
  if (unit === "GB" && value >= 1000) {
    return `${(value / 1000).toFixed(1)} TB`;
  }
  if (unit === "MB" && value >= 1000) {
    return `${(value / 1000).toFixed(1)} GB`;
  }
  if (unit === "min" && value >= 60) {
    return `${Math.floor(value / 60)}h ${value % 60}m`;
  }
  return `${value} ${unit}`;
};

const getVariantColor = (percentage: number): "default" | "success" | "warning" | "error" => {
  if (percentage >= 90) return "error";
  if (percentage >= 70) return "warning";
  return "default";
};

const UsageWidget = forwardRef<HTMLDivElement, UsageWidgetProps>(
  ({ className, title = "Usage", items, variant = "card", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl bg-white p-6",
          variant === "card" && "border border-slate-200 shadow-sm",
          className
        )}
        {...props}
      >
        {title && (
          <h3 className="mb-4 text-lg font-semibold text-slate-900">{title}</h3>
        )}
        <div className={cn("space-y-5", variant === "compact" && "space-y-4")}>
          {items.map((item, index) => {
            const Icon = icons[item.type];
            // Parse numbers from strings if needed
            const used = typeof item.used === "string" ? parseFloat(item.used) || 0 : item.used;
            const total = typeof item.total === "string" ? parseFloat(item.total) || 1 : item.total;
            const percentage = (used / total) * 100;
            const variantColor = getVariantColor(percentage);

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
                      <Icon className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {item.label ||
                        item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    {formatUsage(used, item.unit)} / {formatUsage(total, item.unit)}
                  </span>
                </div>
                <Progress value={used} max={total} variant={variantColor} size="md" />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

UsageWidget.displayName = "UsageWidget";

export { UsageWidget };
