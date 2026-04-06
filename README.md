# 🎓 KTU Exam Prep AI

> An AI-powered exam preparation platform for APJ Abdul Kalam Technological University (KTU) students, built with Next.js 16, React 19, and GPT-4o mini.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o_mini-412991?logo=openai)](https://openai.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-blue?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 🚀 What is KTU Exam Prep AI?

KTU Exam Prep AI is a full-stack web application that helps KTU engineering students prepare for semester exams using artificial intelligence. Students can ask syllabus-related questions and receive accurate, exam-oriented answers grounded in actual KTU syllabus content via a Retrieval-Augmented Generation (RAG) pipeline.

### Core Capabilities

- 🤖 **AI Study Assistant** — Ask any academic question and get syllabus-aware answers powered by GPT-4o mini + RAG
- 📚 **Course Browser** — Browse courses organized by semester and department
- 📊 **Exam Patterns** — Analyze question frequency to focus on high-priority topics
- ⏱️ **Active Study Timer** — Automatically tracks study time only when you're actively using the app
- 💬 **Full Chat History** — All conversations saved, searchable, renamable, and deletable
- 🔍 **Semantic Search** — Vector similarity search across embedded syllabus content

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **RAG-Powered AI Chat** | GPT-4o mini with syllabus context injection via pgvector semantic search. Answers structured for KTU exam format (Part A / B / C). |
| **Markdown Rendering** | AI responses rendered with full markdown support — code blocks, tables, bold/italic, GFM extensions |
| **Smart Onboarding** | 4-step wizard: College (130+ KTU colleges) → Department → Semester → Referral source |
| **Active Study Timer** | Tracks time only when tab is active and focused. Pauses on tab switch/blur. Saves atomically via RPC. |
| **Conversation Management** | Create, rename, delete chats. Real-time sidebar updates via custom events + Supabase Realtime. |
| **Profile Management** | Update college, department, semester. View live study time (HH:MM:SS) and questions asked. |
| **Route Protection** | Middleware-based auth guards with onboarding enforcement |
| **Rate Limiting** | Sliding-window rate limits on all API routes via Upstash Redis |
| **Security Headers** | HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| **Responsive Design** | Mobile-first with collapsible sidebar and overlay backdrop |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4 |
| **Backend** | Next.js API Routes (7 endpoints), Supabase (PostgreSQL + Auth + Realtime) |
| **AI / RAG** | OpenAI GPT-4o mini (chat), text-embedding-3-small (embeddings), pgvector (similarity search) |
| **Rate Limiting** | Upstash Redis with sliding-window limiter |
| **Auth** | Supabase Auth (email/password, SSR cookies via `@supabase/ssr`) |
| **Forms** | React Hook Form + Zod v4 validation |
| **UI** | Lucide React icons, React Markdown + remark-gfm |

> See [docs/TECH_STACK.md](./docs/TECH_STACK.md) for detailed rationale.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Client (React 19)                  │
│  Landing Page │ Auth │ Onboarding │ Dashboard (Chat,    │
│               │      │            │ Courses, Patterns,  │
│               │      │            │ Profile)            │
└────────────────────────┬────────────────────────────────┘
                         │ fetch / sendBeacon
┌────────────────────────▼────────────────────────────────┐
│             Next.js API Routes (Server)                 │
│  /api/chat ─── RAG Pipeline ──┐                        │
│  /api/search                  │                        │
│  /api/profile                 ▼                        │
│  /api/courses         ┌──────────────┐                 │
│  /api/patterns        │  OpenAI API  │                 │
│  /api/study-time      │  GPT-4o mini │                 │
│                       │  Embeddings  │                 │
│                       └──────────────┘                 │
└────────────────────────┬────────────────────────────────┘
                         │ Supabase SDK / PostgREST
┌────────────────────────▼────────────────────────────────┐
│              Supabase (PostgreSQL)                       │
│  8 tables with RLS │ pgvector extension                 │
│  match_syllabus() RPC │ increment_study_time() RPC      │
│  IVFFlat index on embeddings                            │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              Upstash Redis                              │
│  Sliding-window rate limiting per user/IP               │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
exam-preparation-platform-using-ai/
├── app/                             # Next.js App Router
│   ├── (auth)/                      # Auth pages (login, signup, verify-email)
│   ├── (dashboard)/                 # Protected pages
│   │   ├── chat/                    #   AI chat interface
│   │   ├── courses/                 #   Course browser
│   │   ├── patterns/                #   Exam pattern analysis
│   │   └── profile/                 #   User profile & stats
│   ├── api/                         # API routes
│   │   ├── chat/                    #   POST — AI chat (RAG pipeline)
│   │   ├── search/                  #   POST — Semantic syllabus search
│   │   ├── courses/                 #   GET  — Course listing
│   │   ├── patterns/                #   GET  — Exam pattern data
│   │   ├── profile/                 #   GET/PUT — User profile
│   │   └── study-time/              #   POST — Study time tracking
│   ├── auth/                        # Auth callback handler
│   ├── onboarding/                  # 4-step onboarding wizard
│   └── page.tsx                     # Landing page
├── components/
│   ├── auth/                        # LoginForm, SignupForm, OTPInput
│   ├── chat/                        # ChatInterface, MessageList, InputBox, Message, TypingIndicator
│   ├── onboarding/                  # CollegeSelector, DepartmentCards, SemesterGrid, ProgressIndicator, ReferralOptions
│   └── sidebar/                     # NavigationLinks, RecentChats, NewChatButton, UserProfile, ChatItem, ChatItemMenu
├── hooks/
│   └── useStudyTimer.ts             # Active study time tracking hook
├── lib/
│   ├── rag/
│   │   ├── search.ts                # Vector search — embeds query, calls match_syllabus RPC
│   │   └── generate.ts              # RAG generation — builds prompt, calls GPT-4o mini
│   ├── supabase/
│   │   ├── client.ts                # Browser Supabase client
│   │   ├── server.ts                # Server Supabase client (+ service role client)
│   │   └── middleware.ts            # Session refresh middleware
│   ├── rate-limit.ts                # Upstash Redis sliding-window rate limiter
│   └── utils.ts                     # cn() utility (clsx + tailwind-merge)
├── types/
│   └── index.ts                     # TypeScript types, KTU colleges list, departments
├── scripts/
│   ├── seed-syllabus.ts             # Seed OOPs syllabus + generate embeddings
│   ├── setup-db.mjs                 # Database setup script
│   └── test-chat-api.ts             # Chat API test script
├── supabase/
│   ├── schema.sql                   # Full DB schema (8 tables, RLS, functions, triggers)
│   └── migrations/
│       └── add_study_time.sql       # Study time RPC migration
├── course_syllabus/                 # Source syllabus documents (DOCX)
├── docs/                            # Project documentation
├── middleware.ts                     # Root middleware (auth + route guards)
└── next.config.ts                   # Security headers configuration
```

---

## 📋 Prerequisites

- **Node.js** 18+ and **npm**
- A **Supabase** project (free tier works)
- An **OpenAI** API key (for GPT-4o mini and text-embedding-3-small)
- An **Upstash Redis** instance (for rate limiting)

---

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/udaySuryaP/exam-preparation-platform-using-ai.git
cd exam-preparation-platform-using-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Fill in the following:

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (keep secret!) |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com/api-keys) |
| `UPSTASH_REDIS_REST_URL` | [console.upstash.com](https://console.upstash.com/) |
| `UPSTASH_REDIS_REST_TOKEN` | [console.upstash.com](https://console.upstash.com/) |
| `NEXT_PUBLIC_APP_URL` | Your app URL (e.g., `http://localhost:3000`) |

### 4. Set Up the Database

Run the schema in the Supabase SQL Editor:

1. Open your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
2. Copy and execute `supabase/schema.sql` — creates all 8 tables, RLS policies, vector search function, and triggers
3. Run `supabase/migrations/add_study_time.sql` — adds the `increment_study_time` RPC

### 5. Seed Syllabus Data

Populate the database with KTU OOPs syllabus content and generate vector embeddings:

```bash
npx tsx scripts/seed-syllabus.ts
```

This seeds:
- 1 course (Object Oriented Programming — PBCST304, S3)
- 4 modules with topic metadata
- 20+ syllabus chunks with OpenAI `text-embedding-3-small` embeddings

### 6. Configure Supabase Auth

In your Supabase dashboard:

1. Go to **Authentication → Providers → Email**
2. Disable "Confirm email" (for development)
3. Set redirect URL to your app URL

### 7. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🤖 RAG Pipeline

The AI chat uses a Retrieval-Augmented Generation pipeline:

```
User Question
     │
     ▼
┌─────────────────────┐
│  Embed query using   │
│  text-embedding-3-   │
│  small (1536-dim)    │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  match_syllabus()    │
│  pgvector cosine     │
│  similarity search   │
│  (IVFFlat index)     │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  Build system prompt │
│  with matched        │
│  syllabus context    │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  GPT-4o mini         │
│  generates answer    │
│  structured for KTU  │
│  exam format         │
│  (Part A/B/C)        │
└─────────────────────┘
```

The system prompt enforces:
- Answers based **only** on provided syllabus content
- Responses structured to match KTU exam answer patterns (Part A: 2-4 sentences, Part B: detailed with code, Part C: comprehensive)
- Module attribution (e.g., "This is covered in Module 2 — Polymorphism and Inheritance")
- Comparison tables in markdown format
- No fabricated content beyond the syllabus

---

## 🗄️ Database Schema

8 PostgreSQL tables with Row Level Security, powered by Supabase:

| Table | Purpose | RLS |
|-------|---------|-----|
| `user_profiles` | User data (name, college, branch, semester, study time) | User-scoped |
| `courses` | KTU courses by semester and department | Public read |
| `modules` | Course modules with topic arrays | Public read |
| `syllabus_embeddings` | 1536-dim vector embeddings for RAG semantic search | Public read |
| `conversations` | Chat threads per user | User-scoped |
| `messages` | Chat messages (user + assistant) with JSONB sources | User-scoped via join |
| `question_patterns` | Exam question frequency analysis | Public read |
| `user_progress` | Per-course progress tracking | User-scoped |

**Database functions:**
- `match_syllabus()` — cosine similarity vector search with configurable threshold and course filtering
- `increment_study_time()` — atomic study time increment via RPC
- `update_updated_at_column()` — auto-update trigger on profiles, conversations, and progress

> See [docs/DATA_MODEL.md](./docs/DATA_MODEL.md) for the full column reference and ER relationships.

---

## 🔌 API Routes

All routes are authenticated (where applicable), input-validated, and rate-limited:

| Route | Method | Auth | Rate Limit | Description |
|-------|--------|------|------------|-------------|
| `/api/chat` | POST | Required | 20/60s per user | RAG-powered AI chat — embeds query, retrieves syllabus context, generates answer |
| `/api/search` | POST | Required | 30/60s per user | Standalone semantic search — returns matching syllabus chunks |
| `/api/profile` | GET | Required | 10/60s per user | Returns user profile + usage stats |
| `/api/profile` | PUT | Required | 10/60s per user | Updates profile fields |
| `/api/courses` | GET | Public | 60/60s per IP | Paginated course listing with semester filter |
| `/api/patterns` | GET | Public | 60/60s per IP | Paginated exam pattern data with course filter |
| `/api/study-time` | POST | Required | 30/60s per user | Atomic study time increment (max 300s per save) |

---

## 🔐 Security

| Measure | Implementation |
|---------|---------------|
| **Authentication** | Supabase Auth with SSR cookies (`@supabase/ssr`), auto-refreshed via middleware |
| **Route Protection** | Next.js middleware guards — redirects unauthenticated users, enforces onboarding |
| **Row Level Security** | All 8 tables have RLS policies — user data scoped to `auth.uid()` |
| **Rate Limiting** | Upstash Redis sliding-window limiter on every API route, graceful fallback in dev |
| **Input Validation** | UUID regex validation, message length limits (5000 chars), Zod schemas on forms |
| **Security Headers** | HSTS (1 year), X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| **XSS Prevention** | React JSX auto-escaping, `react-markdown` does not render raw HTML by default |
| **Service Role Isolation** | `SUPABASE_SERVICE_ROLE_KEY` used only in server-side API routes, never exposed client-side |

---

## 🧪 Scripts

```bash
# Development
npm run dev              # Start dev server (Turbopack)

# Production
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint

# Data Seeding
npx tsx scripts/seed-syllabus.ts     # Seed OOPs syllabus + embeddings
npx tsx scripts/setup-db.mjs         # Database setup
npx tsx scripts/test-chat-api.ts     # Test chat API endpoint
```

---

## 📖 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

| Document | Description |
|----------|-------------|
| [Project Overview](./docs/PROJECT_OVERVIEW.md) | High-level overview, architecture, and project structure |
| [Tech Stack](./docs/TECH_STACK.md) | All technologies, versions, and design decisions |
| [Data Model](./docs/DATA_MODEL.md) | Database tables, columns, relationships, RLS policies, functions |
| [User Flow](./docs/USER_FLOW.md) | Every user journey with navigation paths and system responses |
| [Features](./docs/FEATURES.md) | Complete feature breakdown organized by area |
| [Milestones](./docs/MILESTONES.md) | Build history and development timeline |
| [Progress](./docs/progress.md) | Development progress report |
| [Issues](./docs/issues.md) | Known issues, bugs, and security audit findings |

---

## 🗺️ Future Enhancements

- [ ] More KTU courses and syllabus data (beyond OOPs)
- [ ] Exam pattern data population from historical papers
- [ ] Chat export (PDF / Markdown)
- [ ] Password reset flow
- [ ] Dark mode toggle (currently fixed dark dashboard theme)
- [ ] PWA support with offline caching
- [ ] Practice test generation
- [ ] Multi-language support (Malayalam)
- [ ] Vercel deployment with CI/CD

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">
  Built with ❤️ for KTU students
</p>
