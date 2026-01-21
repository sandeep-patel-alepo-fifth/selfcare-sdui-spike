# Selfcare SDUI Spike

A Server-Driven UI (SDUI) framework for telecommunications self-care applications. This project demonstrates how to build dynamic, JSON-driven user interfaces that can be updated without client deployments.

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

Visit http://localhost:3000/dashboard to see the demo.

## What is SDUI?

Server-Driven UI is an architectural pattern where the server sends JSON schemas that describe the UI, and the client renders them dynamically. This enables:

- **Instant UI updates** without app releases
- **A/B testing** with different screen variants
- **Multi-tenant support** with customized UIs per tenant
- **Rapid iteration** by product teams

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | React framework with App Router |
| React 19 | UI rendering |
| TypeScript | Type safety |
| Tailwind CSS 4 | Styling |
| Zustand | State management |
| Prisma | Database ORM |
| MongoDB | Database |
| Zod | Schema validation |

## Project Structure

```
src/
├── app/                    # Next.js pages and API routes
├── components/
│   ├── sdui/              # SDUI framework components
│   └── ui/                # Reusable UI components
├── lib/
│   ├── sdui/              # Core SDUI framework
│   │   ├── renderer.tsx   # Dynamic component renderer
│   │   ├── action-dispatcher.ts
│   │   ├── condition-evaluator.ts
│   │   ├── data-binding.ts
│   │   ├── component-registry.tsx
│   │   └── store.ts       # Zustand state store
│   └── db/                # Database utilities
└── types/
    └── sdui.ts            # TypeScript + Zod schemas

docs/
└── architecture/          # Detailed documentation
```

## Architecture Documentation

For detailed documentation, see the [Architecture Guide](./docs/architecture/00-overview.md):

| Document | Description |
|----------|-------------|
| [00-overview](./docs/architecture/00-overview.md) | Big picture and mental model |
| [01-getting-started](./docs/architecture/01-getting-started.md) | Setup and first changes |
| [02-sdui-core](./docs/architecture/02-sdui-core.md) | Renderer, data binding, conditions |
| [03-actions-system](./docs/architecture/03-actions-system.md) | Action dispatcher and triggers |
| [04-components](./docs/architecture/04-components.md) | Building and registering components |
| [05-api-layer](./docs/architecture/05-api-layer.md) | Routes, database, Prisma |
| [06-state-management](./docs/architecture/06-state-management.md) | Zustand store patterns |
| [07-extending](./docs/architecture/07-extending.md) | Future features guidance |
| [08-troubleshooting](./docs/architecture/08-troubleshooting.md) | Common issues and debugging |

## Key Concepts

### Screen Schema

UI screens are defined as JSON:

```typescript
{
  version: "1.0",
  id: "dashboard",
  type: "screen",
  components: [
    {
      id: "greeting",
      type: "heading",
      props: { text: "Hello, {{user.firstName}}!" }
    }
  ]
}
```

### Template Strings

Dynamic data binding with transforms:

```typescript
"{{user.balance|currency}}"     // "$125.50"
"{{user.name|uppercase}}"       // "JOHN DOE"
"{{user.plan.type|capitalize}}" // "Postpaid"
```

### Conditional Rendering

Show/hide components based on data:

```typescript
{
  type: "alert",
  props: { title: "Upgrade Available" },
  conditions: {
    field: "user.plan.type",
    operator: "eq",
    value: "prepaid"
  }
}
```

### Declarative Actions

Define what happens on interaction:

```typescript
{
  type: "button",
  props: { text: "View Plans" },
  actions: [
    {
      trigger: "click",
      type: "navigate",
      payload: { route: "/plans" }
    }
  ]
}
```

## Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run db:generate # Generate Prisma client
npm run db:push    # Push schema to database
npm run db:studio  # Open Prisma Studio
```

## Demo Pages

- `/dashboard` - Main dashboard with usage widgets and quick actions
- `/onboarding` - Multi-step onboarding flow

## Development Notes

- The app works without a database (falls back to mock screens)
- Hot reload works for schema changes
- TypeScript provides full type safety for schemas

## License

MIT
