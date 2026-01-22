# Alepo Enterprise Selfcare

> A multi-tenant selfcare boilerplate for telecom operators built with Next.js, MUI, and JSON Forms.

## Overview

This documentation covers the architecture, components, and development patterns for the Alepo Enterprise Selfcare platform.

## Key Features

- **Multi-tenant Architecture** - Single codebase serving multiple operators
- **Simplified SDUI** - JSON Forms + MUI for dynamic screens
- **React Context** - Lightweight state management
- **TypeScript** - Full type safety

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| UI Library | Material UI (MUI) v5 |
| Forms | JSON Forms |
| State | React Context |
| Database | Prisma + MongoDB |
| Auth | JWT + HTTP-only cookies |

## Quick Links

- [Getting Started](architecture/01-getting-started.md) - Set up your development environment
- [Architecture Overview](architecture/00-overview.md) - Understand the system design
- [Components](architecture/04-components.md) - Available UI components
- [API Layer](architecture/05-api-layer.md) - Backend integration

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     MULTI-TENANT LAYER                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Operator A │  │  Operator B │  │  Operator C │         │
│  │  Theme/Logo │  │  Theme/Logo │  │  Theme/Logo │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                     PRESENTATION LAYER                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  MUI Components + Custom Selfcare Widgets            │   │
│  │  (BalanceWidget, UsageChart, ServiceCard, etc.)     │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                     SDUI LAYER                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  JSON Forms + Screen Configs                         │   │
│  │  (Schema validation, dynamic rendering)              │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                     API LAYER                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Next.js API Routes (tenant-aware)                   │   │
│  │  → CRM Integration                                   │   │
│  │  → Payment Gateways                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```
