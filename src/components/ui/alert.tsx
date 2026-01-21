"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { AlertCircle, CheckCircle, Info, XCircle, X } from "lucide-react";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error" | "info";
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    { className, variant = "default", title, dismissible = false, onDismiss, children, ...props },
    ref
  ) => {
    const variants = {
      default: "bg-slate-50 border-slate-200 text-slate-800",
      success: "bg-emerald-50 border-emerald-200 text-emerald-800",
      warning: "bg-amber-50 border-amber-200 text-amber-800",
      error: "bg-red-50 border-red-200 text-red-800",
      info: "bg-blue-50 border-blue-200 text-blue-800",
    };

    const iconColors = {
      default: "text-slate-500",
      success: "text-emerald-500",
      warning: "text-amber-500",
      error: "text-red-500",
      info: "text-blue-500",
    };

    const icons = {
      default: Info,
      success: CheckCircle,
      warning: AlertCircle,
      error: XCircle,
      info: Info,
    };

    const Icon = icons[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative flex gap-3 rounded-xl border p-4",
          variants[variant],
          className
        )}
        {...props}
      >
        <Icon className={cn("h-5 w-5 shrink-0", iconColors[variant])} />
        <div className="flex-1">
          {title && <h5 className="mb-1 font-semibold">{title}</h5>}
          <div className="text-sm opacity-90">{children}</div>
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="absolute right-2 top-2 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = "Alert";

export { Alert };
