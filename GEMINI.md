# AgentZero 🤖 - Development Context

Welcome to the **AgentZero** codebase. This file provides critical context and guidelines for interacting with this repository.

## Project Overview

**AgentZero** is an AI Agent Management Platform designed to build, deploy, and monitor AI agents. It is structured as a monorepo managed by `turbo` and `pnpm`.

### Architecture & Tech Stack

- **Monorepo:** [Turbo](https://turbo.build/) + [pnpm](https://pnpm.io/)
- **Backend:** [NestJS](https://nestjs.com/) + [Prisma ORM](https://www.prisma.io/)
  - Database: PostgreSQL (likely via Supabase or local Docker)
  - Auth: JWT (Passport) + Supabase integration
  - Key Modules: `Auth`, `Agents`, `Conversations`, `Usage`
- **Frontend:** [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
  - Styling: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
  - 3D/VFX: [Three.js](https://threejs.org/) + [React Three Fiber](https://r3f.docs.pmnd.rs/)
  - API Client: Custom `ApiClient` located in `apps/frontend/src/lib/api.ts`

## Directory Structure

```text
agentzero/
├── apps/
│   ├── backend/      # NestJS Application
│   │   ├── src/      # Core logic (Auth, Agents, etc.)
│   │   └── prisma/   # Schema definition and migrations
│   └── frontend/     # Next.js Application
│       ├── src/app/  # App Router pages and layouts
│       ├── src/components/ # UI components
│       └── src/lib/  # API client and utilities
├── supabase/         # Local Supabase configuration
├── docker-compose.yml # Infrastructure (Postgres, Redis, etc.)
└── turbo.json        # Monorepo task orchestration
```

## Building and Running

### Prerequisites
- Node.js (>=18)
- pnpm (>=10)
- Docker Desktop (for local infrastructure)

### Key Commands

- **Setup:** `pnpm install`
- **Infrastructure:** `docker compose up -d`
- **Database Migrations:** `pnpm --filter backend exec prisma migrate dev`
- **Development:** `pnpm dev` (Starts frontend on `:3000` and backend on `:4000`)
- **Build:** `pnpm build`
- **Linting:** `pnpm lint`
- **Formatting:** `pnpm format`

## Development Conventions

### Backend
- **Controller Routes:** Standard prefix is `api/v1` (e.g., `@Controller('api/v1/agents')`).
- **Security:** Use `@UseGuards(JwtAuthGuard)` for protected routes.
- **Prisma:** Always update `schema.prisma` and run migrations for database changes.

### Frontend
- **Components:** Follow the `shadcn/ui` pattern for reusable components.
- **State Management:** Use standard React 19 patterns (Server Components by default).
- **API Calls:** Use the `api` instance from `src/lib/api.ts`.
- **3D:** Three.js components are located in `src/components/` (e.g., `Hero3DScene.tsx`).

### General
- **Formatting:** Run `pnpm format` before committing.
- **Linting:** Ensure `pnpm lint` passes in all applications.
- **Environment Variables:** Reference `.env.example` files in `apps/backend` and `apps/frontend` for required keys.
