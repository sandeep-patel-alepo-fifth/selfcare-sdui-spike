# Alepo Enterprise Selfcare Boilerplate - Design Document

**Version:** 1.0
**Date:** 2026-01-22
**Status:** Approved for Implementation

---

## Executive Summary

This document outlines the architecture for transforming the current spike into a production-ready boilerplate for Alepo's Enterprise Multitenant Selfcare platform (SelfcareNOW).

**Key Decisions:**
- Replace complex custom SDUI with simplified approach using JSON Forms + MUI
- Full-featured implementation covering all requirement modules
- Multi-tenant architecture with complete tenant isolation
- OAuth 2.0 + JWT authentication with MFA support

---

## 1. Architecture Overview

### 1.1 Philosophy

> "Use libraries, don't build frameworks"

The boilerplate leverages proven open-source libraries instead of custom implementations:

| Concern | Library | Rationale |
|---------|---------|-----------|
| Forms | JSON Forms | Enterprise-grade, schema-driven |
| UI | MUI (Material UI) | Comprehensive, accessible, themeable |
| Validation | Zod | Type-safe, composable schemas |
| State | React Context + Zustand | Simple, debuggable |
| Routing | Next.js App Router | Server components, file-based |
| API | OpenAPI + fetch | Standard, typed |

### 1.2 Directory Structure

```
alepo-selfcare-boilerplate/
├── src/
│   ├── app/                          # Next.js 14 App Router
│   │   ├── (auth)/                   # Public auth routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── verify-otp/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   │
│   │   ├── (portal)/                 # Protected customer portal
│   │   │   ├── dashboard/
│   │   │   ├── billing/
│   │   │   │   ├── bills/
│   │   │   │   ├── payments/
│   │   │   │   ├── autopay/
│   │   │   │   └── express-pay/
│   │   │   ├── usage/
│   │   │   │   ├── history/
│   │   │   │   ├── data-passes/
│   │   │   │   └── services/
│   │   │   ├── plans/
│   │   │   │   ├── browse/
│   │   │   │   ├── switch/
│   │   │   │   └── addons/
│   │   │   ├── profile/
│   │   │   │   ├── settings/
│   │   │   │   └── security/
│   │   │   ├── family/
│   │   │   │   ├── hierarchy/
│   │   │   │   └── manage/
│   │   │   └── support/
│   │   │       ├── help/
│   │   │       ├── tickets/
│   │   │       └── chat/
│   │   │
│   │   ├── admin/                    # Admin portal
│   │   │   ├── tenants/
│   │   │   ├── plans/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   │
│   │   └── api/                      # API routes
│   │       ├── auth/
│   │       ├── billing/
│   │       ├── usage/
│   │       ├── plans/
│   │       └── admin/
│   │
│   ├── lib/
│   │   ├── core/                     # Core infrastructure
│   │   │   ├── tenant-context.tsx
│   │   │   ├── auth-context.tsx
│   │   │   ├── feature-flags.tsx
│   │   │   └── api-client.ts
│   │   │
│   │   ├── sdui/                     # Simplified SDUI
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── screen-loader.tsx
│   │   │   └── actions.tsx
│   │   │
│   │   └── utils/
│   │       ├── format.ts             # Date, currency formatters
│   │       ├── validation.ts         # Zod schemas
│   │       └── hooks.ts              # Common hooks
│   │
│   ├── components/
│   │   ├── ui/                       # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                   # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── footer.tsx
│   │   │   └── page-container.tsx
│   │   │
│   │   └── selfcare/                 # Feature components
│   │       ├── dashboard/
│   │       │   ├── balance-widget.tsx
│   │       │   ├── services-summary.tsx
│   │       │   ├── usage-chart.tsx
│   │       │   └── activity-feed.tsx
│   │       ├── billing/
│   │       │   ├── invoice-list.tsx
│   │       │   ├── payment-form.tsx
│   │       │   └── autopay-toggle.tsx
│   │       ├── usage/
│   │       │   ├── usage-table.tsx
│   │       │   ├── cdr-viewer.tsx
│   │       │   └── service-card.tsx
│   │       ├── plans/
│   │       │   ├── plan-card.tsx
│   │       │   ├── plan-comparison.tsx
│   │       │   └── addon-list.tsx
│   │       ├── profile/
│   │       │   ├── profile-form.tsx
│   │       │   └── security-settings.tsx
│   │       ├── family/
│   │       │   ├── family-tree.tsx
│   │       │   └── child-account-card.tsx
│   │       └── support/
│   │           ├── faq-accordion.tsx
│   │           ├── ticket-form.tsx
│   │           └── chatbot.tsx
│   │
│   ├── screens/                      # Screen JSON configs
│   │   ├── auth/
│   │   │   ├── login.json
│   │   │   ├── register.json
│   │   │   └── verify-otp.json
│   │   ├── dashboard/
│   │   │   └── overview.json
│   │   ├── billing/
│   │   │   ├── bills.json
│   │   │   ├── payment.json
│   │   │   └── autopay.json
│   │   └── ...
│   │
│   ├── types/                        # TypeScript types
│   │   ├── api.ts
│   │   ├── tenant.ts
│   │   ├── user.ts
│   │   └── sdui.ts
│   │
│   └── styles/
│       ├── globals.css
│       └── theme.ts                  # MUI theme config
│
├── prisma/
│   └── schema.prisma                 # Database schema
│
├── public/
│   └── assets/
│
└── config/
    ├── tenants/                      # Tenant config files
    │   ├── default.json
    │   └── demo.json
    └── features.json                 # Feature flag defaults
```

---

## 2. Multi-Tenancy Architecture

### 2.1 Tenant Configuration

```typescript
// types/tenant.ts
export interface TenantConfig {
  id: string;
  name: string;
  domain?: string;
  status: 'active' | 'suspended' | 'pending';

  // Branding (REQ-BRAND-001 to REQ-BRAND-003)
  branding: {
    logo: string;
    logoLight?: string;          // For dark theme
    favicon?: string;
    primaryColor: string;        // e.g., "#6366f1"
    secondaryColor?: string;
    theme: 'light' | 'dark' | 'auto';
  };

  // Localization (REQ-LOC-001 to REQ-LOC-003)
  localization: {
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    timeFormat: '12h' | '24h';
    timezone: string;            // e.g., 'America/New_York'
    currency: string;            // e.g., 'USD'
    locale: string;              // e.g., 'en-US'
    rtl: boolean;
    translations?: Record<string, string>;
  };

  // Feature flags (tenant-specific)
  features: {
    familyAccounts: boolean;
    autopay: boolean;
    expressPay: boolean;
    chatbot: boolean;
    creditTransfer: boolean;
    referralProgram: boolean;
    voucherRedemption: boolean;
    dataPassPurchase: boolean;
    planSwitching: boolean;
    supportTickets: boolean;
  };

  // Integration endpoints
  integrations: {
    crm: {
      baseUrl: string;
      clientId: string;
      // clientSecret stored in secrets manager
    };
    billing: {
      baseUrl: string;
    };
    payment: {
      stripe?: {
        publishableKey: string;
        // secretKey stored in secrets manager
      };
      cashApp?: {
        enabled: boolean;
        merchantId?: string;
      };
      mobileMoney?: {
        provider: string;
        enabled: boolean;
      };
    };
    analytics?: {
      provider: 'google' | 'mixpanel' | 'custom';
      trackingId?: string;
    };
  };

  // Contact & support
  contact: {
    supportEmail: string;
    supportPhone?: string;
    businessHours?: string;
    address?: string;
  };
}
```

### 2.2 Tenant Resolution

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const tenantId = resolveTenant(request);

  if (!tenantId) {
    return NextResponse.redirect('/not-found');
  }

  // Inject tenant ID into request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', tenantId);

  return NextResponse.next({
    request: { headers: requestHeaders }
  });
}

function resolveTenant(request: NextRequest): string | null {
  // 1. Check subdomain: tenant1.selfcare.com
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];
  if (subdomain && subdomain !== 'www' && subdomain !== 'selfcare') {
    return subdomain;
  }

  // 2. Check custom domain mapping (from DB/config)
  const customDomain = lookupCustomDomain(hostname);
  if (customDomain) {
    return customDomain;
  }

  // 3. Check header (for API calls)
  const headerTenant = request.headers.get('x-tenant-id');
  if (headerTenant) {
    return headerTenant;
  }

  // 4. Default tenant for development
  if (process.env.NODE_ENV === 'development') {
    return 'demo';
  }

  return null;
}
```

### 2.3 Tenant Context Provider

```typescript
// lib/core/tenant-context.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { TenantConfig } from '@/types/tenant';

const TenantContext = createContext<TenantConfig | null>(null);

export function TenantProvider({
  tenant,
  children
}: {
  tenant: TenantConfig;
  children: ReactNode
}) {
  // Create MUI theme from tenant branding
  const theme = createTheme({
    palette: {
      mode: tenant.branding.theme === 'auto'
        ? 'light'  // Could detect system preference
        : tenant.branding.theme,
      primary: {
        main: tenant.branding.primaryColor,
      },
      secondary: {
        main: tenant.branding.secondaryColor || tenant.branding.primaryColor,
      },
    },
    direction: tenant.localization.rtl ? 'rtl' : 'ltr',
  });

  return (
    <TenantContext.Provider value={tenant}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantConfig {
  const tenant = useContext(TenantContext);
  if (!tenant) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return tenant;
}

// Feature flag hook
export function useFeature(feature: keyof TenantConfig['features']): boolean {
  const tenant = useTenant();
  return tenant.features[feature] ?? false;
}
```

---

## 3. Authentication & Security

### 3.1 Auth Configuration

```typescript
// types/auth.ts
export interface AuthConfig {
  // OAuth 2.0 (REQ-AUTH-001)
  oauth: {
    provider: 'alepo-crm';
    authorizationEndpoint: string;
    tokenEndpoint: string;
    userInfoEndpoint: string;
    clientId: string;
    scopes: string[];
  };

  // MFA options (REQ-AUTH-002)
  mfa: {
    required: boolean;
    methods: {
      sms: boolean;
      email: boolean;
      totp: boolean;
    };
    defaultMethod: 'sms' | 'email' | 'totp';
  };

  // Password policy (REQ-AUTH-003)
  passwordPolicy: {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumber: boolean;
    requireSpecial: boolean;
    historyCount: number;
    maxAttempts: number;
    lockoutDuration: number;  // minutes
  };

  // Session (REQ-SEC-002)
  session: {
    accessTokenTTL: number;    // minutes
    refreshTokenTTL: number;   // days
    maxConcurrentSessions: number;
    idleTimeout: number;       // minutes
  };
}

export interface User {
  id: string;
  tenantId: string;
  phone: string;
  email?: string;
  firstName: string;
  lastName: string;
  accountType: 'prepaid' | 'postpaid';
  roles: string[];
  mfaEnabled: boolean;
  preferences: {
    language: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}
```

### 3.2 Auth Context

```typescript
// lib/core/auth-context.tsx
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User, AuthState } from '@/types/auth';
import { useTenant } from './tenant-context';

interface AuthContextValue extends AuthState {
  login: (phone: string, password: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const tenant = useTenant();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    accessToken: null,
    refreshToken: null,
  });

  const login = useCallback(async (phone: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenant.id,
      },
      body: JSON.stringify({ phone, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();

    if (data.requiresMfa) {
      // Store pending auth state, redirect to OTP
      sessionStorage.setItem('pendingAuth', JSON.stringify(data));
      router.push('/verify-otp');
    } else {
      setState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      router.push('/dashboard');
    }
  }, [tenant.id, router]);

  const verifyOtp = useCallback(async (otp: string) => {
    const pending = sessionStorage.getItem('pendingAuth');
    if (!pending) throw new Error('No pending auth');

    const { sessionId } = JSON.parse(pending);

    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenant.id,
      },
      body: JSON.stringify({ sessionId, otp }),
    });

    if (!response.ok) {
      throw new Error('Invalid OTP');
    }

    const data = await response.json();
    sessionStorage.removeItem('pendingAuth');

    setState({
      user: data.user,
      isAuthenticated: true,
      isLoading: false,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    router.push('/dashboard');
  }, [tenant.id, router]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'X-Tenant-ID': tenant.id },
    });

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      refreshToken: null,
    });

    router.push('/login');
  }, [tenant.id, router]);

  const refreshSession = useCallback(async () => {
    // Implement token refresh logic
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, verifyOtp, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return auth;
}
```

---

## 4. Simplified SDUI

### 4.1 Core Types

```typescript
// lib/sdui/types.ts
import { z } from 'zod';
import type { JsonSchema, UISchemaElement } from '@jsonforms/core';

export const TenantConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  branding: z.object({
    primaryColor: z.string(),
    logo: z.string().optional(),
  }),
  features: z.record(z.boolean()),
});

export type TenantConfig = z.infer<typeof TenantConfigSchema>;

export type ScreenType = 'form' | 'layout' | 'dashboard';

export interface ScreenConfig {
  id: string;
  type: ScreenType;
  title: string;
  description?: string;

  // For form screens
  form?: {
    schema: JsonSchema;
    uiSchema?: UISchemaElement;
    initialData?: Record<string, unknown>;
  };

  // For layout screens
  layout?: {
    components: ComponentConfig[];
  };

  // Actions
  actions?: Record<string, ActionConfig>;

  // Conditions for showing/hiding
  conditions?: Condition[];
}

export interface ComponentConfig {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  children?: ComponentConfig[];
  conditions?: Condition[];
}

export interface ActionConfig {
  type: 'api' | 'navigate' | 'setState' | 'nextStep' | 'prevStep' | 'openModal';
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  route?: string;
  payload?: Record<string, unknown>;
  onSuccess?: ActionConfig;
  onError?: ActionConfig;
}

export interface Condition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'exists';
  value?: unknown;
}

export interface ActionResult {
  success: boolean;
  data?: Record<string, unknown>;
  errors?: Record<string, string>;
  navigate?: string;
  toast?: { type: 'success' | 'error' | 'info'; message: string };
}
```

### 4.2 Screen Loader

```typescript
// lib/sdui/screen-loader.tsx
'use client';

import { useState, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { JsonForms } from '@jsonforms/react';
import { materialRenderers, materialCells } from '@jsonforms/material-renderers';
import { useTenant } from '@/lib/core/tenant-context';
import { executeAction } from './actions';
import type { ScreenConfig, ActionResult } from './types';

interface ScreenLoaderProps {
  screen: ScreenConfig;
  initialData?: Record<string, unknown>;
  onActionComplete?: (result: ActionResult) => void;
}

export function ScreenLoader({
  screen,
  initialData = {},
  onActionComplete
}: ScreenLoaderProps) {
  const tenant = useTenant();
  const [data, setData] = useState<Record<string, unknown>>(initialData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAction = useCallback(async (actionName: string) => {
    const actionConfig = screen.actions?.[actionName];
    if (!actionConfig) return;

    setLoading(true);
    setErrors({});

    try {
      const result = await executeAction(actionConfig, {
        tenant,
        screen,
        data,
      });

      if (result.errors) {
        setErrors(result.errors);
      }

      onActionComplete?.(result);
    } catch (error) {
      setErrors({ _form: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [screen, tenant, data, onActionComplete]);

  if (screen.type === 'form' && screen.form) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          {screen.title}
        </Typography>
        {screen.description && (
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {screen.description}
          </Typography>
        )}

        <JsonForms
          schema={screen.form.schema}
          uischema={screen.form.uiSchema}
          data={data}
          renderers={materialRenderers}
          cells={materialCells}
          onChange={({ data: newData }) => setData(newData as Record<string, unknown>)}
        />

        {Object.entries(errors).map(([field, message]) => (
          <Alert key={field} severity="error" sx={{ mt: 2 }}>
            {message}
          </Alert>
        ))}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>
    );
  }

  // Handle other screen types...
  return null;
}
```

---

## 5. Feature Modules

### 5.1 Dashboard (REQ-DASH-001 to REQ-DASH-003)

```typescript
// screens/dashboard/overview.json
{
  "id": "dashboard-overview",
  "type": "dashboard",
  "title": "Dashboard",
  "layout": {
    "components": [
      {
        "id": "balance-widget",
        "type": "BalanceWidget",
        "props": {
          "dataSource": "api:/billing/balance"
        }
      },
      {
        "id": "services-summary",
        "type": "ServicesSummary",
        "props": {
          "dataSource": "api:/services/active"
        }
      },
      {
        "id": "usage-chart",
        "type": "UsageChart",
        "props": {
          "period": "30d",
          "dataSource": "api:/usage/summary"
        }
      },
      {
        "id": "activity-feed",
        "type": "ActivityFeed",
        "props": {
          "limit": 10,
          "dataSource": "api:/activity/recent"
        }
      },
      {
        "id": "quick-actions",
        "type": "QuickActions",
        "props": {
          "actions": ["pay-bill", "buy-data", "view-usage"]
        }
      }
    ]
  }
}
```

### 5.2 Billing (REQ-BILL-001 to REQ-BILL-005)

```typescript
// screens/billing/payment.json
{
  "id": "make-payment",
  "type": "form",
  "title": "Make a Payment",
  "description": "Pay your current balance",
  "form": {
    "schema": {
      "type": "object",
      "required": ["amount", "paymentMethod"],
      "properties": {
        "amount": {
          "type": "number",
          "title": "Payment Amount",
          "minimum": 1
        },
        "paymentMethod": {
          "type": "string",
          "title": "Payment Method",
          "oneOf": [
            { "const": "card", "title": "Credit/Debit Card" },
            { "const": "cashapp", "title": "Cash App Pay" },
            { "const": "bank", "title": "Bank Transfer" }
          ]
        },
        "cardNumber": {
          "type": "string",
          "title": "Card Number"
        },
        "expiryDate": {
          "type": "string",
          "title": "Expiry Date"
        },
        "cvv": {
          "type": "string",
          "title": "CVV"
        }
      }
    },
    "uiSchema": {
      "type": "VerticalLayout",
      "elements": [
        { "type": "Control", "scope": "#/properties/amount" },
        {
          "type": "Control",
          "scope": "#/properties/paymentMethod",
          "options": { "format": "radio" }
        },
        {
          "type": "Group",
          "label": "Card Details",
          "elements": [
            { "type": "Control", "scope": "#/properties/cardNumber" },
            {
              "type": "HorizontalLayout",
              "elements": [
                { "type": "Control", "scope": "#/properties/expiryDate" },
                { "type": "Control", "scope": "#/properties/cvv" }
              ]
            }
          ],
          "rule": {
            "effect": "SHOW",
            "condition": {
              "scope": "#/properties/paymentMethod",
              "schema": { "const": "card" }
            }
          }
        }
      ]
    }
  },
  "actions": {
    "submit": {
      "type": "api",
      "endpoint": "/api/billing/pay",
      "method": "POST",
      "onSuccess": {
        "type": "navigate",
        "route": "/billing/confirmation"
      }
    }
  }
}
```

### 5.3 Usage (REQ-USAGE-001 to REQ-USAGE-003)

Components:
- `UsageTable` - Paginated usage history with filters
- `CDRViewer` - Call detail records viewer
- `ServiceCard` - Active/expired service display
- `DataPassCard` - Data pass with progress bar

### 5.4 Plans (REQ-PLAN-001 to REQ-PLAN-004)

Components:
- `PlanCard` - Plan display with features
- `PlanComparison` - Side-by-side comparison
- `AddonList` - Available add-ons
- `PlanSwitchModal` - Plan switching flow

### 5.5 Family (REQ-FAM-001 to REQ-FAM-002)

Components:
- `FamilyTree` - Visual hierarchy
- `ChildAccountCard` - Child account summary
- `AddChildForm` - Link child account form

### 5.6 Support (REQ-SUPP-001 to REQ-SUPP-003)

Components:
- `FAQAccordion` - Expandable FAQ
- `TicketForm` - Support ticket creation
- `TicketList` - Ticket history
- `Chatbot` - AI-powered chatbot

---

## 6. API Layer

### 6.1 API Client

```typescript
// lib/core/api-client.ts
import { useTenant } from './tenant-context';
import { useAuth } from './auth-context';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private tenantId: string;
  private accessToken: string | null;

  constructor(baseUrl: string, tenantId: string, accessToken: string | null) {
    this.baseUrl = baseUrl;
    this.tenantId = tenantId;
    this.accessToken = accessToken;
  }

  async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;

    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      url += '?' + new URLSearchParams(params).toString();
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': this.tenantId,
        ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }

    return response.json();
  }

  get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'GET', params });
  }

  post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'DELETE' });
  }
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// React hook
export function useApi(): ApiClient {
  const tenant = useTenant();
  const { accessToken } = useAuth();

  return new ApiClient(
    process.env.NEXT_PUBLIC_API_URL || '/api',
    tenant.id,
    accessToken
  );
}
```

### 6.2 API Endpoints

```typescript
// API endpoint definitions
const ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_VERIFY_OTP: '/auth/verify-otp',
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/auth/reset-password',

  // Billing
  BILLING_BALANCE: '/billing/balance',
  BILLING_INVOICES: '/billing/invoices',
  BILLING_PAY: '/billing/pay',
  BILLING_AUTOPAY: '/billing/autopay',
  BILLING_PAYMENT_METHODS: '/billing/payment-methods',

  // Usage
  USAGE_SUMMARY: '/usage/summary',
  USAGE_HISTORY: '/usage/history',
  USAGE_CDR: '/usage/cdr',

  // Services
  SERVICES_ACTIVE: '/services/active',
  SERVICES_HISTORY: '/services/history',
  SERVICES_DATA_PASSES: '/services/data-passes',

  // Plans
  PLANS_LIST: '/plans',
  PLANS_DETAILS: '/plans/:id',
  PLANS_SWITCH: '/plans/switch',
  PLANS_ADDONS: '/plans/addons',

  // Family
  FAMILY_HIERARCHY: '/family/hierarchy',
  FAMILY_ADD_CHILD: '/family/add-child',
  FAMILY_REMOVE_CHILD: '/family/remove-child',

  // Support
  SUPPORT_TICKETS: '/support/tickets',
  SUPPORT_FAQ: '/support/faq',
  SUPPORT_CHAT: '/support/chat',

  // Profile
  PROFILE_GET: '/profile',
  PROFILE_UPDATE: '/profile',
  PROFILE_SECURITY: '/profile/security',
  PROFILE_PREFERENCES: '/profile/preferences',
};
```

---

## 7. Cleanup Tasks

### 7.1 Files to Delete (Complex SDUI)

```
src/lib/sdui/
├── index.ts                 # DELETE
├── component-registry.tsx   # DELETE
├── condition-evaluator.ts   # DELETE
├── data-binding.ts          # DELETE
├── action-dispatcher.ts     # DELETE
├── renderer.tsx             # DELETE
├── store.ts                 # DELETE
└── schemas/                 # DELETE (move to screens/)

src/components/sdui/
├── flow-page.tsx            # DELETE
└── screen-page.tsx          # DELETE

src/app/onboarding/          # DELETE (replaced by simple/)
```

### 7.2 Files to Rename/Move

```
# Rename
src/lib/sdui-simple/ → src/lib/sdui/
src/app/simple/onboarding/ → src/app/(auth)/onboarding/

# Move
src/lib/sdui/schemas/onboarding.ts → src/screens/auth/onboarding.ts
src/lib/sdui/schemas/dashboard.ts → src/screens/dashboard/overview.ts
```

### 7.3 Dependencies to Remove

```json
// package.json - remove these if no longer needed
{
  "dependencies": {
    // Keep: @jsonforms/*, @mui/*, zod
    // Review: zustand (may still be useful)
  }
}
```

---

## 8. Implementation Priority

### Phase 1: Foundation (Week 1)
1. Delete complex SDUI code
2. Restructure directories
3. Set up multi-tenancy infrastructure
4. Implement auth flow (login, OTP, register)

### Phase 2: Core Features (Week 2)
5. Dashboard with widgets
6. Profile management
7. Billing - view bills, make payments

### Phase 3: Extended Features (Week 3)
8. Usage history and services
9. Plan browsing and switching
10. Autopay enrollment

### Phase 4: Advanced Features (Week 4)
11. Family hierarchy management
12. Support tickets and FAQ
13. Chatbot integration
14. Voucher and credit transfer

### Phase 5: Admin Portal (Week 5)
15. Tenant management
16. Plan bundle management
17. Reports and analytics
18. System configuration

---

## 9. Success Criteria

- [ ] All complex SDUI code removed
- [ ] Simplified SDUI using JSON Forms works for all forms
- [ ] Multi-tenancy with complete isolation
- [ ] All 7 feature modules implemented
- [ ] Responsive design (mobile-first)
- [ ] TypeScript strict mode passing
- [ ] Unit test coverage > 80%
- [ ] No cross-tenant data leakage

---

## Appendix: Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Form rendering | JSON Forms | Enterprise-grade, schema-driven, extensible |
| UI library | MUI | Comprehensive, accessible, themeable |
| Validation | Zod | Type-safe, composable, good DX |
| State management | React Context | Simple, debuggable, sufficient for our needs |
| Routing | Next.js App Router | Server components, layouts, middleware |
| Styling | MUI + Tailwind | MUI for components, Tailwind for utilities |
| API | OpenAPI | Standard, generates types |

---

*Document prepared for Alepo Enterprise Selfcare Boilerplate project.*
