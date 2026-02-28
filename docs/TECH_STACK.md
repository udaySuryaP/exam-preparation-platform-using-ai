# Tech Stack

A complete reference of all technologies, libraries, tools, and services used in the KTU Exam Prep AI platform.

---

## Core Framework

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16.1.6 | Full-stack React framework (App Router, API routes, Turbopack) |
| **React** | 19.2.3 | UI component library |
| **TypeScript** | ^5 | Type-safe JavaScript |
| **Tailwind CSS** | ^4 | Utility-first CSS framework |

## Backend & Database

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Supabase** | 2.97.0 (`@supabase/supabase-js`) | PostgreSQL database, authentication, Row Level Security, Realtime |
| **Supabase SSR** | 0.8.0 (`@supabase/ssr`) | Server-side auth with cookie handling for Next.js |
| **OpenAI** | 6.22.0 | GPT for AI chat responses, embeddings for vector search |
| **pgvector** | (Supabase extension) | Vector similarity search for syllabus embeddings |

## Rate Limiting & Caching

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Upstash Redis** | 1.36.2 (`@upstash/redis`) | Serverless Redis for distributed state |
| **Upstash Ratelimit** | 2.0.8 (`@upstash/ratelimit`) | Sliding-window rate limiting for API routes |

## UI & Forms

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Lucide React** | 0.575.0 | Icon library (200+ icons used across the app) |
| **React Hook Form** | 7.71.1 | Performant form handling with controlled/uncontrolled inputs |
| **@hookform/resolvers** | 5.2.2 | Zod integration for React Hook Form |
| **Zod** | 4.3.6 | Schema validation for forms and API payloads |
| **React Markdown** | 10.1.0 | Render markdown in AI chat responses |
| **Remark GFM** | 4.0.1 | GitHub Flavored Markdown support (tables, strikethrough) |
| **clsx** | 2.1.1 | Conditional class name utility |
| **tailwind-merge** | 3.5.0 | Intelligent Tailwind class merging (deduplication) |

## Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **ESLint** | ^9 | Code linting |
| **eslint-config-next** | 16.1.6 | Next.js-specific ESLint rules |
| **@tailwindcss/postcss** | ^4 | PostCSS plugin for Tailwind CSS |
| **@types/node** | ^20 | Node.js type definitions |
| **@types/react** | ^19 | React type definitions |
| **@types/react-dom** | ^19 | React DOM type definitions |

## Infrastructure & Deployment

| Service | Purpose |
|---------|---------|
| **Supabase** (cloud) | Hosted PostgreSQL, Auth, Realtime, Storage |
| **Upstash** (cloud) | Serverless Redis (rate limiting) |
| **Vercel** (planned) | Deployment platform for Next.js |
| **Git** | Version control |
| **GitHub** | Repository hosting |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous/public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-side only) |
| `OPENAI_API_KEY` | ✅ | OpenAI API key for GPT and embeddings |
| `UPSTASH_REDIS_REST_URL` | ✅ | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | Upstash Redis authentication token |
| `NEXT_PUBLIC_APP_URL` | ✅ | Application base URL (e.g. `http://localhost:3000`) |

---

## Key Design Decisions

1. **Next.js App Router** over Pages Router — for better layouts, server components, and streaming
2. **Supabase over Firebase** — native PostgreSQL with RLS, pgvector for AI embeddings, and open-source
3. **Tailwind CSS v4** — latest version with zero-config PostCSS, faster builds
4. **Upstash Redis** — serverless, pay-per-request, perfect for rate limiting without managing infra
5. **Zod v4** — latest schema validation with better TypeScript inference
6. **React 19** — latest with transitions, use API hooks, and server actions support

## Build & Run Commands

```bash
# Install dependencies
npm install

# Start development server (Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```
