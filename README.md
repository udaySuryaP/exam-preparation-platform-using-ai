# KTU Exam Prep AI

An AI-assisted exam-preparation platform for APJ Abdul Kalam Technological University students. It combines course organization, study tracking and syllabus-aware assistance in one responsive application.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> This is an independent educational project, not an official KTU service. AI output should be checked against the syllabus, textbooks and official university material.

## Overview

The project explores how AI can support structured exam preparation rather than operate as a general-purpose chatbot. Its intended workflow connects a student's college, branch and semester with relevant courses, conversations, study activity and exam-pattern information.

## Current Application Areas

- Authentication and personalized onboarding
- Protected dashboard routes
- Course and module browsing
- AI chat interface and saved conversations
- Profile and academic-preference management
- Active-study-time tracking
- Exam-pattern views
- API rate limiting
- Responsive desktop and mobile navigation

Some data-ingestion, AI-answer and content-population work remains in progress. See the repository documentation and roadmap before treating every screen as production-complete.

## Technology

| Area | Technology |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Authentication and database | Supabase Auth and PostgreSQL |
| AI and semantic retrieval | OpenAI and pgvector |
| Validation and forms | React Hook Form and Zod |
| Rate limiting | Upstash Redis |
| Content rendering | React Markdown and GFM |

## Architecture

```text
Browser
  │
  ▼
Next.js application
  ├── Supabase authentication
  ├── PostgreSQL data protected by Row Level Security
  ├── server-side OpenAI requests
  └── Upstash-backed API rate limits
```

Privileged credentials are server-only. The Supabase service-role key, OpenAI key and Upstash token must never be imported by client components or prefixed with `NEXT_PUBLIC_`.

## Project Structure

```text
app/
├── (auth)/             Authentication routes
├── (dashboard)/        Protected student experience
├── api/                Server endpoints
├── onboarding/         Academic-profile setup
└── page.tsx            Public landing page

components/
├── auth/               Authentication forms
├── chat/               Conversation interface
├── onboarding/         Onboarding controls
└── sidebar/            Dashboard navigation

hooks/                  Client hooks, including study-time tracking
lib/                    Supabase clients, rate limiting and utilities
types/                  Application types and academic constants
supabase/               Schema and migrations
docs/                   Architecture and product documentation
middleware.ts           Session refresh and route handling
```

## Local Development

### Requirements

- Node.js 20 or newer
- npm
- Supabase project
- OpenAI API key
- Upstash Redis database

### Installation

```bash
git clone https://github.com/udaySuryaP/exam-preparation-platform-using-ai-mini-project.git
cd exam-preparation-platform-using-ai-mini-project
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Windows PowerShell equivalent:

```powershell
Copy-Item .env.example .env.local
```

## Environment Configuration

| Variable | Visibility | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Public | Application URL and auth redirects |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Browser-safe anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Privileged administrative operations |
| `OPENAI_API_KEY` | Server only | AI requests |
| `OPENAI_ANSWER_MODEL` | Server only | Selected answer model |
| `EMBEDDING_MODEL` | Server only | Embedding model |
| `EMBEDDING_DIMENSIONS` | Server only | Vector dimensions |
| `UPSTASH_REDIS_REST_URL` | Server only | Rate-limit datastore |
| `UPSTASH_REDIS_REST_TOKEN` | Server only | Rate-limit credential |

Use development credentials locally and separate production credentials when deploying. Never commit `.env.local`.

## Database Setup

1. Create a Supabase project.
2. Review and apply the versioned SQL under `supabase/`.
3. Confirm Row Level Security is enabled on user-facing tables.
4. Review every policy before using production data.
5. Configure authentication redirect URLs for local, preview and production environments.
6. Keep email confirmation enabled in production.

Do not expose the service-role client through browser code; it bypasses Row Level Security.

## Commands

```bash
npm run dev      # Development server
npm run lint     # ESLint
npm run build    # Production build
npm run start    # Run the production build
```

Before opening a pull request:

```bash
npx tsc --noEmit
npm run lint
npm run build
npm audit --audit-level=high
```

## Documentation

| Document | Purpose |
| --- | --- |
| [Project overview](./docs/PROJECT_OVERVIEW.md) | Architecture and repository orientation |
| [Technology stack](./docs/TECH_STACK.md) | Technology decisions and configuration |
| [Data model](./docs/DATA_MODEL.md) | Tables, relationships and policies |
| [User flows](./docs/USER_FLOW.md) | Student journeys and application behavior |
| [Features](./docs/FEATURES.md) | Detailed feature scope |
| [Milestones](./docs/MILESTONES.md) | Implementation progress and roadmap |

## Roadmap

- Complete syllabus and course-data ingestion
- Validate AI answers against reviewed academic sources
- Populate exam-pattern data
- Add automated tests and continuous integration
- Add password-recovery and account-security flows
- Add practice-test generation
- Evaluate PWA and multilingual support
- Establish preview and production deployment checks

## Contributing

1. Create a focused feature branch.
2. Keep credentials and generated environment files out of commits.
3. Run type checking, linting and a production build.
4. Document database or environment changes.
5. Open a pull request and describe the user-facing and security impact.

## License

Licensed under the [MIT License](./LICENSE).
