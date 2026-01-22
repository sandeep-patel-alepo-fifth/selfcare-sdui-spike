# Getting Started

This guide walks you through setting up the Alepo Enterprise Selfcare Boilerplate and making your first changes.

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ or **pnpm** 8+
- **MongoDB** 6+ (local or Atlas)
- **Git**
- **VS Code** (recommended) with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features

---

## Quick Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd alepo-selfcare-boilerplate

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/selfcare"

# Auth
JWT_SECRET="your-secret-key-min-32-chars"
JWT_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"

# CRM Integration (optional for development)
CRM_BASE_URL="https://crm.example.com/api"
CRM_CLIENT_ID="your-client-id"
CRM_CLIENT_SECRET="your-client-secret"

# Default tenant for development
DEFAULT_TENANT_ID="demo"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or run migrations (production)
npm run db:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

---

## Project Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests with Vitest |
| `npm run test:ui` | Run tests with UI |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |

---

## First Changes

### Adding a New Tenant

1. Create tenant configuration file:

```bash
touch config/tenants/acme.json
```

2. Add tenant configuration:

```json
{
  "id": "acme",
  "name": "ACME Telecom",
  "status": "active",
  "branding": {
    "logo": "/logos/acme.svg",
    "primaryColor": "#2563eb",
    "secondaryColor": "#1e40af",
    "theme": "light"
  },
  "features": {
    "autopay": true,
    "familyAccounts": true,
    "chatbot": false,
    "expressPay": true
  },
  "localization": {
    "dateFormat": "MM/DD/YYYY",
    "timezone": "America/New_York",
    "currency": "USD",
    "locale": "en-US"
  },
  "contact": {
    "supportEmail": "support@acme.com",
    "supportPhone": "+1-800-555-0123"
  }
}
```

3. Add logo to `public/logos/acme.svg`

4. Access at `http://acme.localhost:3000`

### Creating a New Page

1. Create the route:

```bash
mkdir -p src/app/\(portal\)/rewards
touch src/app/\(portal\)/rewards/page.tsx
```

2. Add the page component:

```tsx
// src/app/(portal)/rewards/page.tsx
'use client';

import { Box, Typography, Card, CardContent } from '@mui/material';
import { useTenant } from '@/lib/core/tenant-context';
import { useAuth } from '@/lib/core/auth-context';

export default function RewardsPage() {
  const tenant = useTenant();
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Rewards Program
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6">
            Welcome, {user?.firstName}!
          </Typography>
          <Typography color="text.secondary">
            Earn rewards with {tenant.name}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
```

### Adding a Form with JSON Forms

1. Create screen configuration:

```json
// src/screens/rewards/redeem.json
{
  "id": "rewards-redeem",
  "type": "form",
  "title": "Redeem Rewards",
  "form": {
    "schema": {
      "type": "object",
      "required": ["rewardCode"],
      "properties": {
        "rewardCode": {
          "type": "string",
          "title": "Reward Code",
          "minLength": 8,
          "pattern": "^[A-Z0-9]+$"
        }
      }
    }
  },
  "actions": {
    "submit": {
      "type": "api",
      "endpoint": "/api/rewards/redeem",
      "method": "POST"
    }
  }
}
```

2. Use ScreenLoader to render:

```tsx
// src/app/(portal)/rewards/redeem/page.tsx
'use client';

import { ScreenLoader } from '@/lib/sdui/screen-loader';
import redeemScreen from '@/screens/rewards/redeem.json';

export default function RedeemPage() {
  return <ScreenLoader screen={redeemScreen} />;
}
```

---

## Development Workflow

### Feature Flags

```tsx
import { useFeature } from '@/lib/core/tenant-context';

function RewardsSection() {
  const hasRewards = useFeature('rewardsProgram');

  if (!hasRewards) return null;

  return <RewardsWidget />;
}
```

### API Calls

```tsx
import { useApi } from '@/lib/core/api-client';

function BalanceWidget() {
  const api = useApi();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    api.get('/billing/balance').then(setBalance);
  }, [api]);

  return <div>Balance: {balance?.amount}</div>;
}
```

### Theming

MUI theme auto-derives from tenant branding:

```tsx
import { useTheme } from '@mui/material/styles';

function BrandedButton() {
  const theme = useTheme();

  return (
    <Button sx={{ backgroundColor: theme.palette.primary.main }}>
      Click Me
    </Button>
  );
}
```

---

## Common Issues

### Port Already in Use

```bash
lsof -i :3000
kill -9 <PID>
```

### Database Connection Failed

1. Ensure MongoDB is running
2. Check `DATABASE_URL` in `.env`
3. Run `npm run db:push`

### Tenant Not Found

1. Check config exists in `config/tenants/`
2. Set `DEFAULT_TENANT_ID` in `.env`

---

## Next Steps

- [SDUI Core](./02-sdui-core.md) - Screen configuration
- [Components](./04-components.md) - Build components
- [API Layer](./05-api-layer.md) - Create endpoints
