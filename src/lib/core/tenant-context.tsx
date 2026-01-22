"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  TenantConfig,
  FeatureKey,
  isFeatureEnabled,
  getTenantById,
  DEFAULT_TENANT,
} from "@/types/tenant";

// =============================================================================
// Context Types
// =============================================================================

interface TenantContextValue {
  tenant: TenantConfig;
  isFeatureEnabled: (feature: FeatureKey) => boolean;
  formatDate: (date: Date | string) => string;
  formatCurrency: (amount: number) => string;
  formatTime: (date: Date | string) => string;
}

const TenantContext = createContext<TenantContextValue | null>(null);

// =============================================================================
// Hooks
// =============================================================================

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return ctx;
}

export function useFeature(feature: FeatureKey): boolean {
  const { tenant } = useTenant();
  return isFeatureEnabled(tenant, feature);
}

// =============================================================================
// Provider
// =============================================================================

interface TenantProviderProps {
  tenant: TenantConfig;
  children: React.ReactNode;
}

export function TenantProvider({ tenant, children }: TenantProviderProps) {
  // Create MUI theme from tenant branding
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: tenant.branding.theme === "auto" ? "light" : tenant.branding.theme,
          primary: {
            main: tenant.branding.primaryColor,
          },
          secondary: {
            main: tenant.branding.secondaryColor || "#8b5cf6",
          },
        },
        direction: tenant.localization.rtl ? "rtl" : "ltr",
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 500,
              },
            },
          },
          MuiTextField: {
            defaultProps: {
              variant: "outlined",
              size: "small",
            },
          },
          MuiCard: {
            defaultProps: {
              elevation: 0,
            },
            styleOverrides: {
              root: {
                border: "1px solid",
                borderColor: "rgba(0, 0, 0, 0.12)",
              },
            },
          },
        },
      }),
    [tenant.branding, tenant.localization.rtl]
  );

  // Date formatting based on tenant locale
  const formatDate = useCallback(
    (date: Date | string): string => {
      const d = typeof date === "string" ? new Date(date) : date;
      const { dateFormat, locale, timezone } = tenant.localization;

      try {
        return new Intl.DateTimeFormat(locale, {
          timeZone: timezone,
          year: "numeric",
          month: dateFormat.includes("MM") ? "2-digit" : "short",
          day: "2-digit",
        }).format(d);
      } catch {
        return d.toLocaleDateString();
      }
    },
    [tenant.localization]
  );

  // Currency formatting based on tenant locale
  const formatCurrency = useCallback(
    (amount: number): string => {
      const { currency, locale } = tenant.localization;

      try {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
        }).format(amount);
      } catch {
        return `${currency} ${amount.toFixed(2)}`;
      }
    },
    [tenant.localization]
  );

  // Time formatting based on tenant locale
  const formatTime = useCallback(
    (date: Date | string): string => {
      const d = typeof date === "string" ? new Date(date) : date;
      const { timeFormat, locale, timezone } = tenant.localization;

      try {
        return new Intl.DateTimeFormat(locale, {
          timeZone: timezone,
          hour: "2-digit",
          minute: "2-digit",
          hour12: timeFormat === "12h",
        }).format(d);
      } catch {
        return d.toLocaleTimeString();
      }
    },
    [tenant.localization]
  );

  const value = useMemo<TenantContextValue>(
    () => ({
      tenant,
      isFeatureEnabled: (feature: FeatureKey) => isFeatureEnabled(tenant, feature),
      formatDate,
      formatCurrency,
      formatTime,
    }),
    [tenant, formatDate, formatCurrency, formatTime]
  );

  return (
    <TenantContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </TenantContext.Provider>
  );
}

// =============================================================================
// Re-export utilities
// =============================================================================

export { getTenantById, DEFAULT_TENANT };
export type { TenantConfig, FeatureKey };
