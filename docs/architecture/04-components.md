# Components: MUI and Custom Components

This document covers the component system - using MUI components and building custom selfcare-specific components.

## Overview

The component strategy:

1. **MUI** for standard UI components (Button, Card, TextField, etc.)
2. **Custom components** for selfcare-specific features (BalanceWidget, UsageChart, etc.)
3. **JSON Forms renderers** for form inputs

---

## MUI Components

MUI provides 50+ production-ready components. Use them directly:

```tsx
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Alert,
  Chip,
  Avatar,
} from '@mui/material';

function AccountCard({ user }) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar>{user.firstName[0]}</Avatar>
          <Box>
            <Typography variant="h6">
              {user.firstName} {user.lastName}
            </Typography>
            <Chip
              label={user.accountType}
              color={user.accountType === 'postpaid' ? 'primary' : 'secondary'}
              size="small"
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
```

### Theming

MUI theme is auto-derived from tenant branding:

```tsx
// lib/core/tenant-context.tsx
const theme = createTheme({
  palette: {
    mode: tenant.branding.theme,
    primary: {
      main: tenant.branding.primaryColor,
    },
    secondary: {
      main: tenant.branding.secondaryColor || tenant.branding.primaryColor,
    },
  },
  direction: tenant.localization.rtl ? 'rtl' : 'ltr',
});
```

---

## Custom Selfcare Components

### Component Structure

```
src/components/selfcare/
├── dashboard/
│   ├── balance-widget.tsx
│   ├── services-summary.tsx
│   ├── usage-chart.tsx
│   └── activity-feed.tsx
├── billing/
│   ├── invoice-list.tsx
│   ├── payment-form.tsx
│   └── autopay-toggle.tsx
├── usage/
│   ├── usage-table.tsx
│   └── service-card.tsx
├── plans/
│   ├── plan-card.tsx
│   └── plan-comparison.tsx
└── profile/
    ├── profile-form.tsx
    └── security-settings.tsx
```

### Example: Balance Widget

```tsx
// components/selfcare/dashboard/balance-widget.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Skeleton, Box } from '@mui/material';
import { useTenant } from '@/lib/core/tenant-context';
import { useApi } from '@/lib/core/api-client';
import { formatCurrency } from '@/lib/utils/format';

interface BalanceWidgetProps {
  dataSource?: string;
}

export function BalanceWidget({ dataSource = '/api/billing/balance' }: BalanceWidgetProps) {
  const tenant = useTenant();
  const api = useApi();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(dataSource)
      .then((data) => setBalance(data.balance))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [api, dataSource]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width={100} />
          <Skeleton variant="text" width={150} height={40} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography color="text.secondary" gutterBottom>
          Current Balance
        </Typography>
        <Typography variant="h4">
          {formatCurrency(balance || 0, tenant.localization.currency)}
        </Typography>
      </CardContent>
    </Card>
  );
}
```

### Example: Usage Chart

```tsx
// components/selfcare/dashboard/usage-chart.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useApi } from '@/lib/core/api-client';

interface UsageChartProps {
  dataSource?: string;
  period?: string;
}

export function UsageChart({
  dataSource = '/api/usage/summary',
  period = '30d'
}: UsageChartProps) {
  const api = useApi();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(dataSource, { period })
      .then((result) => setData(result.data))
      .finally(() => setLoading(false));
  }, [api, dataSource, period]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Data Usage
        </Typography>
        <Box height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="usage" stroke="#6366f1" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
```

### Example: Service Card

```tsx
// components/selfcare/usage/service-card.tsx
'use client';

import { Card, CardContent, Typography, Chip, Box, LinearProgress } from '@mui/material';

interface Service {
  id: string;
  name: string;
  status: 'active' | 'expired' | 'suspended';
  used: number;
  total: number;
  unit: string;
  expiresAt: string;
}

export function ServiceCard({ service }: { service: Service }) {
  const percentage = (service.used / service.total) * 100;

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start">
          <Typography variant="h6">{service.name}</Typography>
          <Chip
            label={service.status}
            color={service.status === 'active' ? 'success' : 'default'}
            size="small"
          />
        </Box>

        <Box mt={2}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              {service.used} / {service.total} {service.unit}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {percentage.toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={percentage}
            color={percentage > 90 ? 'error' : 'primary'}
          />
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Expires: {new Date(service.expiresAt).toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );
}
```

---

## Component Registration for SDUI

Register components for use in screen configurations:

```tsx
// lib/sdui/component-registry.ts
import { BalanceWidget } from '@/components/selfcare/dashboard/balance-widget';
import { UsageChart } from '@/components/selfcare/dashboard/usage-chart';
import { ServicesSummary } from '@/components/selfcare/dashboard/services-summary';
import { ActivityFeed } from '@/components/selfcare/dashboard/activity-feed';

export const componentRegistry: Record<string, React.ComponentType<any>> = {
  // Dashboard widgets
  BalanceWidget,
  UsageChart,
  ServicesSummary,
  ActivityFeed,

  // MUI components (pass-through)
  Card: MuiCard,
  Typography: MuiTypography,
  Button: MuiButton,
};

export function getComponent(type: string) {
  return componentRegistry[type] || null;
}
```

---

## Best Practices

1. **Use MUI components** - Don't reinvent the wheel
2. **Accept `dataSource` props** - Let screens configure data fetching
3. **Handle loading states** - Show skeletons
4. **Handle errors gracefully** - Show user-friendly messages
5. **Use tenant context** - Format according to locale

---

## Next Steps

- [API Layer](./05-api-layer.md) - Create data endpoints
- [State Management](./06-state-management.md) - Manage component state
- [Extending](./07-extending.md) - Add new features
