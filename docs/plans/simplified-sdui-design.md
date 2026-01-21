# Simplified Enterprise SDUI Architecture

## Core Principles

1. **Server computes, Client renders** - All logic on server, client is dumb
2. **Convention over configuration** - Sensible defaults, override when needed
3. **Tenant = Configuration** - Not code changes, just config
4. **TypeScript schemas** - Type safety, IDE support, no JSON fumbling

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        TENANT LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Tenant A   │  │  Tenant B   │  │  Tenant C   │              │
│  │  - theme    │  │  - theme    │  │  - theme    │              │
│  │  - features │  │  - features │  │  - features │              │
│  │  - screens  │  │  - screens  │  │  - screens  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SCREEN RESOLVER                             │
│  Input: tenant + screenId + user context                        │
│  Output: Fully resolved screen (no expressions, no conditions)  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       CLIENT RENDERER                            │
│  - Receives flat, resolved props                                │
│  - Maps components                                              │
│  - Handles events → API calls                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Simplified Schema Design

### Before (Complex)
```typescript
{
  id: "welcome-btn",
  type: "button",
  props: {
    text: "{{state.isLoading ? 'Loading...' : 'Continue'}}",
    disabled: "{{state.isLoading || !form.phone || form.phone.length < 10}}",
    variant: "{{state.selectedPlan === 'premium' ? 'primary' : 'secondary'}}"
  },
  conditions: {
    operator: "and",
    conditions: [
      { field: "state.step", operator: "eq", value: "phone" },
      { field: "context.features.showContinue", operator: "eq", value: true }
    ]
  },
  actions: [...]
}
```

### After (Simple)
```typescript
{
  id: "welcome-btn",
  type: "Button",
  props: {
    text: "Continue",      // Static, or from server
    disabled: false,       // Server computed
    variant: "primary"     // Server computed
  },
  onAction: "continue"     // Named action, server handles logic
}
```

## Key Simplifications

### 1. Server-Side Resolution

Instead of sending expressions to the client:

```typescript
// Server: resolves everything before sending
async function resolveScreen(
  tenant: string,
  screenId: string,
  context: UserContext
): Promise<ResolvedScreen> {
  const screen = getScreenSchema(tenant, screenId);

  return {
    ...screen,
    components: screen.components
      .filter(c => evaluateVisibility(c, context))  // Filter invisible
      .map(c => resolveProps(c, context))           // Resolve all props
  };
}

// Client receives flat, resolved props - no evaluation needed
```

### 2. Named Actions (Not Inline Logic)

```typescript
// Schema defines WHAT action, not HOW
{
  type: "Button",
  props: { text: "Send OTP" },
  onAction: "sendOtp"  // Just a name
}

// Server defines action behavior per tenant
const tenantActions = {
  "tenant-a": {
    sendOtp: async (ctx) => {
      await sendSms(ctx.form.phone);
      return { nextScreen: "verify-otp" };
    }
  },
  "tenant-b": {
    sendOtp: async (ctx) => {
      await sendWhatsApp(ctx.form.phone);  // Different channel!
      return { nextScreen: "verify-otp" };
    }
  }
};
```

### 3. Tenant Configuration (Not Code)

```typescript
// tenants/tenant-a.config.ts
export const config: TenantConfig = {
  id: "tenant-a",
  name: "TelcoMax",

  theme: {
    primaryColor: "#6366f1",
    logo: "/logos/telcomax.svg"
  },

  features: {
    onboarding: true,
    socialLogin: false,
    biometricAuth: true,
    darkMode: true
  },

  screens: {
    // Override specific screens
    "onboarding-welcome": "custom-welcome",  // Use different screen
    // Others use defaults
  },

  flows: {
    onboarding: ["welcome", "phone", "otp", "profile", "plan"],
    // Skip steps for some tenants
  }
};
```

### 4. Component Variants (Not Conditions)

Instead of complex conditional rendering:

```typescript
// Define variants in component
const Button = {
  variants: {
    primary: "bg-indigo-600 text-white",
    secondary: "bg-white border text-slate-700",
    loading: "bg-indigo-400 text-white cursor-wait"
  }
};

// Schema just picks variant
{
  type: "Button",
  variant: "primary",  // Server picks based on state
  props: { text: "Continue" }
}
```

## Simplified Type System

```typescript
// Core types - much simpler
interface Screen {
  id: string;
  title: string;
  components: Component[];
}

interface Component {
  id: string;
  type: keyof ComponentRegistry;
  props: Record<string, unknown>;
  variant?: string;
  children?: Component[];
  onAction?: string;           // Named action
  onSubmit?: string;           // Form submit action
}

interface TenantConfig {
  id: string;
  theme: ThemeConfig;
  features: Record<string, boolean>;
  screens?: Record<string, string>;  // Screen overrides
  actions?: Record<string, ActionHandler>;  // Custom actions
}

// No more:
// - DataBinding type
// - Condition type
// - Expression evaluation
// - Transform pipes
```

## Implementation Plan

### Phase 1: Simplify Core (Keep Current Features Working)
- [ ] Move expression evaluation to server-side resolver
- [ ] Simplify state to single `state` object
- [ ] Convert inline actions to named actions
- [ ] Add tenant configuration layer

### Phase 2: Add Enterprise Features
- [ ] Tenant management API
- [ ] Screen versioning
- [ ] A/B testing support
- [ ] Analytics hooks
- [ ] Audit logging

### Phase 3: Developer Experience
- [ ] Visual schema editor
- [ ] Live preview
- [ ] Schema validation CLI
- [ ] Tenant simulator

## File Structure

```
src/
├── sdui/
│   ├── core/
│   │   ├── renderer.tsx        # Dumb renderer, no logic
│   │   ├── components.ts       # Component registry
│   │   └── types.ts            # Simplified types
│   │
│   ├── server/
│   │   ├── resolver.ts         # Resolves screens with context
│   │   ├── actions.ts          # Action handlers
│   │   └── validator.ts        # Schema validation
│   │
│   └── tenants/
│       ├── index.ts            # Tenant loader
│       ├── default.config.ts   # Default configuration
│       └── [tenant-id]/
│           ├── config.ts       # Tenant config
│           ├── theme.ts        # Theme overrides
│           ├── screens/        # Custom screens
│           └── actions.ts      # Custom actions
│
├── screens/                    # Base screen schemas
│   ├── onboarding/
│   ├── dashboard/
│   └── settings/
```

## API Design

### Get Resolved Screen
```typescript
GET /api/screens/:screenId
Headers: X-Tenant-ID: tenant-a

Response: {
  screen: {
    id: "onboarding-welcome",
    components: [
      // Fully resolved, no expressions
      { id: "title", type: "Heading", props: { text: "Welcome to TelcoMax" } },
      { id: "cta", type: "Button", props: { text: "Get Started" }, onAction: "start" }
    ]
  },
  state: {
    // Initial state from server
  }
}
```

### Execute Action
```typescript
POST /api/actions/:actionName
Headers: X-Tenant-ID: tenant-a
Body: {
  screenId: "onboarding-phone",
  state: { ... },
  form: { phone: "+1234567890" }
}

Response: {
  // What to do next
  navigate?: string,
  updateState?: Record<string, unknown>,
  toast?: { type: "success", message: "OTP sent!" },
  error?: { field: "phone", message: "Invalid number" }
}
```

## Benefits of This Approach

| Aspect | Before | After |
|--------|--------|-------|
| Client complexity | High (expression eval, conditions) | Low (just render) |
| Type safety | Partial (runtime strings) | Full (TypeScript) |
| Debugging | Hard (client-side logic) | Easy (server logs) |
| Security | Risk (client expressions) | Safe (server only) |
| Performance | Slower (runtime eval) | Faster (pre-resolved) |
| Multi-tenancy | Complex (conditions) | Simple (config layer) |
| Testing | Hard (UI + logic mixed) | Easy (logic separate) |

## Migration Path

1. Keep current renderer working
2. Add server resolver alongside
3. Gradually move screens to new format
4. Remove client-side expression evaluation
5. Simplify types
