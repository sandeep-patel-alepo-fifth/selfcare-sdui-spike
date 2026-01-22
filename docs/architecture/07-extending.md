# Extending the Framework

This document provides guidance on adding new features and modules to the selfcare platform.

## Feature Implementation Checklist

When adding a new feature:

1. [ ] Define types in `src/types/`
2. [ ] Create API routes in `src/app/api/`
3. [ ] Build components in `src/components/selfcare/`
4. [ ] Create screen configs in `src/screens/`
5. [ ] Add feature flag to tenant config
6. [ ] Update documentation

---

## Adding a New Module

### Example: Voucher Redemption

#### 1. Define Types

```typescript
// types/voucher.ts
export interface Voucher {
  id: string;
  code: string;
  type: 'data' | 'credit' | 'validity';
  value: number;
  unit: string;
  status: 'active' | 'redeemed' | 'expired';
  expiresAt: string;
}

export interface RedeemVoucherRequest {
  code: string;
}

export interface RedeemVoucherResponse {
  success: boolean;
  voucher?: Voucher;
  error?: string;
}
```

#### 2. Create API Route

```typescript
// app/api/vouchers/redeem/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getTenantFromRequest } from '@/lib/core/tenant';
import { getAuthFromRequest } from '@/lib/core/auth';

const redeemSchema = z.object({
  code: z.string().min(8).max(16).regex(/^[A-Z0-9]+$/),
});

export async function POST(request: NextRequest) {
  const tenant = await getTenantFromRequest(request);
  const auth = await getAuthFromRequest(request);

  if (!tenant || !auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check feature flag
  if (!tenant.features.voucherRedemption) {
    return NextResponse.json({ error: 'Feature not available' }, { status: 403 });
  }

  const body = await request.json();
  const result = redeemSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({
      success: false,
      errors: { code: 'Invalid voucher code format' },
    }, { status: 400 });
  }

  // Call CRM to redeem voucher
  const voucher = await redeemVoucher(tenant, auth.userId, result.data.code);

  return NextResponse.json({
    success: true,
    data: voucher,
    toast: { type: 'success', message: `Redeemed ${voucher.value} ${voucher.unit}!` },
  });
}
```

#### 3. Build Components

```typescript
// components/selfcare/vouchers/voucher-form.tsx
'use client';

import { useState } from 'react';
import { Box, TextField, Button, Alert } from '@mui/material';
import { useApi } from '@/lib/core/api-client';

export function VoucherForm({ onSuccess }) {
  const api = useApi();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await api.post('/vouchers/redeem', { code });
      if (result.success) {
        onSuccess?.(result.data);
        setCode('');
      } else {
        setError(result.errors?.code || 'Failed to redeem');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        label="Voucher Code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Enter voucher code"
        fullWidth
        sx={{ mb: 2 }}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Button type="submit" variant="contained" disabled={loading || !code}>
        {loading ? 'Redeeming...' : 'Redeem Voucher'}
      </Button>
    </Box>
  );
}
```

#### 4. Create Screen Config

```json
// screens/vouchers/redeem.json
{
  "id": "voucher-redeem",
  "type": "form",
  "title": "Redeem Voucher",
  "description": "Enter your voucher code to add credit or data",
  "form": {
    "schema": {
      "type": "object",
      "required": ["code"],
      "properties": {
        "code": {
          "type": "string",
          "title": "Voucher Code",
          "minLength": 8,
          "maxLength": 16,
          "pattern": "^[A-Z0-9]+$"
        }
      }
    }
  },
  "actions": {
    "submit": {
      "type": "api",
      "endpoint": "/api/vouchers/redeem",
      "method": "POST",
      "onSuccess": {
        "type": "navigate",
        "route": "/vouchers/success"
      }
    }
  }
}
```

#### 5. Add Feature Flag

```json
// config/tenants/demo.json
{
  "features": {
    "voucherRedemption": true
  }
}
```

#### 6. Create Page Route

```typescript
// app/(portal)/vouchers/page.tsx
'use client';

import { Box, Typography, Card, CardContent } from '@mui/material';
import { useFeature } from '@/lib/core/tenant-context';
import { VoucherForm } from '@/components/selfcare/vouchers/voucher-form';
import { redirect } from 'next/navigation';

export default function VouchersPage() {
  const hasVouchers = useFeature('voucherRedemption');

  if (!hasVouchers) {
    redirect('/dashboard');
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Redeem Voucher
      </Typography>
      <Card>
        <CardContent>
          <VoucherForm onSuccess={(voucher) => console.log('Redeemed:', voucher)} />
        </CardContent>
      </Card>
    </Box>
  );
}
```

---

## Adding Custom JSON Forms Renderers

```typescript
// lib/sdui/renderers/currency-input.tsx
import { withJsonFormsControlProps } from '@jsonforms/react';
import { rankWith, schemaMatches } from '@jsonforms/core';
import { TextField, InputAdornment } from '@mui/material';
import { useTenant } from '@/lib/core/tenant-context';

const CurrencyInput = ({ data, handleChange, path, label, errors }) => {
  const tenant = useTenant();

  return (
    <TextField
      label={label}
      type="number"
      value={data || ''}
      onChange={(e) => handleChange(path, parseFloat(e.target.value))}
      error={!!errors}
      helperText={errors}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {tenant.localization.currency}
          </InputAdornment>
        ),
      }}
      fullWidth
    />
  );
};

export const currencyInputTester = rankWith(
  3,
  schemaMatches((schema) => schema.format === 'currency')
);

export const CurrencyInputRenderer = withJsonFormsControlProps(CurrencyInput);
```

---

## Adding Admin Features

### Tenant Management

```typescript
// app/admin/tenants/page.tsx
'use client';

import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    fetch('/api/admin/tenants')
      .then((r) => r.json())
      .then(setTenants);
  }, []);

  const columns = [
    { field: 'id', headerName: 'ID', width: 150 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'domain', headerName: 'Domain', width: 200 },
  ];

  return (
    <Box>
      <Typography variant="h4">Tenants</Typography>
      <DataGrid rows={tenants} columns={columns} />
    </Box>
  );
}
```

---

## Testing New Features

```typescript
// __tests__/vouchers/redeem.test.ts
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VoucherForm } from '@/components/selfcare/vouchers/voucher-form';

describe('VoucherForm', () => {
  it('validates voucher code format', async () => {
    const onSuccess = vi.fn();
    render(<VoucherForm onSuccess={onSuccess} />);

    const input = screen.getByLabelText('Voucher Code');
    const button = screen.getByRole('button', { name: /redeem/i });

    // Invalid code
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/invalid/i)).toBeInTheDocument();
    });
  });
});
```

---

## Best Practices

1. **Feature flag everything** - New features should be toggle-able
2. **Type everything** - Define types before implementation
3. **Test the happy path** - At minimum, test success scenarios
4. **Document as you go** - Update docs with new features
5. **Follow existing patterns** - Consistency matters

---

## Next Steps

- [Troubleshooting](./08-troubleshooting.md) - Debug common issues
