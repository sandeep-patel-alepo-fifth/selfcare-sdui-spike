"use client";

import { createContext, useContext, useCallback, useMemo } from "react";
import type { ActionResult, ActionHandler, TenantConfig, ScreenConfig } from "./types";

// =============================================================================
// Context
// =============================================================================

interface ActionsContextValue {
  execute: (action: string, data?: Record<string, unknown>) => Promise<ActionResult>;
}

const ActionsContext = createContext<ActionsContextValue | null>(null);

export function useActions() {
  const ctx = useContext(ActionsContext);
  if (!ctx) {
    throw new Error("useActions must be used within ActionExecutor");
  }
  return ctx;
}

// =============================================================================
// Built-in Actions
// =============================================================================

const builtinActions: Record<string, ActionHandler> = {
  // Navigation
  nextStep: async () => ({ success: true, nextStep: true }),
  prevStep: async () => ({ success: true, prevStep: true }),

  navigate: async (ctx) => ({
    success: true,
    navigate: ctx.data.route as string,
  }),

  // Auth
  sendOtp: async (ctx) => {
    const phone = ctx.data.phone as string;
    if (!phone || phone.length < 10) {
      return {
        success: false,
        errors: { phone: "Please enter a valid phone number" },
      };
    }

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (!res.ok) {
        return {
          success: false,
          toast: { type: "error", message: "Failed to send verification code" },
        };
      }

      return {
        success: true,
        nextStep: true,
        toast: { type: "success", message: "Verification code sent! Use 123456 for demo." },
      };
    } catch {
      return {
        success: false,
        toast: { type: "error", message: "Network error. Please try again." },
      };
    }
  },

  verifyOtp: async (ctx) => {
    const { phone, otp } = ctx.data as { phone: string; otp: string };
    if (!otp || otp.length !== 6) {
      return {
        success: false,
        errors: { otp: "Please enter the 6-digit code" },
      };
    }

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      if (!res.ok) {
        return {
          success: false,
          errors: { otp: "Invalid verification code" },
        };
      }

      return {
        success: true,
        nextStep: true,
        toast: { type: "success", message: "Phone verified!" },
      };
    } catch {
      return {
        success: false,
        toast: { type: "error", message: "Network error" },
      };
    }
  },

  register: async (ctx) => {
    const { phone, firstName, lastName, email, plan, planType } = ctx.data;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, firstName, lastName, email, plan, planType }),
      });

      if (!res.ok) {
        const data = await res.json();
        return {
          success: false,
          toast: { type: "error", message: data.error || "Registration failed" },
        };
      }

      return {
        success: true,
        navigate: "/dashboard",
        toast: { type: "success", message: "Welcome! Account created successfully." },
      };
    } catch {
      return {
        success: false,
        toast: { type: "error", message: "Network error" },
      };
    }
  },
};

// =============================================================================
// Provider
// =============================================================================

interface ActionExecutorProps {
  tenant: TenantConfig;
  screen: ScreenConfig;
  state: Record<string, unknown>;
  children: React.ReactNode;
  customActions?: Record<string, ActionHandler>;
  onNavigate?: (route: string) => void;
  onNextStep?: () => void;
  onPrevStep?: () => void;
  onToast?: (toast: { type: string; message: string }) => void;
}

export function ActionExecutor({
  tenant,
  screen,
  state,
  children,
  customActions = {},
  onNavigate,
  onNextStep,
  onPrevStep,
  onToast,
}: ActionExecutorProps) {
  const execute = useCallback(
    async (action: string, data: Record<string, unknown> = {}) => {
      // Look up action handler
      const handler = customActions[action] || builtinActions[action];

      if (!handler) {
        console.error(`Unknown action: ${action}`);
        return { success: false, toast: { type: "error" as const, message: "Unknown action" } };
      }

      // Execute
      const result = await handler({
        tenant,
        screen,
        data,
        state,
      });

      // Handle side effects
      if (result.navigate && onNavigate) {
        onNavigate(result.navigate);
      }
      if (result.nextStep && onNextStep) {
        onNextStep();
      }
      if (result.prevStep && onPrevStep) {
        onPrevStep();
      }
      if (result.toast && onToast) {
        onToast(result.toast);
      }

      return result;
    },
    [tenant, screen, state, customActions, onNavigate, onNextStep, onPrevStep, onToast]
  );

  const value = useMemo(() => ({ execute }), [execute]);

  return <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>;
}
