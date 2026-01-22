# State Management with React Context

This document covers state management using React Context - the simple, built-in approach we use for tenant config, auth state, and UI state.

## Overview

We use React Context instead of external state libraries because:

- **Simplicity**: No extra dependencies
- **Sufficiency**: Our state needs are straightforward
- **Built-in**: React DevTools support out of the box
- **SSR-friendly**: Works well with Next.js

---

## Context Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       CONTEXT PROVIDERS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  TenantProvider                                          │   │
│  │  - tenant config                                         │   │
│  │  - branding                                              │   │
│  │  - features                                              │   │
│  │  - localization                                          │   │
│  │                                                          │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │  AuthProvider                                      │  │   │
│  │  │  - user                                            │  │   │
│  │  │  - tokens                                          │  │   │
│  │  │  - login/logout methods                            │  │   │
│  │  │                                                    │  │   │
│  │  │  ┌─────────────────────────────────────────────┐  │  │   │
│  │  │  │  ThemeProvider (MUI)                        │  │  │   │
│  │  │  │  - derived from tenant branding             │  │  │   │
│  │  │  │                                             │  │  │   │
│  │  │  │  [Application Components]                   │  │  │   │
│  │  │  │                                             │  │  │   │
│  │  │  └─────────────────────────────────────────────┘  │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tenant Context

```typescript
// lib/core/tenant-context.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { TenantConfig } from '@/types/tenant';

const TenantContext = createContext<TenantConfig | null>(null);

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: TenantConfig;
  children: ReactNode;
}) {
  // Create MUI theme from tenant branding
  const theme = createTheme({
    palette: {
      mode: tenant.branding.theme === 'auto' ? 'light' : tenant.branding.theme,
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

export function useFeature(feature: keyof TenantConfig['features']): boolean {
  const tenant = useTenant();
  return tenant.features[feature] ?? false;
}
```

### Usage

```tsx
function Dashboard() {
  const tenant = useTenant();
  const hasAutopay = useFeature('autopay');

  return (
    <Box>
      <Typography>Welcome to {tenant.name}</Typography>
      {hasAutopay && <AutopayWidget />}
    </Box>
  );
}
```

---

## Auth Context

```typescript
// lib/core/auth-context.tsx
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types/user';
import { useTenant } from './tenant-context';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
}

interface AuthContextValue extends AuthState {
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
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

    const data = await response.json();

    if (data.requiresMfa) {
      sessionStorage.setItem('pendingAuth', JSON.stringify(data));
      router.push('/verify-otp');
      return;
    }

    setState({
      user: data.user,
      isAuthenticated: true,
      isLoading: false,
      accessToken: data.accessToken,
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
    });

    router.push('/login');
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

    const data = await response.json();
    sessionStorage.removeItem('pendingAuth');

    setState({
      user: data.user,
      isAuthenticated: true,
      isLoading: false,
      accessToken: data.accessToken,
    });

    router.push('/dashboard');
  }, [tenant.id, router]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, verifyOtp }}>
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

### Usage

```tsx
function Header() {
  const { user, logout } = useAuth();

  return (
    <AppBar>
      <Toolbar>
        <Typography>Hello, {user?.firstName}</Typography>
        <Button onClick={logout}>Logout</Button>
      </Toolbar>
    </AppBar>
  );
}
```

---

## Local Component State

For component-specific state, use React's built-in hooks:

```tsx
function PaymentForm() {
  // Local form state
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await processPayment(amount);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField value={amount} onChange={(e) => setAmount(e.target.value)} />
      {error && <Alert severity="error">{error}</Alert>}
      <Button type="submit" loading={loading}>Pay</Button>
    </form>
  );
}
```

---

## Provider Setup

```tsx
// app/layout.tsx
import { TenantProvider } from '@/lib/core/tenant-context';
import { AuthProvider } from '@/lib/core/auth-context';

export default async function RootLayout({ children }) {
  const tenant = await loadTenantFromRequest();

  return (
    <html lang={tenant.localization.locale}>
      <body>
        <TenantProvider tenant={tenant}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </TenantProvider>
      </body>
    </html>
  );
}
```

---

## Best Practices

1. **Keep contexts focused** - One concern per context
2. **Memoize callbacks** - Use `useCallback` for context methods
3. **Handle loading states** - Show appropriate UI while loading
4. **Use local state first** - Only lift state when needed
5. **Don't over-context** - Not everything needs to be in context

---

## When to Consider Zustand/Redux

If you need:
- Complex state updates across many components
- Time-travel debugging
- State persistence
- Middleware (logging, async)

Then consider adding Zustand (simpler) or Redux (more features).

---

## Next Steps

- [Extending](./07-extending.md) - Add new features
- [Troubleshooting](./08-troubleshooting.md) - Debug issues
