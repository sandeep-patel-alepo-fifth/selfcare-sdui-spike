# API Layer: Routes and Integrations

This document covers the backend API layer - routes, tenant-aware requests, and external integrations.

## Architecture

```
src/app/api/
├── auth/
│   ├── login/route.ts
│   ├── logout/route.ts
│   ├── verify-otp/route.ts
│   └── refresh/route.ts
├── billing/
│   ├── balance/route.ts
│   ├── invoices/route.ts
│   ├── pay/route.ts
│   └── autopay/route.ts
├── usage/
│   ├── summary/route.ts
│   ├── history/route.ts
│   └── cdr/route.ts
├── services/
│   ├── active/route.ts
│   └── data-passes/route.ts
├── plans/
│   ├── route.ts
│   └── switch/route.ts
├── profile/
│   └── route.ts
└── admin/
    ├── tenants/route.ts
    └── plans/route.ts
```

---

## Tenant-Aware API Routes

Every API route must be tenant-aware:

```typescript
// app/api/billing/balance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTenantFromRequest } from '@/lib/core/tenant';
import { getAuthFromRequest } from '@/lib/core/auth';
import { billingService } from '@/lib/services/billing';

export async function GET(request: NextRequest) {
  // 1. Get tenant context
  const tenant = await getTenantFromRequest(request);
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  // 2. Verify authentication
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. Fetch data with tenant context
  const balance = await billingService.getBalance({
    tenantId: tenant.id,
    userId: auth.userId,
  });

  return NextResponse.json({ balance });
}
```

### Helper Functions

```typescript
// lib/core/tenant.ts
export async function getTenantFromRequest(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id');
  if (!tenantId) return null;

  // Load from config or database
  return loadTenantConfig(tenantId);
}

// lib/core/auth.ts
export async function getAuthFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  return verifyToken(token);
}
```

---

## External Service Integration

### CRM Integration

```typescript
// lib/services/crm.ts
export class CRMService {
  private tenant: TenantConfig;

  constructor(tenant: TenantConfig) {
    this.tenant = tenant;
  }

  async getSubscriberProfile(subscriberId: string) {
    const response = await fetch(
      `${this.tenant.integrations.crm.baseUrl}/subscribers/${subscriberId}`,
      {
        headers: {
          'Authorization': `Bearer ${await this.getAccessToken()}`,
          'X-Client-ID': this.tenant.integrations.crm.clientId,
        },
      }
    );

    if (!response.ok) {
      throw new CRMError('Failed to fetch subscriber', response.status);
    }

    return response.json();
  }

  private async getAccessToken() {
    // OAuth token retrieval/refresh logic
  }
}
```

### Billing Integration

```typescript
// lib/services/billing.ts
export class BillingService {
  async getBalance(params: { tenantId: string; userId: string }) {
    const tenant = await loadTenantConfig(params.tenantId);
    const crm = new CRMService(tenant);

    const subscriber = await crm.getSubscriberProfile(params.userId);

    return {
      balance: subscriber.balance,
      currency: tenant.localization.currency,
      lastUpdated: new Date().toISOString(),
    };
  }

  async processPayment(params: {
    tenantId: string;
    userId: string;
    amount: number;
    paymentMethod: PaymentMethod;
  }) {
    const tenant = await loadTenantConfig(params.tenantId);

    // Route to appropriate payment gateway
    if (params.paymentMethod.type === 'card') {
      return this.processStripePayment(tenant, params);
    } else if (params.paymentMethod.type === 'cashapp') {
      return this.processCashAppPayment(tenant, params);
    }

    throw new Error('Unsupported payment method');
  }
}

export const billingService = new BillingService();
```

---

## Error Handling

Standardize error responses:

```typescript
// lib/core/errors.ts
export class APIError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
  }
}

export function handleAPIError(error: unknown) {
  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }

  console.error('Unexpected error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### Using Error Handler

```typescript
export async function POST(request: NextRequest) {
  try {
    const tenant = await getTenantFromRequest(request);
    const body = await request.json();

    // Validate with Zod
    const data = paymentSchema.parse(body);

    const result = await billingService.processPayment({
      tenantId: tenant.id,
      ...data,
    });

    return NextResponse.json({
      success: true,
      data: result,
      toast: { type: 'success', message: 'Payment successful!' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: formatZodErrors(error) },
        { status: 400 }
      );
    }
    return handleAPIError(error);
  }
}
```

---

## Database Layer (Prisma)

```typescript
// lib/db/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### Tenant-Scoped Queries

```typescript
// Always filter by tenant
const users = await prisma.user.findMany({
  where: {
    tenantId: tenant.id,  // Always include tenant filter
    status: 'active',
  },
});
```

---

## API Response Format

Standardize all responses:

```typescript
// Success response
{
  "success": true,
  "data": { ... },
  "toast": { "type": "success", "message": "..." },  // Optional
  "navigate": "/path"  // Optional
}

// Error response
{
  "success": false,
  "errors": {
    "fieldName": "Error message",
    "_form": "General error message"
  }
}
```

---

## Best Practices

1. **Always verify tenant** - First thing in every handler
2. **Always verify auth** - For protected routes
3. **Use Zod for validation** - Type-safe request validation
4. **Return consistent format** - Success/error structure
5. **Log appropriately** - Tenant-aware logging
6. **Handle timeouts** - External services may be slow

---

## Next Steps

- [State Management](./06-state-management.md) - Client-side state
- [Extending](./07-extending.md) - Add new features
- [Troubleshooting](./08-troubleshooting.md) - Debug issues
