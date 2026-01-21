"use client";

import React, { createContext, useContext, useMemo } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import type { TenantConfig } from "./types";

// =============================================================================
// Context
// =============================================================================

interface TenantContextValue {
  tenant: TenantConfig;
  isFeatureEnabled: (feature: string) => boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);

// =============================================================================
// Hook
// =============================================================================

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return ctx;
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
          primary: {
            main: tenant.branding.primaryColor,
          },
          secondary: {
            main: tenant.branding.secondaryColor || "#8b5cf6",
          },
        },
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
        },
      }),
    [tenant.branding]
  );

  const value = useMemo<TenantContextValue>(
    () => ({
      tenant,
      isFeatureEnabled: (feature: string) => tenant.features[feature] === true,
    }),
    [tenant]
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
// Default Tenants
// =============================================================================

export const DEFAULT_TENANT: TenantConfig = {
  id: "default",
  name: "Selfcare",
  branding: {
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
  },
  features: {
    onboarding: true,
    dashboard: true,
    payments: true,
  },
};

export const TENANTS: Record<string, TenantConfig> = {
  default: DEFAULT_TENANT,
  telcomax: {
    id: "telcomax",
    name: "TelcoMax",
    branding: {
      primaryColor: "#6366f1",
      secondaryColor: "#818cf8",
      logo: "/tenants/telcomax/logo.svg",
    },
    features: {
      onboarding: true,
      dashboard: true,
      payments: true,
      familyPlan: true,
      internationalRoaming: true,
    },
  },
  mobileplus: {
    id: "mobileplus",
    name: "Mobile Plus",
    branding: {
      primaryColor: "#059669",
      secondaryColor: "#10b981",
      logo: "/tenants/mobileplus/logo.svg",
    },
    features: {
      onboarding: true,
      dashboard: true,
      payments: true,
      eSim: true,
    },
  },
};

export function getTenant(tenantId: string): TenantConfig {
  return TENANTS[tenantId] || DEFAULT_TENANT;
}
