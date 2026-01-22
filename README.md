# Alepo Enterprise Selfcare Boilerplate

A production-ready boilerplate for Alepo's Enterprise Multitenant Selfcare platform (SelfcareNOW). Built with Next.js 14, React, TypeScript, and a simplified SDUI approach using JSON Forms + MUI.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your MongoDB connection string

# Generate Prisma client
npm run db:generate

# Start development server
npm run dev
```

Visit http://localhost:3000 to see the demo.

## Architecture

> "Use libraries, don't build frameworks"

This boilerplate leverages proven open-source libraries instead of custom implementations:

| Concern | Library | Rationale |
|---------|---------|-----------|
| Forms | JSON Forms | Enterprise-grade, schema-driven |
| UI | MUI (Material UI) | Comprehensive, accessible, themeable |
| Validation | Zod | Type-safe, composable schemas |
| State | React Context | Simple, debuggable |
| Routing | Next.js App Router | Server components, file-based |

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router |
| React 18 | UI rendering |
| TypeScript | Type safety |
| MUI | Component library |
| JSON Forms | Schema-driven forms |
| Prisma | Database ORM |
| MongoDB | Database |
| Zod | Schema validation |

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Public auth routes
│   │   ├── login/
│   │   ├── register/
│   │   └── verify-otp/
│   │
│   ├── (portal)/                 # Protected customer portal
│   │   ├── dashboard/
│   │   ├── billing/
│   │   ├── usage/
│   │   ├── plans/
│   │   ├── profile/
│   │   └── support/
│   │
│   ├── admin/                    # Admin portal
│   └── api/                      # API routes
│
├── lib/
│   ├── core/                     # Core infrastructure
│   │   ├── tenant-context.tsx
│   │   ├── auth-context.tsx
│   │   └── api-client.ts
│   │
│   └── sdui/                     # Simplified SDUI
│       ├── types.ts
│       ├── screen-loader.tsx
│       └── actions.tsx
│
├── components/
│   ├── ui/                       # Base UI components
│   ├── layout/                   # Layout components
│   └── selfcare/                 # Feature components
│       ├── dashboard/
│       ├── billing/
│       ├── usage/
│       └── ...
│
├── screens/                      # Screen JSON configs
│   ├── auth/
│   ├── dashboard/
│   └── billing/
│
└── types/                        # TypeScript types
```

## Multi-Tenancy

The platform supports complete tenant isolation with:

- **Tenant Resolution**: Subdomain-based (tenant.selfcare.com) or custom domains
- **Branding**: Custom logos, colors, themes per tenant
- **Features**: Feature flags configurable per tenant
- **Localization**: Date formats, timezones, currencies, RTL support

```typescript
// Example tenant configuration
{
  id: "tenant-a",
  name: "TelcoMax",
  branding: {
    logo: "/logos/telcomax.svg",
    primaryColor: "#6366f1",
    theme: "light"
  },
  features: {
    autopay: true,
    familyAccounts: true,
    chatbot: false
  }
}
```

## Feature Modules

| Module | Description |
|--------|-------------|
| Dashboard | Account overview, balance, usage charts, activity feed |
| Billing | Bills, payments, autopay, payment methods |
| Usage | Usage history, CDR, data passes, services |
| Plans | Browse plans, plan switching, add-ons |
| Profile | Account settings, security, preferences |
| Family | Parent-child hierarchy management |
| Support | FAQ, tickets, chatbot |

## Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run test       # Run tests
npm run db:generate # Generate Prisma client
npm run db:push    # Push schema to database
npm run db:studio  # Open Prisma Studio
```

## Documentation

- [Design Document](./docs/plans/2026-01-22-alepo-selfcare-boilerplate-design.md) - Full architecture and implementation details
- [Requirements](./enterprise-selfcare-requirements.md) - Enterprise requirements specification

### Training Resources (SDUI Concepts)

The `docs/architecture/` folder contains detailed documentation on Server-Driven UI concepts:

| Document | Description |
|----------|-------------|
| [00-overview](./docs/architecture/00-overview.md) | SDUI concepts and mental model |
| [01-getting-started](./docs/architecture/01-getting-started.md) | Setup and first changes |
| [02-sdui-core](./docs/architecture/02-sdui-core.md) | Renderer, data binding, conditions |
| [03-actions-system](./docs/architecture/03-actions-system.md) | Action dispatcher and triggers |
| [04-components](./docs/architecture/04-components.md) | Building and registering components |
| [05-api-layer](./docs/architecture/05-api-layer.md) | Routes, database, Prisma |
| [06-state-management](./docs/architecture/06-state-management.md) | State management patterns |
| [07-extending](./docs/architecture/07-extending.md) | Future features guidance |
| [08-troubleshooting](./docs/architecture/08-troubleshooting.md) | Common issues and debugging |

> **Note:** These docs describe the original complex SDUI approach. The current boilerplate uses a simplified approach with JSON Forms + MUI. These remain valuable for understanding SDUI concepts.

## Development Notes

- The app works without a database (falls back to mock data)
- Hot reload works for all changes
- TypeScript provides full type safety
- JSON Forms handles form rendering and validation

## License

Proprietary - Alepo Technologies
