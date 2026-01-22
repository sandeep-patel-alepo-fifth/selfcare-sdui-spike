# Architecture Overview

This document provides a mental model for understanding the Alepo Enterprise Selfcare Boilerplate - a multi-tenant customer self-service platform built with Next.js, React, and a simplified Server-Driven UI approach.

## Table of Contents

1. [Philosophy](#philosophy)
2. [The Big Picture](#the-big-picture)
3. [Core Concepts](#core-concepts)
4. [Data Flow](#data-flow)
5. [Technology Stack](#technology-stack)
6. [Project Structure](#project-structure)
7. [Key Design Decisions](#key-design-decisions)

---

## Philosophy

> "Use libraries, don't build frameworks"

This boilerplate prioritizes:

1. **Simplicity over flexibility** - Use proven libraries instead of custom implementations
2. **Server computes, Client renders** - Keep logic on the server, client stays simple
3. **Convention over configuration** - Sensible defaults, override when needed
4. **Tenant = Configuration** - Different tenants through config, not code changes

---

## The Big Picture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TENANT LAYER                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │  Tenant A   │  │  Tenant B   │  │  Tenant C   │                  │
│  │  - branding │  │  - branding │  │  - branding │                  │
│  │  - features │  │  - features │  │  - features │                  │
│  │  - locale   │  │  - locale   │  │  - locale   │                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE                                      │
│  - Resolve tenant from subdomain/domain/header                      │
│  - Inject tenant context into request                               │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      NEXT.JS APP                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │   (auth)        │  │   (portal)      │  │    admin        │     │
│  │   - login       │  │   - dashboard   │  │   - tenants     │     │
│  │   - register    │  │   - billing     │  │   - plans       │     │
│  │   - verify-otp  │  │   - usage       │  │   - reports     │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      PROVIDERS                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │   Tenant    │  │    Auth     │  │    MUI      │                  │
│  │   Context   │  │   Context   │  │   Theme     │                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      UI COMPONENTS                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │  JSON Forms │  │  MUI        │  │  Custom     │                  │
│  │  (forms)    │  │  (UI kit)   │  │  (selfcare) │                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

### The Flow in Words

1. **User visits a page** (e.g., `tenant-a.selfcare.com/dashboard`)
2. **Middleware resolves tenant** from subdomain/domain
3. **Tenant config is loaded** (branding, features, integrations)
4. **Page renders with tenant context** (themed UI, enabled features)
5. **Forms use JSON Forms** with JSON Schema for validation
6. **API calls include tenant ID** for data isolation

---

## Core Concepts

### 1. Multi-Tenancy

Every request is scoped to a tenant. Tenant resolution order:

1. Subdomain: `tenant-a.selfcare.com` → `tenant-a`
2. Custom domain: `www.telcomax.com` → lookup in config
3. Header: `X-Tenant-ID: tenant-a`
4. Default: `demo` (development only)

```typescript
// Tenant configuration
interface TenantConfig {
  id: string;
  name: string;
  branding: {
    logo: string;
    primaryColor: string;
    theme: 'light' | 'dark' | 'auto';
  };
  features: {
    autopay: boolean;
    familyAccounts: boolean;
    chatbot: boolean;
    // ...
  };
  localization: {
    dateFormat: string;
    timezone: string;
    currency: string;
  };
  integrations: {
    crm: { baseUrl: string; clientId: string };
    billing: { baseUrl: string };
    payment: { stripe?: {...}; cashApp?: {...} };
  };
}
```

### 2. Simplified SDUI

Instead of complex client-side expression evaluation, we use:

- **JSON Forms** for form rendering with JSON Schema
- **MUI** for UI components
- **Server-side resolution** for dynamic data
- **Named actions** instead of inline logic

```typescript
// Screen configuration
interface ScreenConfig {
  id: string;
  type: 'form' | 'layout' | 'dashboard';
  title: string;

  // For form screens - uses JSON Forms
  form?: {
    schema: JsonSchema;      // JSON Schema for validation
    uiSchema?: UISchema;     // Layout hints for JSON Forms
    initialData?: object;
  };

  // For layout screens - component composition
  layout?: {
    components: ComponentConfig[];
  };

  // Named actions
  actions?: Record<string, ActionConfig>;
}
```

### 3. Feature Flags

Features are toggled per tenant:

```typescript
// Check feature availability
const { features } = useTenant();

if (features.autopay) {
  // Show autopay option
}

// Or use the hook
const canUseAutopay = useFeature('autopay');
```

### 4. Authentication

OAuth 2.0 + JWT with MFA support:

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
}

// Auth flow
1. User submits phone + password
2. Server validates with CRM OAuth
3. If MFA required, redirect to OTP
4. On success, receive JWT tokens
5. Tokens stored in context, sent with requests
```

---

## Data Flow

### Form Submission Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     FORM SUBMISSION                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. USER INPUT                                                   │
│     ┌─────────────┐                                             │
│     │ JSON Forms  │ ──▶ Schema validation (client-side)         │
│     └─────────────┘                                             │
│                                                                  │
│  2. SUBMIT ACTION                                                │
│     ┌─────────────┐     ┌──────────────────┐                    │
│     │   onSubmit  │ ──▶ │ executeAction()  │                    │
│     └─────────────┘     └──────────────────┘                    │
│                                                                  │
│  3. API CALL                                                     │
│     ┌─────────────┐     ┌──────────────────┐                    │
│     │  API Client │ ──▶ │ POST /api/...    │                    │
│     │ + Tenant ID │     │ + Auth token     │                    │
│     └─────────────┘     └──────────────────┘                    │
│                                                                  │
│  4. RESPONSE                                                     │
│     ┌─────────────────────────────────────────────┐             │
│     │ { success, data, errors, navigate, toast }  │             │
│     └─────────────────────────────────────────────┘             │
│                                                                  │
│  5. UI UPDATE                                                    │
│     - Show errors on fields                                     │
│     - Navigate to next screen                                   │
│     - Show toast notification                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Context Sources

| Source | Description | Example |
|--------|-------------|---------|
| `tenant` | Tenant configuration | `tenant.branding.primaryColor` |
| `user` | Authenticated user | `user.firstName`, `user.accountType` |
| `form` | Form field values | `form.email`, `form.amount` |
| `api` | API response data | `api.balance`, `api.plans` |

---

## Technology Stack

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Next.js 14** | React framework | App router, server components, middleware |
| **React 18** | UI library | Hooks, concurrent features |
| **TypeScript** | Type safety | Catch errors early, better DX |
| **MUI** | Component library | Comprehensive, accessible, themeable |
| **JSON Forms** | Form rendering | Schema-driven, validation included |
| **Zod** | Validation | Type-safe runtime validation |
| **React Context** | State management | Simple, no extra dependencies |
| **Prisma** | Database ORM | Type-safe queries, migrations |
| **MongoDB** | Database | Flexible documents, tenant isolation |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Public auth routes (login, register, etc.)
│   ├── (portal)/                 # Protected portal routes
│   ├── admin/                    # Admin portal
│   └── api/                      # API routes
│
├── lib/
│   ├── core/                     # Core infrastructure
│   │   ├── tenant-context.tsx    # Tenant provider & hooks
│   │   ├── auth-context.tsx      # Auth provider & hooks
│   │   └── api-client.ts         # Typed API client
│   │
│   ├── sdui/                     # Simplified SDUI
│   │   ├── types.ts              # Screen, component, action types
│   │   ├── screen-loader.tsx     # Screen rendering
│   │   └── actions.ts            # Action execution
│   │
│   └── utils/                    # Utilities
│       ├── format.ts             # Date, currency formatters
│       └── validation.ts         # Zod schemas
│
├── components/
│   ├── ui/                       # Base UI components
│   ├── layout/                   # Layout components
│   └── selfcare/                 # Feature-specific components
│       ├── dashboard/            # Dashboard widgets
│       ├── billing/              # Billing components
│       ├── usage/                # Usage components
│       └── ...
│
├── screens/                      # Screen JSON configurations
│   ├── auth/
│   ├── dashboard/
│   └── billing/
│
├── types/                        # TypeScript types
│   ├── tenant.ts
│   ├── user.ts
│   └── api.ts
│
└── styles/
    └── theme.ts                  # MUI theme configuration

config/
└── tenants/                      # Tenant configuration files
    ├── default.json
    └── demo.json
```

---

## Key Design Decisions

### Why JSON Forms over Custom SDUI?

| Aspect | Custom SDUI | JSON Forms |
|--------|-------------|------------|
| Form validation | Build it yourself | Built-in with JSON Schema |
| Accessibility | Manual implementation | WCAG compliant out of box |
| Maintenance | High (custom code) | Low (library updates) |
| Learning curve | High (proprietary) | Medium (standard specs) |
| Flexibility | Maximum | High (custom renderers) |

JSON Forms gives us 80% of what we need with 20% of the effort.

### Why MUI over Custom Components?

- **Comprehensive**: 50+ production-ready components
- **Accessible**: WCAG 2.1 compliant
- **Themeable**: Easy tenant branding with `createTheme()`
- **Maintained**: Large community, regular updates

### Why React Context over Zustand/Redux?

For this application's needs (tenant config, auth state, simple UI state), React Context provides:

- No extra dependencies
- Simpler mental model
- Sufficient performance
- Built-in React DevTools support

### Why Server-Side Resolution?

Moving logic to the server:

- **Simpler client**: No expression evaluation, just render
- **More secure**: Business logic not exposed to client
- **Easier debugging**: Server logs vs browser console
- **Better caching**: Resolved screens can be cached

---

## Next Steps

1. **[Getting Started](./01-getting-started.md)** - Set up your development environment
2. **[SDUI Core](./02-sdui-core.md)** - Screen loading and JSON Forms
3. **[Actions System](./03-actions-system.md)** - How actions work
4. **[Components](./04-components.md)** - MUI and custom components
5. **[API Layer](./05-api-layer.md)** - Backend and integrations
6. **[State Management](./06-state-management.md)** - Context patterns
7. **[Extending](./07-extending.md)** - Adding features
8. **[Troubleshooting](./08-troubleshooting.md)** - Common issues

---

## Quick Reference

### File Locations

| What | Where |
|------|-------|
| Add a tenant config | `config/tenants/[tenant-id].json` |
| Add a screen | `src/screens/[module]/[screen].json` |
| Add a component | `src/components/selfcare/[module]/` |
| Add an API route | `src/app/api/[module]/route.ts` |
| Add types | `src/types/` |
| Modify tenant context | `src/lib/core/tenant-context.tsx` |
| Modify auth flow | `src/lib/core/auth-context.tsx` |

### Common Tasks

| Task | Steps |
|------|-------|
| Add new tenant | Create config in `config/tenants/`, set branding and features |
| Add new page | Create route in `src/app/`, create screen config if using SDUI |
| Add form | Define JSON Schema, create screen config, add API endpoint |
| Enable feature | Set `features.[name]: true` in tenant config |
| Customize theme | Update `branding` in tenant config, MUI theme auto-updates |
