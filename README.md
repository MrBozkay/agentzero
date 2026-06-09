# AgentZero 🤖

> AI Agent Management Platform — Build, deploy, and monitor AI agents without the infrastructure headache.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui |
| Backend | NestJS, Prisma ORM |
| Database | PostgreSQL 16 |
| Cache | Redis |
| Auth | NextAuth v5 + NestJS Passport JWT |
| AI | Multi-LLM (OpenAI, Anthropic, DeepSeek) |
| Container | Docker Compose |

## Features

- **Agent CRUD** — Create, configure, and manage AI agents
- **Multi-LLM Support** — OpenAI, Anthropic, DeepSeek, local models
- **Conversation System** — Real-time chat with streaming responses
- **Usage Tracking** — Token consumption, cost analytics, limits
- **Subscription Plans** — Free ($0) → Scale ($499/mo)
- **Admin Dashboard** — User management, system monitoring

## Quick Start

```bash
# Start infrastructure
docker compose up -d

# Install dependencies
pnpm install

# Run database migrations
pnpm --filter backend exec prisma migrate dev

# Start dev servers (frontend :3000, backend :4000)
pnpm dev
```

## Project Structure

```
agentzero/
├── apps/
│   ├── frontend/      # Next.js 15 App Router
│   │   ├── app/       # RSC pages + layouts
│   │   ├── components/ # shadcn/ui + custom
│   │   └── lib/       # API client, auth, utils
│   └── backend/       # NestJS
│       ├── src/
│       │   ├── modules/ # Auth, Agents, Conversations, Usage
│       │   ├── common/  # Guards, interceptors
│       │   └── prisma/  # Schema + migrations
│       └── test/
├── packages/          # Shared types (future)
├── docker-compose.yml
└── turbo.json
```

## Agent Types (MVP)

| Type | Description |
|------|------------|
| Chatbot | Customer support, FAQ |
| Lead Generation | Web scraping + email finding |
| Content Generation | Text, image, video |
| Sales Assistant | CRM integration, deal tracking |

## Environment Variables

See `.env.example` in each app directory.

## License

MIT
