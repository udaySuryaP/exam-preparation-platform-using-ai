# KTU Exam Prep AI — Complete Project Flow

> **Document Version**: 1.0  
> **Last Updated**: April 2026  
> **Scope**: Every file, every connection, every flow — explained in detail for someone who has never seen this codebase.

---

## Table of Contents

- [Part 1: Architecture & Foundation](#part-1-architecture--foundation)
- [Part 2: Authentication & Onboarding](#part-2-authentication--onboarding)
- [Part 3: Dashboard Layout & Sidebar](#part-3-dashboard-layout--sidebar)
- [Part 4: AI Chat System & RAG Pipeline](#part-4-ai-chat-system--rag-pipeline)
- [Part 5: API Routes & Utilities](#part-5-api-routes--utilities)
- [Part 6: Data Seeding, File Map & User Perspective](#part-6-data-seeding-file-map--user-perspective)

---

# Part 1: Architecture & Foundation

## 1.1 What This Project Is

KTU Exam Prep AI is a full-stack web application that helps students of APJ Abdul Kalam Technological University (KTU) prepare for semester exams using AI. Students ask questions from their syllabus, and the app retrieves relevant syllabus content from a vector database and uses OpenAI's GPT-4o mini to generate accurate, exam-oriented answers.

The app is built with:
- **Next.js 16** (App Router) for the full-stack framework
- **React 19** for the UI
- **Supabase** (PostgreSQL + Auth + Realtime) for the database and authentication
- **OpenAI GPT-4o mini** for AI answers
- **pgvector** for semantic similarity search (RAG)
- **Upstash Redis** for API rate limiting
- **Tailwind CSS 4** for styling

---

## 1.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     BROWSER (Client)                            │
│                                                                 │
│  app/page.tsx ──────── Landing Page (public)                    │
│  app/(auth)/ ────────── Login / Signup / Verify Email           │
│  app/onboarding/ ────── 4-Step Onboarding Wizard                │
│  app/(dashboard)/ ───── Chat / Courses / Patterns / Profile     │
│                                                                 │
│  components/auth/    ── LoginForm, SignupForm, OTPInput          │
│  components/chat/    ── ChatInterface, MessageList, InputBox,   │
│                         Message, TypingIndicator                │
│  components/sidebar/ ── NewChatButton, NavigationLinks,         │
│                         RecentChats, ChatItem, ChatItemMenu,    │
│                         UserProfile                             │
│  components/onboarding/ CollegeSelector, DepartmentCards,       │
│                         SemesterGrid, ReferralOptions,          │
│                         ProgressIndicator                       │
│                                                                 │
│  hooks/useStudyTimer ── Active study time tracking              │
│  lib/supabase/client ── Browser-side Supabase SDK               │
└───────────────┬─────────────────────────────────────────────────┘
                │
                │  HTTP requests (fetch / sendBeacon)
                │  Supabase Realtime (WebSocket)
                │
┌───────────────▼─────────────────────────────────────────────────┐
│                   NEXT.JS SERVER (API Routes)                   │
│                                                                 │
│  middleware.ts ─────────── Route protection & session refresh    │
│  lib/supabase/middleware ─ Supabase SSR session management      │
│  lib/supabase/server ──── Server-side Supabase client           │
│  lib/rate-limit.ts ────── Upstash Redis rate limiter            │
│                                                                 │
│  app/api/chat/route.ts ── POST: RAG-powered AI chat             │
│  app/api/search/route.ts  POST: Standalone semantic search      │
│  app/api/profile/route.ts GET/PUT: User profile management      │
│  app/api/courses/route.ts GET: Course listing                   │
│  app/api/patterns/route.ts GET: Exam pattern data               │
│  app/api/study-time/route.ts POST: Study time tracking          │
│  app/auth/callback/route.ts GET: PKCE auth code exchange        │
│                                                                 │
│  lib/rag/search.ts ────── Embed query + pgvector search         │
│  lib/rag/generate.ts ──── Build prompt + call GPT-4o mini       │
└───────────────┬─────────────────────────────────────────────────┘
                │
                │  Supabase SDK / PostgREST / OpenAI API
                │
┌───────────────▼─────────────────────────────────────────────────┐
│               EXTERNAL SERVICES                                 │
│                                                                 │
│  ┌─────────────────────────────────────────┐                    │
│  │  Supabase (PostgreSQL + Auth)           │                    │
│  │  8 tables with Row Level Security       │                    │
│  │  pgvector extension (1536-dim)          │                    │
│  │  match_syllabus() RPC function          │                    │
│  │  increment_study_time() RPC function    │                    │
│  │  IVFFlat index on embeddings            │                    │
│  │  Realtime subscriptions                 │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                 │
│  ┌─────────────────────────────────────────┐                    │
│  │  OpenAI API                             │                    │
│  │  GPT-4o mini (chat completions)         │                    │
│  │  text-embedding-3-small (embeddings)    │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                 │
│  ┌─────────────────────────────────────────┐                    │
│  │  Upstash Redis                          │                    │
│  │  Sliding-window rate limiting           │                    │
│  └─────────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1.3 Complete Project Structure

```
exam-preparation-platform-using-ai/
│
├── app/                                    # Next.js App Router (all pages & API routes)
│   ├── layout.tsx                          # Root layout — loads Inter font, sets metadata
│   ├── page.tsx                            # Landing page (public, marketing)
│   ├── globals.css                         # Global CSS (Tailwind + custom animations)
│   ├── favicon.ico                         # Browser tab icon
│   ├── loading.tsx                         # Root loading spinner
│   ├── error.tsx                           # Root error boundary
│   ├── not-found.tsx                       # 404 page
│   │
│   ├── (auth)/                             # Auth route group (no segment in URL)
│   │   ├── layout.tsx                      # Centered card layout with logo
│   │   ├── loading.tsx                     # Auth-specific loading spinner
│   │   ├── login/page.tsx                  # Login page → renders LoginForm
│   │   ├── signup/page.tsx                 # Signup page → renders SignupForm
│   │   └── verify-email/page.tsx           # Email verification confirmation
│   │
│   ├── auth/                               # Auth utility routes
│   │   └── callback/route.ts               # PKCE code → session exchange
│   │
│   ├── onboarding/                         # 4-step onboarding wizard
│   │   ├── layout.tsx                      # Onboarding layout wrapper
│   │   ├── loading.tsx                     # Onboarding loading state
│   │   ├── step-1/page.tsx                 # College + Graduation Year
│   │   ├── step-2/page.tsx                 # Department selection
│   │   ├── step-3/page.tsx                 # Semester selection
│   │   └── step-4/page.tsx                 # Referral source + final submit
│   │
│   ├── (dashboard)/                        # Dashboard route group (protected)
│   │   ├── layout.tsx                      # Sidebar + main content layout
│   │   ├── loading.tsx                     # Dashboard loading state
│   │   ├── error.tsx                       # Dashboard error boundary
│   │   ├── chat/page.tsx                   # AI chat page → renders ChatInterface
│   │   ├── courses/page.tsx                # Course browser page
│   │   ├── patterns/page.tsx               # Exam patterns page
│   │   └── profile/page.tsx                # User profile page
│   │
│   └── api/                                # API routes (server-side)
│       ├── chat/route.ts                   # POST: AI chat with RAG
│       ├── search/route.ts                 # POST: Semantic syllabus search
│       ├── profile/route.ts                # GET + PUT: Profile management
│       ├── courses/route.ts                # GET: Course listing
│       ├── patterns/route.ts               # GET: Exam pattern data
│       └── study-time/route.ts             # POST: Study time increment
│
├── components/                             # Reusable React components
│   ├── auth/
│   │   ├── LoginForm.tsx                   # Email + password login form
│   │   ├── SignupForm.tsx                  # Email + password + name signup form
│   │   └── OTPInput.tsx                    # OTP verification input
│   ├── chat/
│   │   ├── ChatInterface.tsx               # Main chat controller (state, API calls)
│   │   ├── InputBox.tsx                    # Message input textarea + send button
│   │   ├── MessageList.tsx                 # Scrollable message container
│   │   ├── Message.tsx                     # Individual message bubble (markdown)
│   │   └── TypingIndicator.tsx             # Animated dots while AI responds
│   ├── onboarding/
│   │   ├── CollegeSelector.tsx             # Searchable dropdown (130+ colleges)
│   │   ├── DepartmentCards.tsx             # Visual department selection cards
│   │   ├── SemesterGrid.tsx                # Semester 1-8 grid buttons
│   │   ├── ReferralOptions.tsx             # How-did-you-find-us options
│   │   └── ProgressIndicator.tsx           # Step progress dots (1-4)
│   └── sidebar/
│       ├── NewChatButton.tsx               # "New Chat" button → navigates to /chat
│       ├── NavigationLinks.tsx             # Patterns + Courses nav links
│       ├── RecentChats.tsx                 # Chat history list (real-time)
│       ├── ChatItem.tsx                    # Single chat entry (click, rename, delete)
│       ├── ChatItemMenu.tsx                # Three-dot menu (rename/delete)
│       └── UserProfile.tsx                 # User avatar + name + sign-out menu
│
├── hooks/
│   └── useStudyTimer.ts                    # Active study time tracking hook
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       # Browser-side Supabase client
│   │   ├── server.ts                       # Server-side Supabase client + service client
│   │   └── middleware.ts                   # Session refresh + route protection logic
│   ├── rag/
│   │   ├── search.ts                       # Embed query → pgvector similarity search
│   │   └── generate.ts                     # Build system prompt → call GPT-4o mini
│   ├── rate-limit.ts                       # Upstash Redis sliding-window rate limiter
│   └── utils.ts                            # cn(), getInitials(), truncate(), formatDate()
│
├── types/
│   └── index.ts                            # All TypeScript interfaces + KTU_COLLEGES + DEPARTMENTS
│
├── scripts/
│   ├── seed-syllabus.ts                    # Seed OOPs syllabus + generate embeddings
│   ├── setup-db.mjs                        # Database setup helper
│   ├── get-course-id.ts                    # Fetch course UUID from database
│   └── test-chat-api.ts                    # Test chat API endpoint
│
├── supabase/
│   ├── schema.sql                          # Full database schema (8 tables, RLS, functions)
│   └── migrations/
│       └── add_study_time.sql              # increment_study_time() RPC function
│
├── course_syllabus/                        # Source syllabus documents
│   ├── OOPS Module 1.docx
│   ├── OOPS Module 2.docx
│   ├── OOPS Module 3.docx
│   └── OOPS Module 4.docx
│
├── docs/                                   # Project documentation
├── middleware.ts                            # Root middleware entry point
├── next.config.ts                          # Security headers configuration
├── package.json                            # Dependencies and scripts
├── tsconfig.json                           # TypeScript configuration
├── postcss.config.mjs                      # PostCSS + Tailwind
├── eslint.config.mjs                       # ESLint configuration
├── .env.example                            # Environment variable template
├── .env.local                              # Actual environment variables (gitignored)
├── .gitignore                              # Git ignore rules
└── LICENSE                                 # MIT License
```

---

## 1.4 Configuration Files

### 1.4.1 Root Layout — `app/layout.tsx`

This is the very first file Next.js renders. Every single page in the app is wrapped by this layout. It loads the **Inter** font from Google Fonts and sets global SEO metadata.

```typescript
// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KTU Exam Prep AI — Ace Your KTU Exams with AI",
  description:
    "AI-powered exam preparation platform for APJ Abdul Kalam Technological University students.",
  keywords: ["KTU", "exam prep", "AI", "study", "APJ Abdul Kalam Technological University"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

**What it does:**
- Sets `<html lang="en">` for accessibility
- Loads Inter font and sets it as a CSS variable `--font-inter`
- Imports `globals.css` which contains Tailwind directives and custom animations
- Sets `<title>` and `<meta description>` for SEO
- Wraps all child pages in the `<body>` tag

**Connected to:** Every single page in the application inherits this layout.

---

### 1.4.2 Environment Variables — `.env.example`

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# Upstash Redis (rate limiting — required for production)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Who uses each variable:**

| Variable | Used By | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, `lib/rag/search.ts`, `app/api/study-time/route.ts`, `app/auth/callback/route.ts` | Supabase project base URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, `app/api/study-time/route.ts`, `app/auth/callback/route.ts` | Supabase anonymous (public) API key |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase/server.ts` → `createServiceClient()`, `lib/rag/search.ts` | Supabase service role key (admin access, bypasses RLS) |
| `OPENAI_API_KEY` | `lib/rag/search.ts`, `lib/rag/generate.ts`, `scripts/seed-syllabus.ts` | OpenAI API key for GPT-4o mini and embeddings |
| `UPSTASH_REDIS_REST_URL` | `lib/rate-limit.ts` | Upstash Redis REST endpoint for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | `lib/rate-limit.ts` | Upstash Redis authentication token |
| `NEXT_PUBLIC_APP_URL` | Landing page and auth redirects | The app's public URL |

> **Important**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Variables without this prefix are server-only and never sent to the client.

---

### 1.4.3 Security Headers — `next.config.ts`

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**What each header does:**

| Header | Purpose |
|--------|---------|
| `X-Frame-Options: DENY` | Prevents the app from being embedded in an `<iframe>` (clickjacking protection) |
| `X-Content-Type-Options: nosniff` | Prevents browsers from MIME-sniffing responses |
| `Referrer-Policy` | Controls how much referrer info is sent with requests |
| `X-DNS-Prefetch-Control: on` | Enables DNS prefetching for faster navigation |
| `Strict-Transport-Security` | Forces HTTPS for 1 year (HSTS) |
| `Permissions-Policy` | Blocks camera, microphone, and geolocation access |

**Connected to:** Applied to every HTTP response from the application.

---

### 1.4.4 Root Middleware — `middleware.ts`

This is the entry point for Next.js middleware. It runs on **every request** before the page or API route handler executes.

```typescript
// middleware.ts (project root)
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
    return await updateSession(request);
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
```

**What it does:**
1. The `matcher` regex ensures middleware runs on all routes EXCEPT static files (images, CSS, JS bundles)
2. Delegates ALL logic to `updateSession()` in `lib/supabase/middleware.ts`
3. `updateSession()` handles: session refresh, auth redirects, onboarding enforcement

**Connected to:** `lib/supabase/middleware.ts` (the actual logic lives there — see Section 1.5.3)

---

## 1.5 Supabase Layer

The Supabase layer consists of 4 critical pieces:
1. **Database Schema** (`supabase/schema.sql`) — 8 tables, RLS policies, functions
2. **Browser Client** (`lib/supabase/client.ts`) — used in React components
3. **Server Client** (`lib/supabase/server.ts`) — used in API routes
4. **Middleware Client** (`lib/supabase/middleware.ts`) — used for session management

### 1.5.1 Database Schema — `supabase/schema.sql`

The entire database is defined in this single SQL file. It creates 8 tables, enables pgvector, defines RLS policies, and creates utility functions.

#### Enabled Extensions

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

This enables the `pgvector` extension which allows storing and querying 1536-dimensional vector embeddings for semantic similarity search.

#### Table: `user_profiles`

```sql
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  college_name TEXT DEFAULT '',
  graduation_year INTEGER DEFAULT 2025,
  branch TEXT DEFAULT '',
  semester INTEGER DEFAULT 1,
  referral_source TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  study_time_minutes FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

- **Primary key** is the same UUID as `auth.users.id` (1:1 relationship)
- `onboarding_completed` is the gate that middleware checks — if `false`, user is redirected to `/onboarding/step-1`
- `study_time_minutes` is a FLOAT storing accumulated study time (fractional minutes for precision)
- **Written by:** Onboarding Step 4, `/api/profile` PUT, `/api/study-time` POST (via RPC)
- **Read by:** Middleware (onboarding check), `/api/profile` GET, `UserProfile` sidebar component

#### Table: `courses`

```sql
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code TEXT NOT NULL UNIQUE,
  course_name TEXT NOT NULL,
  semester INTEGER NOT NULL,
  credits INTEGER DEFAULT 3,
  department TEXT DEFAULT '',
  description TEXT,
  module_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- Stores KTU course metadata (e.g., "PBCST304 — Object Oriented Programming")
- **Written by:** `scripts/seed-syllabus.ts`
- **Read by:** `/api/courses` GET, Courses page

#### Table: `modules`

```sql
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  topics TEXT[] DEFAULT '{}',
  hours INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- Each course has multiple modules (e.g., Module 1: Introduction to Java)
- `topics` is a PostgreSQL text array listing topic names
- **Written by:** `scripts/seed-syllabus.ts`

#### Table: `syllabus_embeddings`

```sql
CREATE TABLE IF NOT EXISTS syllabus_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS syllabus_embeddings_embedding_idx
  ON syllabus_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

- This is the heart of the RAG system
- `content` stores the actual syllabus text chunk
- `embedding` stores a 1536-dimensional vector from OpenAI's `text-embedding-3-small` model
- `metadata` stores JSONB with `module_number`, `topic`, `course_code`, `course_name`
- The **IVFFlat index** enables fast approximate nearest-neighbor search using cosine distance
- **Written by:** `scripts/seed-syllabus.ts`
- **Read by:** `match_syllabus()` RPC function (called from `lib/rag/search.ts`)

#### Table: `conversations`

```sql
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

- Each user can have multiple chat conversations
- `title` is auto-set from the first message (first 50 characters)
- **Written by:** `/api/chat` POST (auto-creates on first message)
- **Read by:** `RecentChats` sidebar component, `ChatInterface`

#### Table: `messages`

```sql
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- Stores both user messages and AI responses
- `role` is either `'user'` or `'assistant'`
- `sources` stores JSONB array of RAG source references (course_code, module, topic, similarity score)
- **Written by:** `/api/chat` POST (inserts both user message and AI response)
- **Read by:** `ChatInterface` (loads history via Supabase SDK)

#### Table: `question_patterns`

```sql
CREATE TABLE IF NOT EXISTS question_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  part_a_frequency INTEGER DEFAULT 0,
  part_b_frequency INTEGER DEFAULT 0,
  part_c_frequency INTEGER DEFAULT 0,
  total_frequency INTEGER DEFAULT 0,
  priority TEXT CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')) DEFAULT 'LOW',
  years_appeared TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- Stores exam question frequency analysis data
- **Read by:** `/api/patterns` GET, Patterns page

#### Table: `user_progress`

```sql
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  questions_asked INTEGER DEFAULT 0,
  study_time_minutes INTEGER DEFAULT 0,
  last_studied TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);
```

- Per-course progress tracking per user
- **Read by:** `/api/profile` GET (to find top subject)

#### Vector Search Function — `match_syllabus()`

```sql
CREATE OR REPLACE FUNCTION match_syllabus(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_course_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    se.id,
    se.content,
    1 - (se.embedding <=> query_embedding) AS similarity,
    se.metadata
  FROM syllabus_embeddings se
  WHERE
    (filter_course_id IS NULL OR se.course_id = filter_course_id)
    AND 1 - (se.embedding <=> query_embedding) > match_threshold
  ORDER BY se.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

**How it works:**
1. Receives a 1536-dim query vector (the embedded user question)
2. Uses the `<=>` operator (cosine distance) to compare against all stored embeddings
3. Converts distance to similarity: `1 - distance`
4. Filters results by `match_threshold` (default 0.7 = 70% similarity)
5. Optionally filters by `course_id`
6. Returns top `match_count` results ordered by similarity

**Called by:** `lib/rag/search.ts` → `searchSyllabus()` function via PostgREST RPC

#### Study Time Function — `increment_study_time()`

Defined in `supabase/migrations/add_study_time.sql`:

```sql
CREATE OR REPLACE FUNCTION increment_study_time(user_uuid UUID, minutes_to_add FLOAT)
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles
  SET study_time_minutes = study_time_minutes + minutes_to_add
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

- Atomically increments `study_time_minutes` — no read-modify-write race condition
- `SECURITY DEFINER` means it runs with the function creator's permissions, not the caller's
- **Called by:** `/api/study-time` POST route via `supabase.rpc("increment_study_time", ...)`

#### Row Level Security (RLS)

Every table has RLS enabled. The policies ensure:

| Table | Policy |
|-------|--------|
| `user_profiles` | Users can SELECT, INSERT, UPDATE only their own row (`auth.uid() = id`) |
| `courses` | Public SELECT (anyone can read) |
| `modules` | Public SELECT |
| `syllabus_embeddings` | Public SELECT (needed for search) |
| `question_patterns` | Public SELECT |
| `conversations` | Users can SELECT, INSERT, UPDATE, DELETE only their own (`auth.uid() = user_id`) |
| `messages` | Users can SELECT, INSERT, DELETE messages in their own conversations (via JOIN to conversations) |
| `user_progress` | Users can SELECT, INSERT, UPDATE only their own (`auth.uid() = user_id`) |

#### Auto-Update Triggers

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

Automatically sets `updated_at = NOW()` whenever a row is updated in these tables.

---

### 1.5.2 Browser Supabase Client — `lib/supabase/client.ts`

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error("❌ Supabase env vars missing", {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseAnonKey,
        });
        throw new Error("Supabase environment variables are missing");
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
```

**What it does:**
- Creates a Supabase client for use in **browser-side React components** (files with `"use client"` directive)
- Uses `@supabase/ssr`'s `createBrowserClient` which automatically manages auth cookies in the browser
- Uses the **anon key** (public, RLS-enforced) — not the service role key

**Used by (client components):**
- `components/auth/LoginForm.tsx` — `supabase.auth.signInWithPassword()`
- `components/auth/SignupForm.tsx` — `supabase.auth.signUp()`
- `components/sidebar/RecentChats.tsx` — fetch conversations from database
- `components/sidebar/UserProfile.tsx` — fetch user profile, sign out
- `components/chat/ChatInterface.tsx` — load message history
- `app/onboarding/step-4/page.tsx` — upsert user profile on completion

---

### 1.5.3 Server Supabase Client — `lib/supabase/server.ts`

```typescript
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Ignored in Server Components (middleware handles refresh)
                    }
                },
            },
        }
    );
}

export async function createServiceClient() {
    const { createClient } = await import("@supabase/supabase-js");
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}
```

**Two functions exported:**

1. **`createClient()`** — Server-side Supabase client using the **anon key**
   - Reads auth cookies from the incoming request via `next/headers`'s `cookies()`
   - The user's session is derived from these cookies
   - Respects RLS policies (user can only see their own data)
   - **Used by:** Every API route (`/api/chat`, `/api/profile`, `/api/courses`, `/api/patterns`, `/api/study-time`, `/api/search`)

2. **`createServiceClient()`** — Supabase client using the **service role key**
   - Bypasses ALL RLS policies (admin-level access)
   - Only used server-side, never exposed to the client
   - **Used by:** `/api/profile` PUT (to update Supabase Auth user metadata via `admin.updateUserById`), `lib/rag/search.ts` (to call `match_syllabus` RPC)

---

### 1.5.4 Middleware Supabase Client — `lib/supabase/middleware.ts`

This is the most complex and critical file in the Supabase layer. It handles session management AND route protection in a single pass.

```typescript
// lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const pathname = request.nextUrl.pathname;

    // --- Route definitions ---
    const exactPublicRoutes = ["/", "/login", "/signup", "/verify-email"];
    const prefixPublicRoutes = ["/auth/callback"];
    const publicApiRoutes = ["/api/courses", "/api/patterns"];
    const dashboardRoutes = ["/chat", "/courses", "/patterns", "/profile"];

    const isPublicRoute = exactPublicRoutes.includes(pathname) ||
        prefixPublicRoutes.some((route) => pathname.startsWith(route)) ||
        publicApiRoutes.some((route) => pathname === route);

    const isOnboardingRoute = pathname.startsWith("/onboarding");
    const isDashboardRoute = dashboardRoutes.some((r) => pathname.startsWith(r));

    // --- Rule 1: Unauthenticated → redirect to /login ---
    if (!user && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // --- Rule 2: Authenticated on auth pages → redirect to /chat ---
    if (user && (pathname === "/login" || pathname === "/signup")) {
        return NextResponse.redirect(new URL("/chat", request.url));
    }

    // --- Rule 3: Authenticated dashboard → check onboarding ---
    if (user && isDashboardRoute) {
        const { data: profile } = await supabase
            .from("user_profiles")
            .select("onboarding_completed")
            .eq("id", user.id)
            .single();

        if (!profile?.onboarding_completed) {
            return NextResponse.redirect(new URL("/onboarding/step-1", request.url));
        }
    }

    // --- Rule 4: Completed onboarding → bounce away from /onboarding ---
    if (user && isOnboardingRoute) {
        const { data: profile } = await supabase
            .from("user_profiles")
            .select("onboarding_completed")
            .eq("id", user.id)
            .single();

        if (profile?.onboarding_completed) {
            return NextResponse.redirect(new URL("/chat", request.url));
        }
    }

    return supabaseResponse;
}
```

**The 4 routing rules in order:**

```
Request comes in
    │
    ▼
Is user authenticated? ──NO──→ Is route public? ──YES──→ Allow
    │                                              │
    │                                              NO
    │                                              │
    │                                              ▼
    │                                         Redirect → /login
    │
    YES
    │
    ▼
Is user on /login or /signup? ──YES──→ Redirect → /chat
    │
    NO
    │
    ▼
Is user on dashboard route? ──YES──→ Is onboarding complete? ──NO──→ Redirect → /onboarding/step-1
    │                                                            │
    │                                                           YES
    │                                                            │
    │                                                            ▼
    │                                                          Allow
    │
    ▼
Is user on /onboarding? ──YES──→ Is onboarding complete? ──YES──→ Redirect → /chat
    │                                                        │
    │                                                        NO
    │                                                        │
    │                                                        ▼
    │                                                      Allow
    │
    ▼
Allow (default)
```

**Connected to:** Called by `middleware.ts` (root) on every non-static request.

---

### 1.5.5 Rate Limiter — `lib/rate-limit.ts`

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitConfig {
    maxRequests: number;
    windowSeconds: number;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
}

let redis: Redis | null = null;
function getRedis(): Redis | null {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return null;
    }
    if (!redis) {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    }
    return redis;
}

const limiterCache = new Map<string, Ratelimit>();

function getLimiter(config: RateLimitConfig): Ratelimit | null {
    const r = getRedis();
    if (!r) return null;

    const cacheKey = `${config.maxRequests}:${config.windowSeconds}`;
    if (!limiterCache.has(cacheKey)) {
        limiterCache.set(cacheKey, new Ratelimit({
            redis: r,
            limiter: Ratelimit.slidingWindow(config.maxRequests, `${config.windowSeconds} s`),
            analytics: false,
        }));
    }
    return limiterCache.get(cacheKey)!;
}

export async function checkRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const limiter = getLimiter(config);

    if (!limiter) {
        console.warn("[RateLimit] Upstash Redis not configured — rate limiting is disabled.");
        return { allowed: true, remaining: config.maxRequests, resetAt: Date.now() + config.windowSeconds * 1000 };
    }

    try {
        const result = await limiter.limit(key);
        return { allowed: result.success, remaining: result.remaining, resetAt: result.reset };
    } catch (err) {
        console.warn("[RateLimit] Upstash error, allowing request:", err instanceof Error ? err.message : err);
        return { allowed: true, remaining: config.maxRequests, resetAt: Date.now() + config.windowSeconds * 1000 };
    }
}
```

**How it works:**
1. **Lazy initialization**: Redis client is only created when first needed (not at import time)
2. **Limiter caching**: Limiters with the same config are cached in a `Map` to avoid recreation
3. **Sliding window**: Uses Upstash's sliding window algorithm — more accurate than fixed windows
4. **Graceful degradation**: If Redis is not configured or unreachable, ALL requests are allowed (with a console warning)
5. The `key` parameter uniquely identifies who is being rate-limited (e.g., `chat:user-uuid` or `courses:ip-address`)

**Rate limits per route:**

| Route | Key | Limit |
|-------|-----|-------|
| `/api/chat` | `chat:{userId}` | 20 req / 60s |
| `/api/search` | `search:{userId}` | 30 req / 60s |
| `/api/profile` GET | `profile-read:{userId}` | 30 req / 60s |
| `/api/profile` PUT | `profile:{userId}` | 10 req / 60s |
| `/api/courses` | `courses:{ip}` | 60 req / 60s |
| `/api/patterns` | `patterns:{ip}` | 60 req / 60s |
| `/api/study-time` | `study-time:{userId}` | 30 req / 60s |

**Connected to:** Every API route in `app/api/` calls `checkRateLimit()` before processing.

---

*End of Part 1.*

---

# Part 2: Authentication & Onboarding

## 2.1 Authentication System Overview

The authentication system uses **Supabase Auth** with email/password credentials. The flow spans across multiple files:

```
User visits /signup or /login
        │
        ▼
┌───────────────────────────┐
│  app/(auth)/layout.tsx     │  ← Centered card layout with logo
│  app/(auth)/signup/page.tsx│  ← Renders <SignupForm />
│  app/(auth)/login/page.tsx │  ← Renders <LoginForm />
└──────────┬────────────────┘
           │  Supabase SDK calls
           ▼
┌───────────────────────────┐
│  lib/supabase/client.ts    │  ← createBrowserClient()
│  Supabase Auth API         │  ← signUp() or signInWithPassword()
└──────────┬────────────────┘
           │  On success
           ▼
┌───────────────────────────┐
│  If signup → /onboarding/step-1
│  If login → /chat (middleware checks onboarding)
└──────────┬────────────────┘
           │  If email verification enabled
           ▼
┌───────────────────────────┐
│  User clicks email link    │
│  → /auth/callback?code=XXX │
│  → app/auth/callback/route.ts exchanges code for session
│  → Redirects to /onboarding or /chat
└───────────────────────────┘
```

---

### 2.1.1 Auth Layout — `app/(auth)/layout.tsx`

The `(auth)` folder is a Next.js **route group** — the parentheses mean it doesn't create a URL segment. So `/login` is the URL, not `/auth/login`.

```typescript
// app/(auth)/layout.tsx
import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 
                        flex items-center justify-center p-4">
            <div className="absolute top-6 left-6">
                <a href="/" className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-gray-900">KTU Exam Prep AI</span>
                </a>
            </div>
            {children}
        </div>
    );
}
```

**What it does:**
- Sets a full-screen gradient background (`from-indigo-50 via-white to-blue-50`)
- Centers the child content (login/signup form) both vertically and horizontally
- Places the app logo in the top-left corner linking back to the landing page
- This layout is **shared** by `/login`, `/signup`, and `/verify-email`

**Connected to:**
- `app/(auth)/login/page.tsx` → renders `<LoginForm />`
- `app/(auth)/signup/page.tsx` → renders `<SignupForm />`
- `app/(auth)/verify-email/page.tsx` → email verification message
- `app/(auth)/loading.tsx` → loading spinner while pages load

---

### 2.1.2 Auth Loading State — `app/(auth)/loading.tsx`

```typescript
// app/(auth)/loading.tsx
"use client";

import { Loader2 } from "lucide-react";

export default function AuthLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center 
                        bg-gradient-to-br from-indigo-50 via-white to-blue-50">
            <div className="flex flex-col items-center gap-4 animate-fade-in">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 
                               rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading...</p>
            </div>
        </div>
    );
}
```

**What it does:** Next.js automatically shows this component while the login or signup page is loading (code splitting / lazy loading).

---

### 2.1.3 Login Form — `components/auth/LoginForm.tsx`

This is a **client component** (`"use client"`) that handles email/password login with form validation.

```typescript
// components/auth/LoginForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ---- Validation Schema ----
const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const {
        register, handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setError("");
        const supabase = createClient();

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (signInError) {
                // Categorize errors for user-friendly messages
                if (signInError.message.toLowerCase().includes("fetch") ||
                    signInError.message.toLowerCase().includes("network")) {
                    setError("Unable to connect to the server. Please check your internet connection.");
                } else {
                    setError("Invalid email or password. Please try again.");
                }
                return;
            }

            router.push("/chat");
            router.refresh();
        } catch {
            setError("Unable to connect to the server. Please check your internet connection.");
        }
    };

    // ... renders form with email input, password input (toggle visibility), submit button
    // ... includes link to /signup at the bottom
}
```

**Step-by-step flow:**

1. User fills in email and password
2. **Zod validation** runs on submit (`zodResolver(loginSchema)`) — validates email format and non-empty password
3. If validation fails, inline error messages appear under the inputs (via `errors.email.message` / `errors.password.message`)
4. If validation passes, `onSubmit` fires:
   - Creates browser Supabase client via `createClient()` from `lib/supabase/client.ts`
   - Calls `supabase.auth.signInWithPassword({ email, password })`
   - Supabase verifies credentials against `auth.users` table
   - On success: Supabase sets auth cookies automatically → `router.push("/chat")` → `router.refresh()` forces middleware to re-run with new session
   - On failure: Error message displayed (network errors vs. invalid credentials are handled separately)
5. **Middleware takes over**: When the browser navigates to `/chat`, middleware intercepts the request, finds the user is now authenticated, checks `onboarding_completed`, and allows or redirects as needed

**Connected to:**
- `lib/supabase/client.ts` → `createClient()` for Supabase SDK
- `lib/supabase/middleware.ts` → Rule 2 prevents authenticated users from visiting login page again
- `app/(auth)/layout.tsx` → visual wrapper

**Dependencies:**
- `react-hook-form` → form state management
- `@hookform/resolvers/zod` → connects Zod schemas to React Hook Form
- `zod` → schema-based validation
- `lucide-react` → icons (Eye, EyeOff, LogIn, Loader2)

---

### 2.1.4 Signup Form — `components/auth/SignupForm.tsx`

The signup form is more complex than login — it has 4 fields, password strength indicator, and creates an initial `user_profiles` row.

```typescript
// components/auth/SignupForm.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

// ---- Validation Schema ----
const signupSchema = z
    .object({
        fullName: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

// ---- Password Strength Calculator ----
function getPasswordStrength(password: string) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { label: "Weak", color: "bg-red-500", percent: 33 };
    if (score <= 3) return { label: "Medium", color: "bg-yellow-500", percent: 66 };
    return { label: "Strong", color: "bg-green-500", percent: 100 };
}

export function SignupForm() {
    // ...
    const onSubmit = async (data: SignupFormData) => {
        setError("");
        const supabase = createClient();

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: { full_name: data.fullName },  // Stored in auth.users.user_metadata
            },
        });

        if (signUpError) {
            // Handle: rate limit, network error, already registered
            return;
        }

        // With email confirm disabled, session is immediate
        if (signUpData.user) {
            // Create initial user_profiles row
            await supabase.from("user_profiles").upsert({
                id: signUpData.user.id,
                full_name: data.fullName,
                email: data.email,
                onboarding_completed: false,  // ← This is KEY — middleware will enforce onboarding
            });

            router.push("/onboarding/step-1");
            router.refresh();
        }
    };
}
```

**Step-by-step flow:**

1. User fills in Full Name, Email, Password, Confirm Password
2. **Password strength indicator** updates in real-time as user types (via `watch("password")` + `useMemo`)
   - Scoring: length ≥8 (+1), length ≥12 (+1), mixed case (+1), digit (+1), special char (+1)
   - Visual: colored progress bar (red, yellow, green) with label
3. **Zod validation** includes a `.refine()` that checks password === confirmPassword
4. On submit:
   - Calls `supabase.auth.signUp()` → Creates entry in Supabase's `auth.users` table
   - The `full_name` is stored in `user_metadata` on the auth user (used later for display)
   - After successful signup, creates a `user_profiles` row with `onboarding_completed: false`
   - Navigates to `/onboarding/step-1`
5. **Error handling** categorizes errors:
   - Rate limit → "Too many sign-up attempts"
   - Network error → "Unable to connect"
   - Already registered → "Try signing in instead"

**What gets created in the database:**

| Table | Row Created |
|-------|-------------|
| `auth.users` | `id` (UUID), `email`, `user_metadata: { full_name }` |
| `user_profiles` | `id` (same UUID), `full_name`, `email`, `onboarding_completed: false` |

**Connected to:**
- `lib/supabase/client.ts` → browser Supabase client
- `supabase/schema.sql` → `user_profiles` table
- `app/onboarding/step-1/page.tsx` → next destination after signup

---

### 2.1.5 Auth Callback — `app/auth/callback/route.ts`

This is a **server-side API route** (GET handler) that processes Supabase's PKCE authentication flow. When email verification is enabled, Supabase sends the user an email with a link that redirects here.

```typescript
// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const nextParam = searchParams.get("next") ?? "/chat";

    // Prevent open redirect: only allow relative paths
    const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/chat";

    if (!code) {
        return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
    }

    // Create Supabase client with cookie access
    const cookieStore = await cookies();
    const supabase = createServerClient(/* ... cookie config ... */);

    // Exchange the temporary code for a real session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        return NextResponse.redirect(
            new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
        );
    }

    // Check if user has completed onboarding
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
        .from("user_profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

    if (!profile?.onboarding_completed) {
        return NextResponse.redirect(new URL("/onboarding/step-1", request.url));
    }

    return NextResponse.redirect(new URL(next, request.url));
}
```

**Step-by-step flow:**

1. User clicks the verification link in their email
2. Supabase redirects to `https://your-app.com/auth/callback?code=XXXX`
3. This route handler extracts the `code` query parameter
4. **Open redirect prevention**: The `next` parameter is validated to ensure it's a relative path (not `//evil.com`)
5. Calls `supabase.auth.exchangeCodeForSession(code)` — this is the PKCE exchange
6. If exchange fails → redirects to `/login?error=...`
7. If exchange succeeds → checks `user_profiles.onboarding_completed`:
   - `false` → redirects to `/onboarding/step-1`
   - `true` → redirects to `/chat` (or the `next` param)

**Connected to:**
- Supabase Auth email templates (the verification email contains a link to this route)
- `lib/supabase/middleware.ts` → after this route establishes a session, middleware can find the user on subsequent requests

---

## 2.2 Onboarding System

The onboarding wizard is a 4-step flow that **must be completed before accessing the dashboard**. This is enforced by the middleware (Section 1.5.4, Rule 3).

### 2.2.1 Data Flow Overview

```
Step 1 → localStorage: { college, graduationYear }
Step 2 → localStorage: { college, graduationYear, department }
Step 3 → localStorage: { college, graduationYear, department, semester }
Step 4 → Reads localStorage → Writes to Supabase user_profiles → Clears localStorage → /chat
```

The key design decision here is that **Steps 1-3 store data in `localStorage` only** — no database writes happen until Step 4. This means:
- Users can navigate back and forth between steps without hitting the database
- Partially completed onboarding costs zero database operations
- All data is submitted atomically in one `upsert` on Step 4

---

### 2.2.2 Onboarding Layout — `app/onboarding/layout.tsx`

```typescript
// app/onboarding/layout.tsx
import { GraduationCap } from "lucide-react";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 
                        flex items-center justify-center p-4">
            <div className="absolute top-6 left-6">
                <a href="/" className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-gray-900">KTU Exam Prep AI</span>
                </a>
            </div>
            <div className="w-full max-w-lg animate-slide-up-fade">
                {children}
            </div>
        </div>
    );
}
```

**What it does:**
- Identical visual style to the auth layout (same gradient, logo positioning)
- Constrains children to `max-w-lg` (512px) and centers them
- Applies a slide-up-fade animation on page transitions

**Connected to:** All 4 step pages inherit this layout.

---

### 2.2.3 Step 1: College Selection — `app/onboarding/step-1/page.tsx`

```typescript
// app/onboarding/step-1/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ProgressIndicator } from "@/components/onboarding/ProgressIndicator";
import { CollegeSelector } from "@/components/onboarding/CollegeSelector";

export default function Step1Page() {
    const router = useRouter();
    const [college, setCollege] = useState("");
    const [graduationYear, setGraduationYear] = useState("");

    const canProceed = college !== "" && graduationYear !== "";

    const handleNext = () => {
        localStorage.setItem(
            "onboarding",
            JSON.stringify({ college, graduationYear })
        );
        router.push("/onboarding/step-2");
    };

    // Renders:
    // - ProgressIndicator (dot 1 of 4 is active)
    // - CollegeSelector (searchable dropdown with 130+ KTU colleges)
    // - Graduation Year dropdown (2024-2030)
    // - "Next" button (disabled until both fields are filled)
}
```

**User interaction:**
1. User sees "Tell us about yourself" heading
2. `<CollegeSelector />` renders a searchable dropdown with **130+ KTU-affiliated colleges** (list from `types/index.ts` → `KTU_COLLEGES` array). User types to filter and select their college.
3. Graduation Year dropdown offers 2024-2030
4. Both must be selected before "Next" button activates
5. On click: saves `{ college, graduationYear }` to `localStorage` key `"onboarding"`, navigates to Step 2

**Connected to:**
- `components/onboarding/CollegeSelector.tsx` → searchable dropdown component
- `components/onboarding/ProgressIndicator.tsx` → shows 4 dots, dot 1 highlighted
- `types/index.ts` → `KTU_COLLEGES` array (130+ colleges)

---

### 2.2.4 Step 2: Department Selection — `app/onboarding/step-2/page.tsx`

```typescript
// app/onboarding/step-2/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProgressIndicator } from "@/components/onboarding/ProgressIndicator";
import { DepartmentCards } from "@/components/onboarding/DepartmentCards";

export default function Step2Page() {
    const router = useRouter();
    const [department, setDepartment] = useState("");

    const handleNext = () => {
        const existing = JSON.parse(localStorage.getItem("onboarding") || "{}");
        localStorage.setItem(
            "onboarding",
            JSON.stringify({ ...existing, department })
        );
        router.push("/onboarding/step-3");
    };

    // Renders: ProgressIndicator, DepartmentCards, Back + Next buttons
}
```

**User interaction:**
1. User sees "Select Your Department" heading
2. `<DepartmentCards />` renders 5 visual cards from `DEPARTMENTS` constant in `types/index.ts`:
   - ⚙️ Computer Science & Engineering (CSE)
   - 🏗️ Civil Engineering (CE)
   - 🔧 Mechanical Engineering (ME)
   - ⚡ Electrical & Electronics Engineering (EEE)
   - 📡 Electronics & Communication Engineering (ECE)
3. User clicks one → card highlights with indigo border
4. On "Next": merges `{ department }` into existing localStorage data, navigates to Step 3
5. "Back" button returns to Step 1

**Connected to:**
- `components/onboarding/DepartmentCards.tsx` → card-based selection UI
- `types/index.ts` → `DEPARTMENTS` array with id, name, shortName, icon

---

### 2.2.5 Step 3: Semester Selection — `app/onboarding/step-3/page.tsx`

```typescript
// app/onboarding/step-3/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProgressIndicator } from "@/components/onboarding/ProgressIndicator";
import { SemesterGrid } from "@/components/onboarding/SemesterGrid";

export default function Step3Page() {
    const router = useRouter();
    const [semester, setSemester] = useState(0);

    const handleNext = () => {
        const existing = JSON.parse(localStorage.getItem("onboarding") || "{}");
        localStorage.setItem(
            "onboarding",
            JSON.stringify({ ...existing, semester })
        );
        router.push("/onboarding/step-4");
    };

    // Renders: ProgressIndicator, SemesterGrid (1-8), Back + Next buttons
}
```

**User interaction:**
1. User sees "Current Semester" heading
2. `<SemesterGrid />` renders 8 buttons in a grid (Semester 1 through 8)
3. User clicks one → button highlights
4. On "Next": merges `{ semester }` into localStorage, navigates to Step 4

**Connected to:**
- `components/onboarding/SemesterGrid.tsx` → 4x2 grid of semester buttons

---

### 2.2.6 Step 4: Referral & Final Submit — `app/onboarding/step-4/page.tsx`

This is the most important step — it's the only one that writes to the database.

```typescript
// app/onboarding/step-4/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { ProgressIndicator } from "@/components/onboarding/ProgressIndicator";
import { ReferralOptions } from "@/components/onboarding/ReferralOptions";
import { createClient } from "@/lib/supabase/client";

export default function Step4Page() {
    const router = useRouter();
    const [referral, setReferral] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleComplete = async () => {
        setIsSubmitting(true);

        // 1. Read all data from localStorage
        let existing: Record<string, unknown> = {};
        try {
            existing = JSON.parse(localStorage.getItem("onboarding") || "{}");
        } catch {
            existing = {};
        }
        const onboardingData = { ...existing, referral };

        // 2. Validate and sanitize all fields
        const collegeName = typeof onboardingData.college === "string"
            ? onboardingData.college.slice(0, 200) : "";
        const gradYear = Number(onboardingData.graduationYear);
        const validGradYear = Number.isInteger(gradYear) && gradYear >= 2020 && gradYear <= 2035
            ? gradYear : 2025;
        const branch = typeof onboardingData.department === "string"
            ? onboardingData.department.slice(0, 50) : "";
        const semester = Number(onboardingData.semester);
        const validSemester = Number.isInteger(semester) && semester >= 1 && semester <= 8
            ? semester : 1;

        // 3. Get current authenticated user
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // 4. Upsert the complete profile
        if (user) {
            await supabase.from("user_profiles").upsert({
                id: user.id,
                full_name: user.user_metadata?.full_name || "",
                email: user.email,
                college_name: collegeName,
                graduation_year: validGradYear,
                branch: branch,
                semester: validSemester,
                referral_source: referral,
                onboarding_completed: true,  // ← THE KEY FLAG
            });
        }

        // 5. Cleanup and navigate
        localStorage.removeItem("onboarding");
        router.push("/chat");
        router.refresh();
    };

    // Renders: ProgressIndicator, ReferralOptions, Back + "Get Started" buttons
}
```

**Step-by-step flow:**

1. User sees "How did you hear about us?" with 7 referral options from `REFERRAL_OPTIONS` in `types/index.ts`:
   - 👥 Friend or Classmate
   - 📱 Instagram
   - 💬 WhatsApp/Telegram
   - 🔍 Google Search
   - 📘 Facebook
   - 🎓 College Notice/Poster
   - 📰 Other

2. User selects one → "Get Started" button activates

3. On click (`handleComplete`):
   - Reads ALL accumulated data from `localStorage["onboarding"]`
   - **Validates each field** defensively (type checks, range limits, string truncation)
   - Gets the authenticated user from Supabase
   - **Upserts** into `user_profiles` with `onboarding_completed: true`
   - Deletes the `"onboarding"` key from localStorage (cleanup)
   - Navigates to `/chat` and refreshes

4. **After this**: The middleware will see `onboarding_completed: true` and allow access to all dashboard routes.

**What gets written to the database:**

```sql
INSERT INTO user_profiles (
    id, full_name, email, college_name, graduation_year,
    branch, semester, referral_source, onboarding_completed
) VALUES (
    'user-uuid', 'John Doe', 'john@example.com', 'College of Engineering, Trivandrum',
    2026, 'Computer Science & Engineering', 3, 'friend', true
)
ON CONFLICT (id) DO UPDATE SET
    college_name = EXCLUDED.college_name,
    graduation_year = EXCLUDED.graduation_year,
    branch = EXCLUDED.branch,
    semester = EXCLUDED.semester,
    referral_source = EXCLUDED.referral_source,
    onboarding_completed = EXCLUDED.onboarding_completed;
```

**Connected to:**
- `lib/supabase/client.ts` → browser Supabase client for the upsert
- `supabase/schema.sql` → `user_profiles` table
- `lib/supabase/middleware.ts` → Rule 3 now allows dashboard access since `onboarding_completed = true`
- `types/index.ts` → `REFERRAL_OPTIONS` array
- `components/onboarding/ReferralOptions.tsx` → referral selection UI

---

### 2.2.7 Onboarding Components Summary

| Component | File | Purpose |
|-----------|------|---------|
| `ProgressIndicator` | `components/onboarding/ProgressIndicator.tsx` | Shows 4 dots at top, `currentStep` prop highlights the active dot (indigo) |
| `CollegeSelector` | `components/onboarding/CollegeSelector.tsx` | Searchable dropdown with 130+ colleges from `KTU_COLLEGES`. User types → filters → selects |
| `DepartmentCards` | `components/onboarding/DepartmentCards.tsx` | 5 clickable cards with emoji icons and department names from `DEPARTMENTS` |
| `SemesterGrid` | `components/onboarding/SemesterGrid.tsx` | 4×2 grid of 8 semester buttons (1-8) |
| `ReferralOptions` | `components/onboarding/ReferralOptions.tsx` | 7 clickable referral buttons with emoji icons from `REFERRAL_OPTIONS` |

---

### 2.2.8 Complete Auth + Onboarding Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FIRST VISIT                                  │
│                                                                     │
│  User visits /  ──→  Landing Page (public)                          │
│  User clicks "Get Started"  ──→  /signup                            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │  SIGNUP FLOW                                             │        │
│  │  1. Fill form (name, email, password, confirm password)  │        │
│  │  2. Zod validates + password strength check              │        │
│  │  3. supabase.auth.signUp() → auth.users row created      │        │
│  │  4. user_profiles row created (onboarding_completed=false)│       │
│  │  5. router.push("/onboarding/step-1")                    │        │
│  └──────────────────────────┬──────────────────────────────┘        │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │  ONBOARDING FLOW                                         │        │
│  │                                                           │       │
│  │  Step 1 ──→ College + Grad Year ──→ localStorage          │       │
│  │      │                                                    │       │
│  │      ▼                                                    │       │
│  │  Step 2 ──→ Department ──→ localStorage (merged)          │       │
│  │      │                                                    │       │
│  │      ▼                                                    │       │
│  │  Step 3 ──→ Semester ──→ localStorage (merged)            │       │
│  │      │                                                    │       │
│  │      ▼                                                    │       │
│  │  Step 4 ──→ Referral ──→ Supabase upsert ──→ /chat       │       │
│  │             (onboarding_completed = true)                  │       │
│  │             (localStorage cleared)                         │       │
│  └─────────────────────────────────────────────────────────┘        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      RETURNING USER                                 │
│                                                                     │
│  User visits /login  ──→  LoginForm                                 │
│  1. Fill email + password                                           │
│  2. supabase.auth.signInWithPassword()                              │
│  3. router.push("/chat") → router.refresh()                         │
│  4. Middleware checks onboarding_completed:                         │
│     ├── true  → Allow access to /chat                               │
│     └── false → Redirect to /onboarding/step-1                      │
│                                                                     │
│  If already logged in and visits /login:                            │
│     Middleware Rule 2 → Redirect to /chat                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

*End of Part 2.*

---

# Part 3: Dashboard Layout & Sidebar

## 3.1 Dashboard Layout — `app/(dashboard)/layout.tsx`

Once a user completes onboarding and lands on `/chat`, they enter the **dashboard**. The `(dashboard)` route group wraps all protected pages: `/chat`, `/courses`, `/patterns`, and `/profile`.

This is a **client component** because it manages sidebar open/close state.

```typescript
// app/(dashboard)/layout.tsx
"use client";

import { useState } from "react";
import { GraduationCap, Menu, X } from "lucide-react";
import { NewChatButton } from "@/components/sidebar/NewChatButton";
import { NavigationLinks } from "@/components/sidebar/NavigationLinks";
import { RecentChats } from "@/components/sidebar/RecentChats";
import { UserProfile } from "@/components/sidebar/UserProfile";
import { useStudyTimer } from "@/hooks/useStudyTimer";

// Silent component — runs the study timer without rendering anything
function StudyTimerTracker() {
    useStudyTimer();
    return null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="flex h-screen bg-gray-50">
            <StudyTimerTracker />

            {/* Mobile backdrop overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar — fixed on mobile, relative on desktop */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r 
                border-gray-200 flex flex-col transform transition-transform duration-300 
                ease-in-out lg:relative lg:translate-x-0
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                
                {/* Logo + close button */}
                <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-base font-bold text-gray-900">KTU Exam Prep</span>
                    </div>
                    <button onClick={closeSidebar} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-md">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="px-5 py-4">
                    <NewChatButton onNavigate={closeSidebar} />
                </div>

                {/* Navigation Links (Patterns, Courses) */}
                <div className="px-3">
                    <NavigationLinks onNavigate={closeSidebar} />
                </div>

                <hr className="mx-5 my-2 border-gray-100" />

                {/* Recent Chats (scrollable, fills remaining space) */}
                <RecentChats onNavigate={closeSidebar} />

                <hr className="mx-5 border-gray-100" />

                {/* User Profile (fixed at bottom) */}
                <div className="px-3 py-2">
                    <UserProfile />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Mobile header with hamburger menu */}
                <div className="lg:hidden flex items-center h-14 px-4 bg-white border-b border-gray-200">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg -ml-2">
                        <Menu className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex items-center gap-2 ml-3">
                        <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">KTU Exam Prep</span>
                    </div>
                </div>

                {children}
            </main>
        </div>
    );
}
```

### Layout Structure (Visual)

```
┌──────────────────────────────────────────────────────────────────┐
│  FULL SCREEN (flex h-screen)                                     │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────────────────────────┐   │
│  │  SIDEBAR (280px) │  │  MAIN CONTENT (flex-1)              │   │
│  │                  │  │                                     │   │
│  │  ┌────────────┐  │  │  ┌─────────────────────────────┐   │   │
│  │  │ Logo + X   │  │  │  │ Mobile Header (lg:hidden)    │   │   │
│  │  └────────────┘  │  │  │ ☰ Menu  + Logo               │   │   │
│  │  ┌────────────┐  │  │  └─────────────────────────────┘   │   │
│  │  │ + New Chat │  │  │                                     │   │
│  │  └────────────┘  │  │  ┌─────────────────────────────┐   │   │
│  │  ┌────────────┐  │  │  │                               │   │   │
│  │  │ Patterns   │  │  │  │       {children}              │   │   │
│  │  │ Courses    │  │  │  │                               │   │   │
│  │  └────────────┘  │  │  │  (ChatInterface, Courses,     │   │   │
│  │  ──────────────  │  │  │   Patterns, or Profile page)  │   │   │
│  │  ┌────────────┐  │  │  │                               │   │   │
│  │  │ Recent     │  │  │  └─────────────────────────────┘   │   │
│  │  │ Chats      │  │  │                                     │   │
│  │  │ (scroll)   │  │  │                                     │   │
│  │  │            │  │  │                                     │   │
│  │  └────────────┘  │  │                                     │   │
│  │  ──────────────  │  │                                     │   │
│  │  ┌────────────┐  │  │                                     │   │
│  │  │ User       │  │  │                                     │   │
│  │  │ Profile    │  │  │                                     │   │
│  │  └────────────┘  │  │                                     │   │
│  └─────────────────┘  └─────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **`<StudyTimerTracker />`** — A "headless" component that renders **nothing** (`return null`) but runs the `useStudyTimer()` hook. This ensures study time tracking starts the moment the dashboard loads and runs as long as the user is on any dashboard page.

2. **Responsive sidebar** — On desktop (`lg:` breakpoint, ≥1024px), the sidebar is always visible (`lg:relative lg:translate-x-0`). On mobile, it slides in from the left with a CSS transform transition (`-translate-x-full` → `translate-x-0`) and a dark backdrop overlay.

3. **`onNavigate` prop** — Every sidebar component receives this callback. When an item is clicked on mobile, it calls `closeSidebar()` to dismiss the sidebar after navigation.

**Connected to:**
- `components/sidebar/NewChatButton.tsx` → "New Chat" button
- `components/sidebar/NavigationLinks.tsx` → Patterns + Courses links
- `components/sidebar/RecentChats.tsx` → scrollable chat history list
- `components/sidebar/UserProfile.tsx` → user avatar + sign out
- `hooks/useStudyTimer.ts` → active study time tracking
- `app/(dashboard)/chat/page.tsx` → the `{children}` slot

---

## 3.2 Sidebar Components

### 3.2.1 NewChatButton — `components/sidebar/NewChatButton.tsx`

```typescript
// components/sidebar/NewChatButton.tsx
"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface NewChatButtonProps {
    onNavigate?: () => void;
}

export function NewChatButton({ onNavigate }: NewChatButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        router.push("/chat");     // Navigate to /chat WITHOUT an ?id= param
        onNavigate?.();           // Close sidebar on mobile
    };

    return (
        <button
            onClick={handleClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                       bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 
                       active:scale-[0.98] transition-all duration-200 text-sm h-[44px]"
        >
            <Plus className="w-4 h-4" />
            New Chat
        </button>
    );
}
```

**What it does:**
- Navigates to `/chat` **without** a `?id=` query parameter
- This causes `ChatInterface` (Section 4) to show the empty state (suggested prompts) instead of loading an existing conversation
- The `active:scale-[0.98]` creates a subtle press animation
- `onNavigate?.()` closes the mobile sidebar after clicking

**Connected to:**
- `app/(dashboard)/chat/page.tsx` → the destination
- `components/chat/ChatInterface.tsx` → when `conversationId` is `null`, shows empty state

---

### 3.2.2 NavigationLinks — `components/sidebar/NavigationLinks.tsx`

```typescript
// components/sidebar/NavigationLinks.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
    { href: "/patterns", label: "Patterns", icon: BarChart3 },
    { href: "/courses", label: "Courses", icon: BookOpen },
];

interface NavigationLinksProps {
    onNavigate?: () => void;
}

export function NavigationLinks({ onNavigate }: NavigationLinksProps) {
    const pathname = usePathname();

    return (
        <nav className="space-y-1">
            {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        onClick={onNavigate}
                        className={cn(
                            "flex items-center gap-3 h-10 px-4 rounded-md text-sm font-medium transition-all duration-150",
                            isActive
                                ? "bg-indigo-50 text-indigo-600 border-l-[3px] border-indigo-600"
                                : "text-gray-600 hover:bg-gray-100"
                        )}
                    >
                        <link.icon className="w-5 h-5 shrink-0" />
                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );
}
```

**What it does:**
- Renders 2 navigation links: Patterns (📊) and Courses (📚)
- Uses `usePathname()` to determine which link is active
- Active link gets: indigo background, indigo text, 3px indigo left border
- Inactive link gets: gray text, hover:gray-100 background
- Uses `cn()` utility from `lib/utils.ts` (wraps `clsx` + `tailwind-merge`)

**Connected to:**
- `app/(dashboard)/patterns/page.tsx` → Patterns page
- `app/(dashboard)/courses/page.tsx` → Courses page
- `lib/utils.ts` → `cn()` utility for conditional class merging

---

### 3.2.3 RecentChats — `components/sidebar/RecentChats.tsx`

This is the most complex sidebar component. It fetches, displays, and manages the user's conversation history with **real-time updates**.

```typescript
// components/sidebar/RecentChats.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ChatItem } from "./ChatItem";

interface Conversation {
    id: string;
    title: string;
    updated_at: string;
    created_at: string;
}

export function RecentChats({ onNavigate }: { onNavigate?: () => void }) {
    const searchParams = useSearchParams();
    const activeId = searchParams.get("id");          // Currently active conversation
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = createClient();

    // ---- Fetch all conversations from database ----
    const fetchConversations = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from("conversations")
            .select("id, title, updated_at, created_at")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(50);

        setConversations(data || []);
        setIsLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchConversations();

        // ---- Real-time subscription via Supabase Realtime ----
        const channel = supabase
            .channel("conversations-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "conversations" },
                () => { fetchConversations(); }
            )
            .subscribe();

        // ---- Local custom event from ChatInterface ----
        const handleConversationUpdated = () => { fetchConversations(); };
        window.addEventListener("conversation-updated", handleConversationUpdated);

        return () => {
            supabase.removeChannel(channel);
            window.removeEventListener("conversation-updated", handleConversationUpdated);
        };
    }, [fetchConversations, supabase]);

    // ---- Rename conversation (optimistic update) ----
    const handleRename = async (id: string, newTitle: string) => {
        // Optimistic: update UI immediately
        setConversations((prev) =>
            prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
        );
        // Then persist to database
        const { error } = await supabase
            .from("conversations")
            .update({ title: newTitle })
            .eq("id", id);

        if (error) fetchConversations();  // Revert on failure
    };

    // ---- Delete conversation (optimistic update) ----
    const handleDelete = async (id: string) => {
        // Optimistic: remove from UI immediately
        setConversations((prev) => prev.filter((c) => c.id !== id));
        // Then delete from database (messages first due to FK constraint, then conversation)
        await supabase.from("messages").delete().eq("conversation_id", id);
        const { error } = await supabase.from("conversations").delete().eq("id", id);

        if (error) fetchConversations();  // Revert on failure
    };

    // ---- Loading state: skeleton placeholders ----
    if (isLoading) {
        return (
            <div className="px-5 py-4">
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 bg-gray-100 rounded-md animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    // ---- Empty state ----
    // Shows MessageSquare icon + "No chats yet" text

    // ---- Conversation list ----
    // Maps over conversations array, renders <ChatItem /> for each
    // Passes activeId to highlight current conversation
}
```

**Two update mechanisms (dual channel):**

1. **Supabase Realtime** (`postgres_changes`) — WebSocket subscription on the `conversations` table. Any INSERT/UPDATE/DELETE from **any source** (including other tabs) triggers a refetch. This ensures the sidebar stays in sync if the user has multiple tabs open.

2. **Custom DOM event** (`conversation-updated`) — When `ChatInterface` creates a new conversation or sends a message, it dispatches `window.dispatchEvent(new CustomEvent("conversation-updated"))`. This provides an **instant** update without waiting for the Realtime WebSocket round-trip.

**Optimistic updates:**
- Rename and delete update the local `conversations` state **immediately** before the database call completes
- If the database call fails, `fetchConversations()` is called to revert to the true state

**Delete order matters:**
```
1. DELETE FROM messages WHERE conversation_id = 'xxx'   ← FK constraint requires this first
2. DELETE FROM conversations WHERE id = 'xxx'
```

**Connected to:**
- `lib/supabase/client.ts` → browser Supabase client
- `components/sidebar/ChatItem.tsx` → individual chat entry rendering
- `components/chat/ChatInterface.tsx` → dispatches `conversation-updated` event
- `supabase/schema.sql` → `conversations` and `messages` tables

---

### 3.2.4 ChatItem — `components/sidebar/ChatItem.tsx`

Each conversation in the sidebar is rendered as a `ChatItem`.

```typescript
// components/sidebar/ChatItem.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatItemMenu } from "./ChatItemMenu";

interface ChatItemProps {
    id: string;
    title: string;
    isActive: boolean;
    onRename: (id: string, newTitle: string) => void;
    onDelete: (id: string) => void;
    onNavigate?: () => void;
}

export function ChatItem({ id, title, isActive, onRename, onDelete, onNavigate }: ChatItemProps) {
    const router = useRouter();
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState(title);

    const handleClick = () => {
        if (!isRenaming) {
            router.push(`/chat?id=${id}`);   // Navigate to this specific conversation
            onNavigate?.();
        }
    };

    const handleRenameSubmit = () => {
        const trimmed = renameValue.trim();
        if (trimmed && trimmed !== title) {
            onRename(id, trimmed);
        }
        setIsRenaming(false);
    };

    const handleRenameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleRenameSubmit();
        else if (e.key === "Escape") {
            setIsRenaming(false);
            setRenameValue(title);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                "group flex items-center gap-2.5 h-12 px-3 rounded-md mb-1 cursor-pointer transition-all duration-150",
                isActive
                    ? "bg-indigo-50 border-l-[3px] border-indigo-600"
                    : "hover:bg-gray-100"
            )}
        >
            <MessageSquare className={cn(
                "w-[18px] h-[18px] shrink-0",
                isActive ? "text-indigo-600" : "text-gray-400"
            )} />

            {isRenaming ? (
                <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={handleRenameKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    maxLength={100}
                    className="flex-1 min-w-0 text-sm bg-white border border-indigo-300 rounded px-1.5 py-0.5 
                               focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            ) : (
                <span className={cn(
                    "flex-1 min-w-0 text-sm font-medium truncate",
                    isActive ? "text-indigo-900" : "text-gray-700"
                )}>
                    {title}
                </span>
            )}

            {!isRenaming && (
                <ChatItemMenu
                    chatId={id}
                    onRename={() => handleRenameStart()}
                    onDelete={() => onDelete(id)}
                />
            )}
        </div>
    );
}
```

**Features:**
- **Active state**: Highlighted with indigo background + left border when `?id=` matches
- **Inline rename**: When the user triggers rename from the menu, the title text transforms into an `<input>` field. Submit on Enter or blur, cancel on Escape.
- **Title truncation**: `truncate` class ensures long titles don't break the layout
- **Three-dot menu**: `<ChatItemMenu />` appears on hover (via `group-hover:opacity-100`)

**Connected to:**
- `components/sidebar/ChatItemMenu.tsx` → the three-dot dropdown menu
- `components/sidebar/RecentChats.tsx` → parent that provides `onRename` and `onDelete` callbacks
- `app/(dashboard)/chat/page.tsx` → navigates to `/chat?id={conversationId}`

---

### 3.2.5 ChatItemMenu — `components/sidebar/ChatItemMenu.tsx`

```typescript
// components/sidebar/ChatItemMenu.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

interface ChatItemMenuProps {
    chatId: string;
    onRename: (id: string) => void;
    onDelete: (id: string) => void;
}

export function ChatItemMenu({ chatId, onRename, onDelete }: ChatItemMenuProps) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [open]);

    return (
        <div ref={menuRef} className="relative">
            {/* Three-dot trigger — visible only on parent hover */}
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
                className="p-1 rounded hover:bg-gray-200 transition-colors 
                           opacity-0 group-hover:opacity-100 data-[open=true]:opacity-100"
                data-open={open}
                aria-label="Chat options"
            >
                <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>

            {/* Dropdown menu */}
            {open && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 
                               rounded-lg shadow-lg z-50 py-1">
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); onRename(chatId); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        <Pencil className="w-4 h-4" /> Rename
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); onDelete(chatId); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                </div>
            )}
        </div>
    );
}
```

**Key implementation details:**

- **Event propagation**: Every click uses `e.stopPropagation()` to prevent the parent `ChatItem`'s `onClick` from also firing (which would navigate to the conversation)
- **Click outside**: A `mousedown` event listener on `document` closes the menu when clicking anywhere outside `menuRef`
- **Visibility**: The three-dot icon is `opacity-0` by default and only appears on `.group-hover` (when hovering the parent `ChatItem`). Once the menu is open, `data-[open=true]:opacity-100` keeps it visible.

**Connected to:**
- `components/sidebar/ChatItem.tsx` → parent that renders this menu
- `components/sidebar/RecentChats.tsx` → grandparent that handles the actual rename/delete DB operations

---

### 3.2.6 UserProfile — `components/sidebar/UserProfile.tsx`

Fixed at the bottom of the sidebar, shows the user's avatar, name, email, and provides a menu to access profile settings or sign out.

```typescript
// components/sidebar/UserProfile.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function UserProfile() {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // ---- Load user data on mount ----
    useEffect(() => {
        const loadUser = async () => {
            const supabase = createClient();
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                // Try profile name first, fall back to auth metadata
                const { data: profile } = await supabase
                    .from("user_profiles")
                    .select("full_name")
                    .eq("id", authUser.id)
                    .single();

                setUser({
                    name: profile?.full_name || authUser.user_metadata?.full_name || "User",
                    email: authUser.email || "",
                });
            }
        };
        loadUser();
    }, []);

    // ---- Click outside handler ----
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [menuOpen]);

    // ---- Sign out ----
    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    if (!user) return null;

    // Generate initials from name (e.g., "John Doe" → "JD")
    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div ref={menuRef} className="relative">
            {/* Upward dropdown menu */}
            {menuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 
                               rounded-lg shadow-lg z-50 py-1">
                    <button onClick={() => { setMenuOpen(false); router.push("/profile"); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100">
                        <Settings className="w-4 h-4" /> Profile Settings
                    </button>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            )}

            {/* User profile trigger button */}
            <button onClick={() => setMenuOpen(!menuOpen)}
                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-100 rounded-lg">
                <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    {initials || "U"}
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
            </button>
        </div>
    );
}
```

**Key details:**
- **Name resolution priority**: 1) `user_profiles.full_name` → 2) `auth.users.user_metadata.full_name` → 3) `"User"` fallback
- **Initials**: Generated from the full name (e.g., "John Doe" → "JD") displayed in a circular avatar
- **Menu direction**: Opens **upward** (`absolute bottom-full`) since the profile is at the bottom of the sidebar
- **Sign out flow**: `supabase.auth.signOut()` clears cookies → `router.push("/login")` → `router.refresh()` forces middleware to process the now-unauthenticated state

**Connected to:**
- `lib/supabase/client.ts` → fetch user data, sign out
- `supabase/schema.sql` → `user_profiles` table (reads `full_name`)
- `app/(dashboard)/profile/page.tsx` → "Profile Settings" navigates here
- `app/(auth)/login/page.tsx` → sign out redirects here

---

## 3.3 Study Timer Hook — `hooks/useStudyTimer.ts`

The study timer is a custom React hook that tracks how long a user is **actively using** the application. It only counts time when the browser tab is visible and focused.

### Architecture

The hook is split into two parts:

1. **`useStudyTimer()`** — Runs in the dashboard layout. Tracks active time, saves to database periodically.
2. **`useLiveSessionSeconds()`** — Runs on the profile page. Provides a live ticking counter for display.

Both share **module-level state** (variables outside the component) so they survive re-renders and can communicate.

```typescript
// hooks/useStudyTimer.ts
"use client";

import { useEffect, useRef, useCallback, useState } from "react";

const SAVE_INTERVAL_MS = 60_000; // Save every 60 seconds

// ---- Module-level session tracker (survives re-renders) ----
let _sessionStartedAt: number | null = null;
let _pausedAccumulatedMs = 0;
let _isPaused = true;

function startSession() {
    if (!_isPaused) return;
    _isPaused = false;
    _sessionStartedAt = Date.now();
}

function pauseSession() {
    if (_isPaused || !_sessionStartedAt) return;
    _pausedAccumulatedMs += Date.now() - _sessionStartedAt;
    _sessionStartedAt = null;
    _isPaused = true;
}

function getSessionSeconds(): number {
    let total = _pausedAccumulatedMs;
    if (!_isPaused && _sessionStartedAt) {
        total += Date.now() - _sessionStartedAt;
    }
    return Math.floor(total / 1000);
}

function resetSession() {
    _pausedAccumulatedMs = 0;
    _sessionStartedAt = _isPaused ? null : Date.now();
}
```

**Why module-level state?** React hooks reinitialize state on re-renders. But the timer needs to track accumulated time across re-renders, hot module replacement, and even component unmount/remount cycles. Module-level variables (`let _sessionStartedAt`, etc.) persist in memory as long as the page is loaded.

### The Main Timer Hook

```typescript
export function useStudyTimer() {
    const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ---- Flush accumulated time to the server ----
    const flush = useCallback(async () => {
        const seconds = getSessionSeconds();
        if (seconds < 5) return;  // Don't save trivially small amounts

        resetSession();  // Reset counter before async call

        try {
            await fetch("/api/study-time", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ seconds }),
            });
            window.dispatchEvent(new CustomEvent("study-time-saved"));
        } catch {
            // If save fails, add the time back to the accumulator
            _pausedAccumulatedMs += seconds * 1000;
        }
    }, []);

    useEffect(() => {
        startSession();  // Start tracking when dashboard mounts

        // ---- Visibility API ----
        const handleVisibilityChange = () => {
            if (document.hidden) {
                pauseSession();
                flush();            // Save when tab becomes hidden
            } else {
                startSession();     // Resume when tab becomes visible
            }
        };

        // ---- Focus / Blur ----
        const handleFocus = () => startSession();
        const handleBlur = () => {
            pauseSession();
            flush();                // Save when window loses focus
        };

        // ---- Periodic save ----
        saveIntervalRef.current = setInterval(flush, SAVE_INTERVAL_MS);

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleFocus);
        window.addEventListener("blur", handleBlur);

        // ---- beforeunload — last chance to save ----
        const handleBeforeUnload = () => {
            const seconds = getSessionSeconds();
            if (seconds >= 5) {
                navigator.sendBeacon(
                    "/api/study-time",
                    new Blob([JSON.stringify({ seconds })], { type: "application/json" })
                );
                resetSession();
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);

        // ---- Cleanup ----
        return () => {
            if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("blur", handleBlur);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            flush();  // Final save on unmount
        };
    }, [flush]);
}
```

### Timer Lifecycle

```
Dashboard loads
    │
    ▼
startSession()  ─── _sessionStartedAt = Date.now(), _isPaused = false
    │
    │  (user is actively using the app)
    │
    ▼
Every 60 seconds: flush() → POST /api/study-time → increment_study_time RPC
    │
    │  User switches tab or minimizes window
    ▼
visibilitychange (hidden) OR blur
    │
    ├── pauseSession()  ─── _pausedAccumulatedMs += (now - _sessionStartedAt)
    │                       _sessionStartedAt = null, _isPaused = true
    └── flush()  ─── POST /api/study-time with accumulated seconds
    │
    │  User returns to the tab
    ▼
visibilitychange (visible) OR focus
    │
    └── startSession()  ─── _sessionStartedAt = Date.now(), _isPaused = false
    │
    │  User closes tab/browser
    ▼
beforeunload
    │
    └── navigator.sendBeacon("/api/study-time", { seconds })
        (sendBeacon is fire-and-forget — doesn't block page unload)
```

### The Display Hook

```typescript
export function useLiveSessionSeconds() {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        // Poll session seconds every second for smooth ticking
        const interval = setInterval(() => {
            setSeconds(getSessionSeconds());
        }, 1000);

        // Also update when time is saved (resets session counter)
        const handleSaved = () => setSeconds(getSessionSeconds());
        window.addEventListener("study-time-saved", handleSaved);

        return () => {
            clearInterval(interval);
            window.removeEventListener("study-time-saved", handleSaved);
        };
    }, []);

    return seconds;
}
```

**Used by:** The profile page to display a live ticking "Session: MM:SS" counter alongside the total study time from the database.

### Save Reliability

| Scenario | How time is saved |
|----------|-------------------|
| User uses app for 60+ seconds | `setInterval(flush, 60_000)` fires periodically |
| User switches to another tab | `visibilitychange` → `pauseSession()` + `flush()` |
| User minimizes the window | `blur` → `pauseSession()` + `flush()` |
| User closes the tab | `beforeunload` → `navigator.sendBeacon()` |
| Component unmounts | Cleanup function calls `flush()` |
| Save fails (network error) | Time is added back: `_pausedAccumulatedMs += seconds * 1000` |

**Connected to:**
- `app/(dashboard)/layout.tsx` → `<StudyTimerTracker />` runs `useStudyTimer()`
- `app/api/study-time/route.ts` → the POST endpoint that receives the seconds
- `supabase/schema.sql` → `increment_study_time()` RPC atomically updates `user_profiles.study_time_minutes`
- `app/(dashboard)/profile/page.tsx` → uses `useLiveSessionSeconds()` for display

---

*End of Part 3.*

---

# Part 4: AI Chat System & RAG Pipeline

This is the **core feature** of the application — where the user asks questions and receives AI-generated answers based on the KTU syllabus. This section covers the entire journey from keystroke to AI response.

## 4.1 Complete Chat Request Lifecycle

```
User types question in InputBox
    │
    ▼
InputBox calls onSend(content)  →  ChatInterface.sendMessage(content)
    │
    ├── 1. Create optimistic user message (local state)
    ├── 2. Set isLoading = true (shows TypingIndicator)
    │
    ▼
POST /api/chat  { message, conversationId }
    │
    ├── 3. Authenticate user (Supabase session from cookies)
    ├── 4. Rate limit check (20 req / 60s per user)
    ├── 5. Validate inputs (Zod-style checks)
    │
    ├── 6. If no conversationId → CREATE new conversation
    │      INSERT INTO conversations (user_id, title)
    │      title = first 50 chars of message
    │
    ├── 7. INSERT user message into messages table
    │
    ├── 8. Fetch last 10 messages for conversation history
    │
    ├── 9. RAG PIPELINE:
    │      ├── a. Embed query via OpenAI text-embedding-3-small → 1536-dim vector
    │      ├── b. Call match_syllabus() RPC → pgvector cosine similarity search
    │      ├── c. Format matched chunks into context string
    │      ├── d. Build system prompt with KTU-specific rules + context
    │      ├── e. Call GPT-4o-mini with system prompt + history + user message
    │      └── f. Extract answer + format source citations
    │
    ├── 10. INSERT AI response into messages table (with sources JSONB)
    ├── 11. UPDATE conversation.updated_at (triggers sidebar reorder)
    │
    ▼
Return JSON { answer, sources, conversationId }
    │
    ▼
ChatInterface receives response
    ├── 12. Add AI message to local state
    ├── 13. If new conversation → update URL to /chat?id=XXX
    ├── 14. Dispatch "conversation-updated" event → sidebar refreshes
    └── 15. Set isLoading = false (hides TypingIndicator)
```

---

## 4.2 Chat Page — `app/(dashboard)/chat/page.tsx`

```typescript
// app/(dashboard)/chat/page.tsx
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Suspense } from "react";

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>}>
            <ChatInterface />
        </Suspense>
    );
}
```

**What it does:**
- Wraps `<ChatInterface />` in `<Suspense>` because `ChatInterface` uses `useSearchParams()` which requires a Suspense boundary
- Shows a loading spinner while the chat component loads
- This is the `{children}` rendered inside the dashboard layout

---

## 4.3 ChatInterface — `components/chat/ChatInterface.tsx`

This is the **central controller** for the entire chat experience. It manages state, API calls, conversation navigation, and coordinates all child components.

```typescript
// components/chat/ChatInterface.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { GraduationCap, BookOpen, Brain, Target, Loader2 } from "lucide-react";
import { MessageList } from "./MessageList";
import { InputBox } from "./InputBox";
import type { Message } from "@/types";

const SUGGESTED_PROMPTS = [
    { icon: BookOpen, text: "Explain the OSI model layers", color: "text-blue-600 bg-blue-50" },
    { icon: Brain, text: "What is Dijkstra's algorithm?", color: "text-indigo-600 bg-indigo-50" },
    { icon: Target, text: "Important topics in Data Structures", color: "text-emerald-600 bg-emerald-50" },
];

export function ChatInterface() {
    const searchParams = useSearchParams();
    const conversationId = searchParams.get("id");           // From URL: /chat?id=XXX

    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);       // True while waiting for AI response
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);  // True while loading past messages
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId);
```

### State Machine

The component has 3 visual states:

```
┌─────────────────────────────────────────────────────────┐
│  STATE 1: isLoadingHistory === true                     │
│                                                         │
│  Shows: Centered spinner + "Loading conversation..."    │
│  When:  User clicks an existing conversation in sidebar │
│         Messages are being fetched from database        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  STATE 2: messages.length === 0 (Empty State)           │
│                                                         │
│  Shows: GraduationCap icon + "Start a Conversation"     │
│         + 3 suggested prompt buttons                    │
│         + InputBox at the bottom                        │
│  When:  User clicks "New Chat" or visits /chat (no id)  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  STATE 3: messages.length > 0 (Active Chat)             │
│                                                         │
│  Shows: MessageList (scrollable message history)        │
│         + TypingIndicator (if isLoading)                │
│         + InputBox at the bottom                        │
│  When:  After sending first message or loading history  │
└─────────────────────────────────────────────────────────┘
```

### Loading Existing Conversations

```typescript
    // When the URL changes (user clicks a conversation in sidebar)
    useEffect(() => {
        setCurrentConversationId(conversationId);

        if (!conversationId) {
            setMessages([]);      // No id = new chat = empty state
            return;
        }

        const loadMessages = async () => {
            setIsLoadingHistory(true);
            try {
                const { createClient } = await import("@/lib/supabase/client");
                const supabase = createClient();
                const { data } = await supabase
                    .from("messages")
                    .select("*")
                    .eq("conversation_id", conversationId)
                    .order("created_at", { ascending: true });

                if (data && data.length > 0) {
                    setMessages(data.map((m) => ({
                        id: m.id,
                        conversation_id: m.conversation_id,
                        role: m.role as "user" | "assistant",
                        content: m.content,
                        sources: m.sources,
                        created_at: m.created_at,
                    })));
                } else {
                    setMessages([]);
                }
            } catch {
                setMessages([]);
            }
            setIsLoadingHistory(false);
        };

        loadMessages();
    }, [conversationId]);
```

**Key details:**
- Uses **dynamic import** (`await import("@/lib/supabase/client")`) to avoid importing Supabase SDK at module level
- Queries `messages` table filtered by `conversation_id`, ordered by `created_at` ascending (oldest first)
- If the conversation has no messages (shouldn't happen normally), shows empty state

### Sending a Message

```typescript
    const sendMessage = useCallback(async (content: string) => {
        // 1. Create optimistic user message with temporary ID
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            conversation_id: currentConversationId || "",
            role: "user",
            content,
            created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);   // Show immediately
        setIsLoading(true);                               // Show TypingIndicator

        try {
            // 2. POST to /api/chat
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: content,
                    conversationId: currentConversationId,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to get response");
            }

            // 3. Create AI message from response
            const aiMessage: Message = {
                id: `ai-${Date.now()}`,
                conversation_id: data.conversationId,
                role: "assistant",
                content: data.answer,
                sources: data.sources,
                created_at: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, aiMessage]);

            // 4. If this was a new conversation, update state and URL
            if (!currentConversationId && data.conversationId) {
                setCurrentConversationId(data.conversationId);
                window.history.replaceState(null, "", `/chat?id=${data.conversationId}`);
            }

            // 5. Notify sidebar to refresh
            window.dispatchEvent(new CustomEvent("conversation-updated"));

        } catch (error) {
            // 6. Show error as an AI message
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                conversation_id: currentConversationId || "",
                role: "assistant",
                content: error instanceof Error && error.message.includes("Too many requests")
                    ? "⏱️ You're sending messages too fast. Please wait a moment."
                    : "I apologize, but I encountered an error. Please try again.",
                created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [currentConversationId]);
```

**Critical design decisions:**

1. **Optimistic UI**: The user message appears instantly in the chat, BEFORE the API call completes. This makes the app feel responsive.

2. **URL management**: After the first message creates a new conversation, `window.history.replaceState()` updates the URL from `/chat` to `/chat?id=XXX` **without** triggering a re-render or navigation. This means:
   - If the user refreshes the page, they'll load the same conversation
   - The sidebar highlights the correct conversation

3. **Event dispatch**: `window.dispatchEvent(new CustomEvent("conversation-updated"))` tells the `RecentChats` sidebar component to refetch conversations immediately, so the new chat appears in the list.

4. **Error as message**: Errors are displayed as assistant messages in the chat, not as alerts or toasts. Rate limit errors get a special clock emoji message.

### Regenerate Response

```typescript
    const handleRegenerate = useCallback(() => {
        const lastUserIndex = [...messages].map(m => m.role).lastIndexOf("user");
        if (lastUserIndex === -1) return;
        const lastUserMsg = messages[lastUserIndex];
        setMessages((prev) => prev.slice(0, lastUserIndex));  // Remove last user + AI messages
        sendMessage(lastUserMsg.content);                      // Re-send the same question
    }, [messages, sendMessage]);
```

**What it does:** Finds the last user message, removes it and the AI response from local state, then re-sends the same message through the full pipeline. This generates a fresh RAG search + new GPT completion.

---

## 4.4 InputBox — `components/chat/InputBox.tsx`

```typescript
// components/chat/InputBox.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputBoxProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export function InputBox({ onSend, disabled }: InputBoxProps) {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea as user types
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height =
                Math.min(textareaRef.current.scrollHeight, 200) + "px";
        }
    }, [value]);

    const handleSend = () => {
        const trimmed = value.trim();
        if (!trimmed || disabled) return;
        onSend(trimmed);
        setValue("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t border-gray-100 bg-white p-4">
            <div className="max-w-[57.6rem] mx-auto">
                <div className="relative flex items-end border-2 border-gray-200 rounded-3xl 
                               bg-gray-50 focus-within:border-indigo-400 focus-within:bg-white 
                               transition-all duration-200">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything from your syllabus..."
                        disabled={disabled}
                        rows={1}
                        className="flex-1 resize-none bg-transparent px-5 py-3.5 text-sm ..."
                    />
                    <button
                        onClick={handleSend}
                        disabled={!value.trim() || disabled}
                        className={cn(
                            "m-2 p-2 rounded-full transition-all duration-200 shrink-0",
                            value.trim() && !disabled
                                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        )}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-[11px] text-gray-400 text-center mt-2">
                    KTU Exam Prep AI can make mistakes. Verify important information.
                </p>
            </div>
        </div>
    );
}
```

**Features:**
- **Auto-expanding textarea**: Starts at 1 row, grows up to 200px as user types multi-line content
- **Enter to send**: Default Enter sends the message. Shift+Enter creates a new line.
- **Smart send button**: Gray/disabled when empty, indigo when there's text, disabled during API call
- **Disclaimer**: Shows "can make mistakes" warning like ChatGPT
- **Max width**: Content is constrained to `57.6rem` (921px) and centered — matches MessageList width

**Connected to:**
- `components/chat/ChatInterface.tsx` → receives `onSend` and `disabled` props

---

## 4.5 MessageList — `components/chat/MessageList.tsx`

```typescript
// components/chat/MessageList.tsx
"use client";

import { useRef, useEffect } from "react";
import { Message } from "./Message";
import { TypingIndicator } from "./TypingIndicator";
import type { Message as MessageType } from "@/types";

interface MessageListProps {
    messages: MessageType[];
    isLoading: boolean;
    onRegenerate?: () => void;
}

export function MessageList({ messages, isLoading, onRegenerate }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive or loading state changes
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-[57.6rem] mx-auto space-y-6">
                {messages.map((msg, i) => (
                    <Message
                        key={msg.id || i}
                        message={msg}
                        onRegenerate={
                            i === messages.length - 1 && msg.role === "assistant"
                                ? onRegenerate
                                : undefined
                        }
                    />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={bottomRef} />    {/* Invisible anchor for auto-scroll */}
            </div>
        </div>
    );
}
```

**Key details:**
- **Auto-scroll**: A zero-size `<div ref={bottomRef} />` at the bottom acts as the scroll target. When messages change or loading starts, `scrollIntoView({ behavior: "smooth" })` smoothly scrolls to it.
- **Regenerate button**: Only the **last** assistant message receives the `onRegenerate` handler. Earlier messages don't show a regenerate button.
- **TypingIndicator**: Shown at the bottom of the list when `isLoading` is true, making it appear as if the AI is typing.

---

## 4.6 Message — `components/chat/Message.tsx`

Each individual message bubble with markdown rendering, source citations, copy, and regenerate actions.

```typescript
// components/chat/Message.tsx
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, RefreshCw } from "lucide-react";
import type { Message as MessageType } from "@/types";

export function Message({ message, onRegenerate }: MessageProps) {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === "user";

    const handleCopy = async () => {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn("flex gap-3 animate-slide-up-fade",
            isUser ? "justify-end" : "justify-start")}>

            <div className={cn("relative group", isUser ? "max-w-[70%]" : "max-w-full")}>
                <div className={cn("px-4 py-3 text-sm leading-relaxed",
                    isUser
                        ? "bg-indigo-600 text-white rounded-[18px_18px_4px_18px]"
                        : "bg-gray-100 text-gray-900 rounded-[18px_18px_18px_4px]"
                )}>
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <div className="prose prose-sm max-w-none ...">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}
                                components={{
                                    pre: ({ children }) => (
                                        <pre className="... bg-gray-900 text-gray-100 ...">{children}</pre>
                                    ),
                                    code: ({ className, children, ...props }) => {
                                        const isBlock = className?.includes("language-");
                                        if (isBlock) return <code className={className} {...props}>{children}</code>;
                                        return <code className="bg-indigo-50 text-indigo-700 ..." {...props}>{children}</code>;
                                    },
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Source citations — shown only on AI messages with sources */}
                {!isUser && message.sources && message.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {message.sources.map((source, i) => (
                            <span key={i} className="... text-[11px] text-gray-500">
                                📄 {source.course_code} {source.module}
                            </span>
                        ))}
                    </div>
                )}

                {/* Action buttons — copy + regenerate (on hover) */}
                {!isUser && (
                    <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 ...">
                        <button onClick={handleCopy}>
                            {copied ? <Check className="text-green-500" /> : <Copy className="text-gray-400" />}
                        </button>
                        {onRegenerate && (
                            <button onClick={onRegenerate}>
                                <RefreshCw className="text-gray-400" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* User avatar */}
            {isUser && (
                <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full ...">U</div>
            )}
        </div>
    );
}
```

**Visual design:**
- **User messages**: Right-aligned, indigo background, white text, chat-bubble rounded corners (`18px_18px_4px_18px` — the bottom-right corner is sharp)
- **AI messages**: Left-aligned, gray background, dark text, opposite corner pattern
- **User avatar**: Dark "U" in a circle, shown to the right of user messages

**Markdown rendering** (AI messages only):
- Uses `react-markdown` with `remark-gfm` (GitHub-flavored markdown: tables, strikethrough, etc.)
- Custom `<pre>` component: dark background code blocks
- Custom `<code>` component: distinguishes inline code (indigo) from code blocks

**Source citations**:
- Displayed as small gray pills below the AI response
- Format: `📄 PBCST304 Module 2`
- Data comes from the `sources` JSONB array stored in the `messages` table

**Actions** (shown on hover via `group-hover:opacity-100`):
- **Copy**: Copies raw markdown to clipboard. Shows a green check for 2 seconds as feedback.
- **Regenerate**: Only on the last AI message. Triggers `handleRegenerate()` in `ChatInterface`.

---

## 4.7 TypingIndicator — `components/chat/TypingIndicator.tsx`

```typescript
// components/chat/TypingIndicator.tsx
"use client";

export function TypingIndicator() {
    return (
        <div className="flex items-start gap-3 animate-fade-in">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-sm">🤖</span>
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-bl px-4 py-3">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                </div>
            </div>
        </div>
    );
}
```

**What it does:**
- Shows an animated "..." bubble with a 🤖 avatar while the AI is generating a response
- The `typing-dot` CSS class creates a staggered bounce animation (defined in `globals.css`)
- Appears between the last message and the `bottomRef` scroll anchor

---

## 4.8 Chat API Route — `app/api/chat/route.ts`

This is the server-side handler that orchestrates the entire chat flow.

```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateAnswer } from "@/lib/rag/generate";

const CHAT_RATE_LIMIT = { maxRequests: 20, windowSeconds: 60 };

export async function POST(req: NextRequest) {
    try {
        // ── STEP 1: Authentication ──
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ── STEP 2: Rate Limiting ──
        const rateResult = await checkRateLimit(`chat:${user.id}`, CHAT_RATE_LIMIT);
        if (!rateResult.allowed) {
            return NextResponse.json(
                { error: "Too many requests. Please wait before sending another message." },
                { status: 429, headers: {
                    "X-RateLimit-Remaining": String(rateResult.remaining),
                    "X-RateLimit-Reset": String(rateResult.resetAt),
                }}
            );
        }

        // ── STEP 3: Input Validation ──
        const body = await req.json();
        const message: string = body.message;
        const conversationId: string | undefined = body.conversationId;
        const courseId: string | undefined = body.courseId;

        if (!message || typeof message !== "string" || message.trim().length === 0) {
            return NextResponse.json({ error: "Message is required." }, { status: 400 });
        }
        if (message.length > 5000) {
            return NextResponse.json({ error: "Message too long (max 5000 chars)." }, { status: 400 });
        }
        if (courseId && !/^[0-9a-f-]{36}$/.test(courseId)) {
            return NextResponse.json({ error: "Invalid courseId." }, { status: 400 });
        }
        if (conversationId && !/^[0-9a-f-]{36}$/.test(conversationId)) {
            return NextResponse.json({ error: "Invalid conversationId." }, { status: 400 });
        }

        // ── STEP 4: Conversation Management ──
        let activeConversationId = conversationId;

        if (activeConversationId) {
            // Verify the conversation belongs to this user
            const { data: conv, error } = await supabase
                .from("conversations")
                .select("id")
                .eq("id", activeConversationId)
                .eq("user_id", user.id)
                .single();

            if (error || !conv) {
                return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
            }
        } else {
            // Create a new conversation
            const { data: newConv, error: convError } = await supabase
                .from("conversations")
                .insert({
                    user_id: user.id,
                    title: message.slice(0, 50),     // First 50 chars become the title
                    course_id: courseId ?? null,
                })
                .select("id")
                .single();

            if (convError || !newConv) {
                return NextResponse.json({ error: "Failed to create conversation." }, { status: 500 });
            }
            activeConversationId = newConv.id;
        }

        // ── STEP 5: Save User Message ──
        await supabase.from("messages").insert({
            conversation_id: activeConversationId,
            role: "user",
            content: message.trim(),
        });

        // ── STEP 6: Build Conversation History ──
        const { data: historyRows } = await supabase
            .from("messages")
            .select("role, content")
            .eq("conversation_id", activeConversationId)
            .order("created_at", { ascending: true })
            .limit(10);

        const history = (historyRows ?? []).map((row) => ({
            role: row.role as "user" | "assistant",
            content: row.content,
        }));

        // ── STEP 7: RAG Pipeline (search + generate) ──
        const { answer, sources } = await generateAnswer(message, history, courseId);

        // ── STEP 8: Save AI Response ──
        await supabase.from("messages").insert({
            conversation_id: activeConversationId,
            role: "assistant",
            content: answer,
            sources: sources,
        });

        // ── STEP 9: Update Conversation Timestamp ──
        await supabase
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", activeConversationId);

        // ── STEP 10: Return Response ──
        return NextResponse.json({
            answer,
            sources,
            conversationId: activeConversationId,
        });

    } catch (err: unknown) {
        console.error("[/api/chat] ERROR:", err instanceof Error ? err.message : "Unknown error");
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
```

**Input validation details:**

| Check | What it prevents |
|-------|------------------|
| `typeof message !== "string"` | Non-string payloads (arrays, objects, numbers) |
| `message.trim().length === 0` | Empty or whitespace-only messages |
| `message.length > 5000` | Excessively long messages (token limit protection) |
| `/^[0-9a-f-]{36}$/.test(courseId)` | SQL injection via courseId — must be valid UUID format |
| `/^[0-9a-f-]{36}$/.test(conversationId)` | SQL injection via conversationId |
| `.eq("user_id", user.id)` on conversations | Users can't access other users' conversations |

---

## 4.9 RAG Pipeline

### 4.9.1 What is RAG?

RAG (Retrieval-Augmented Generation) is a technique where:
1. **Retrieve** relevant documents from a knowledge base using similarity search
2. **Augment** the AI prompt with those documents as context
3. **Generate** an answer using the LLM with the augmented context

This prevents the AI from hallucinating and grounds answers in actual KTU syllabus content.

### 4.9.2 Semantic Search — `lib/rag/search.ts`

```typescript
// lib/rag/search.ts
import OpenAI from "openai";
import { createServiceClient } from "@/lib/supabase/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface SyllabusMatch {
    id: string;
    content: string;
    similarity: number;
    metadata: {
        module_number?: number;
        topic?: string;
        course_code?: string;
        course_name?: string;
    };
}

export async function searchSyllabus(
    query: string,
    courseId?: string,
    matchCount: number = 5,
    matchThreshold: number = 0.5
): Promise<SyllabusMatch[]> {
    // ── STEP A: Embed the user's question ──
    const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: query.trim(),
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;   // 1536 floats

    // Convert to pgvector string format: "[0.123,0.456,...]"
    const embeddingStr = `[${queryEmbedding.join(",")}]`;

    // ── STEP B: Call match_syllabus() RPC via PostgREST ──
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/match_syllabus`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": serviceKey,
            "Authorization": `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
            query_embedding: embeddingStr,
            match_threshold: matchThreshold,
            match_count: matchCount,
            filter_course_id: courseId ?? null,
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error("[searchSyllabus] RPC error:", response.status, errText);
        return [];
    }

    const data = await response.json();
    return (data as SyllabusMatch[]) ?? [];
}
```

**Step-by-step flow:**

```
User question: "What is polymorphism in Java?"
    │
    ▼
Step A: OpenAI Embedding
    Input: "What is polymorphism in Java?"
    Model: text-embedding-3-small
    Output: [0.0123, -0.0456, 0.0789, ... ] (1536 floats)
    │
    ▼
Step B: pgvector Similarity Search
    Call: POST /rest/v1/rpc/match_syllabus
    Body: {
        query_embedding: "[0.0123,-0.0456,0.0789,...]",
        match_threshold: 0.5,
        match_count: 5,
        filter_course_id: null
    }
    │
    ▼
PostgreSQL executes:
    SELECT id, content, 1 - (embedding <=> query_embedding) AS similarity, metadata
    FROM syllabus_embeddings
    WHERE 1 - (embedding <=> query_embedding) > 0.5
    ORDER BY embedding <=> query_embedding
    LIMIT 5
    │
    ▼
Returns: [
    {
        id: "abc-123",
        content: "Polymorphism means 'many forms'. In Java, polymorphism allows...",
        similarity: 0.89,
        metadata: { module_number: 2, topic: "Polymorphism", course_code: "PBCST304", course_name: "OOPs" }
    },
    // ... up to 5 results
]
```

**Why direct fetch instead of Supabase SDK?**
The Supabase JS SDK doesn't handle pgvector's `VECTOR(1536)` type well — it can cause type serialization issues. Using a direct HTTP fetch to PostgREST bypasses this entirely and gives reliable results. The **service role key** is used to bypass RLS since `match_syllabus()` needs to access all embeddings, not just the current user's.

### 4.9.3 Context Formatter — `formatContext()`

```typescript
export function formatContext(matches: SyllabusMatch[]): string {
    if (matches.length === 0) return "";

    return matches
        .map((m, i) => {
            const meta = m.metadata;
            const header = [
                meta.course_name && `Course: ${meta.course_name}`,
                meta.module_number && `Module ${meta.module_number}`,
                meta.topic && `Topic: ${meta.topic}`,
            ]
                .filter(Boolean)
                .join(" | ");
            return `[Reference ${i + 1}] ${header}\n${m.content}`;
        })
        .join("\n\n---\n\n");
}
```

**Example output:**

```
[Reference 1] Course: OOPs | Module 2 | Topic: Polymorphism
Polymorphism means 'many forms'. In Java, polymorphism allows objects to take on
multiple forms. There are two types: compile-time (method overloading) and
runtime (method overriding)...

---

[Reference 2] Course: OOPs | Module 2 | Topic: Method Overriding
Method overriding occurs when a subclass provides a specific implementation of a
method that is already provided by its parent class...
```

---

### 4.9.4 Answer Generation — `lib/rag/generate.ts`

```typescript
// lib/rag/generate.ts
import OpenAI from "openai";
import { searchSyllabus, formatContext } from "./search";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function buildSystemPrompt(syllabusContext: string): string {
    const hasContext = syllabusContext.trim().length > 0;
    const contextBlock = hasContext
        ? `\n\nRELEVANT SYLLABUS CONTENT:\n${syllabusContext}`
        : "\n\n(No specific syllabus content matched for this query.)";

    return `You are an AI study assistant for APJ Abdul Kalam Technological University (KTU) 
students in Kerala, India. The subject is Object Oriented Programming using Java (S3, PBCST304).

STRICT RULES:
1. Answer ONLY based on the KTU syllabus content provided below. Do not use outside knowledge.
2. If the question is outside the provided syllabus, say: "This topic doesn't appear to be 
   in the OOPs syllabus. Please check if you've selected the right subject."
3. Structure answers to match KTU exam answer patterns:
   - Part A (2 marks): 2-4 sentence direct definition/answer.
   - Part B (9 marks): Detailed explanation with subpoints, syntax, and a code example.
   - Part C (18 marks): Comprehensive answer with code, comparison tables, all aspects covered.
4. Always mention which MODULE the topic belongs to.
5. For definitions, start with a clean one-line definition, then expand.
6. For comparisons, always use a markdown table.
7. If asked for "important questions" or "likely exam topics", list key topics with frequency.
8. Never make up facts, code, or definitions not in the syllabus content.
${contextBlock}`;
}

export async function generateAnswer(
    message: string,
    history: ChatMessage[],
    courseId?: string
): Promise<GenerateAnswerResult> {
    // ── STEP 1: Search syllabus for relevant content ──
    const matches = await searchSyllabus(message, courseId);

    // ── STEP 2: Format matches into context string ──
    const syllabusContext = formatContext(matches);

    // ── STEP 3: Build the system prompt ──
    const systemPrompt = buildSystemPrompt(syllabusContext);

    // ── STEP 4: Build the full message array for GPT ──
    const recentHistory = history.slice(-10);  // Last 10 messages for context

    const conversationMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...recentHistory.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
        })),
        { role: "user", content: message },
    ];

    // ── STEP 5: Call GPT-4o-mini ──
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: conversationMessages,
        max_tokens: 1500,
        temperature: 0.3,       // Low temperature = more deterministic, factual answers
    });

    const answer = completion.choices[0]?.message?.content
        ?? "Sorry, I couldn't generate a response. Please try again.";

    // ── STEP 6: Format source citations ──
    const sources = matches.map((m) => ({
        course_code: m.metadata.course_code ?? m.metadata.course_name ?? "OOPs",
        module: m.metadata.module_number != null ? `Module ${m.metadata.module_number}` : "General",
        topic: m.metadata.topic ?? "General",
        similarity: Math.round(m.similarity * 100) / 100,
    }));

    return { answer, sources };
}
```

**The message array sent to GPT-4o-mini looks like:**

```json
[
    {
        "role": "system",
        "content": "You are an AI study assistant for KTU...\n\nRELEVANT SYLLABUS CONTENT:\n[Reference 1] Course: OOPs | Module 2 | Topic: Polymorphism\nPolymorphism means..."
    },
    { "role": "user", "content": "What are the types of polymorphism?" },
    { "role": "assistant", "content": "In Java, there are two types of polymorphism..." },
    { "role": "user", "content": "Can you give a code example for method overriding?" }
]
```

**GPT parameters:**

| Parameter | Value | Why |
|-----------|-------|-----|
| `model` | `gpt-4o-mini` | Cost-effective, fast, good quality for educational content |
| `max_tokens` | `1500` | Enough for detailed Part B/C exam answers, prevents runaway responses |
| `temperature` | `0.3` | Low temperature = more factual, less creative. Ideal for exam answers where accuracy matters |

### 4.9.5 Complete RAG Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        RAG PIPELINE                                     │
│                                                                         │
│  User Question: "Explain method overriding in Java"                     │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │  STEP 1: EMBED (lib/rag/search.ts)                         │       │
│  │                                                             │       │
│  │  OpenAI text-embedding-3-small                              │       │
│  │  "Explain method overriding in Java"                        │       │
│  │      → [0.0123, -0.0456, 0.0789, ... 1536 floats]         │       │
│  └──────────────────────────┬──────────────────────────────────┘       │
│                             │                                           │
│                             ▼                                           │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │  STEP 2: SEARCH (PostgreSQL match_syllabus RPC)             │       │
│  │                                                             │       │
│  │  Cosine similarity: 1 - (embedding <=> query_embedding)     │       │
│  │  Filter: similarity > 0.5                                   │       │
│  │  Limit: 5 results                                           │       │
│  │                                                             │       │
│  │  Results:                                                   │       │
│  │  ┌──────────────────────────────────────────────────┐       │       │
│  │  │ 1. Module 2 - Polymorphism (similarity: 0.89)    │       │       │
│  │  │ 2. Module 2 - Method Overriding (similarity: 0.85)│      │       │
│  │  │ 3. Module 3 - Abstract Classes (similarity: 0.72) │      │       │
│  │  └──────────────────────────────────────────────────┘       │       │
│  └──────────────────────────┬──────────────────────────────────┘       │
│                             │                                           │
│                             ▼                                           │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │  STEP 3: FORMAT CONTEXT (formatContext)                     │       │
│  │                                                             │       │
│  │  [Reference 1] Course: OOPs | Module 2 | Topic: Polymorphism│      │
│  │  Polymorphism means 'many forms'...                         │       │
│  │  ---                                                        │       │
│  │  [Reference 2] Course: OOPs | Module 2 | Topic: Overriding │       │
│  │  Method overriding occurs when a subclass...                │       │
│  └──────────────────────────┬──────────────────────────────────┘       │
│                             │                                           │
│                             ▼                                           │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │  STEP 4: BUILD PROMPT (buildSystemPrompt)                   │       │
│  │                                                             │       │
│  │  System: "You are an AI study assistant for KTU..."         │       │
│  │        + STRICT RULES (8 rules)                             │       │
│  │        + RELEVANT SYLLABUS CONTENT (formatted context)      │       │
│  │                                                             │       │
│  │  History: last 10 messages from conversation                │       │
│  │                                                             │       │
│  │  User: "Explain method overriding in Java"                  │       │
│  └──────────────────────────┬──────────────────────────────────┘       │
│                             │                                           │
│                             ▼                                           │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │  STEP 5: GENERATE (GPT-4o-mini)                             │       │
│  │                                                             │       │
│  │  model: gpt-4o-mini                                         │       │
│  │  temperature: 0.3 (factual)                                 │       │
│  │  max_tokens: 1500                                           │       │
│  │                                                             │       │
│  │  Output: "**Method Overriding** (Module 2)                  │       │
│  │          Method overriding is a feature that allows a       │       │
│  │          subclass to provide a specific implementation..."   │       │
│  └──────────────────────────┬──────────────────────────────────┘       │
│                             │                                           │
│                             ▼                                           │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │  STEP 6: RETURN                                             │       │
│  │                                                             │       │
│  │  {                                                          │       │
│  │    answer: "**Method Overriding** (Module 2)...",           │       │
│  │    sources: [                                               │       │
│  │      { course_code: "PBCST304", module: "Module 2",        │       │
│  │        topic: "Polymorphism", similarity: 0.89 },           │       │
│  │      { course_code: "PBCST304", module: "Module 2",        │       │
│  │        topic: "Method Overriding", similarity: 0.85 }       │       │
│  │    ]                                                        │       │
│  │  }                                                          │       │
│  └─────────────────────────────────────────────────────────────┘       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

*End of Part 4.*

---

# Part 5: API Routes, Types & Utilities

## 5.1 API Routes Overview

All API routes follow the same security pattern:

```
1. Authenticate user (Supabase session from cookies)
2. Rate limit check (Upstash Redis sliding window)
3. Validate inputs (type checks, length limits, UUID format)
4. Execute business logic
5. Return JSON response
```

### API Routes Summary Table

| Route | Method | Auth | Rate Limit | Purpose |
|-------|--------|------|------------|---------|
| `/api/chat` | POST | Required | 20/60s per user | AI chat with RAG (covered in Part 4) |
| `/api/search` | POST | Required | 30/60s per user | Standalone semantic search |
| `/api/profile` | GET | Required | 30/60s per user | Fetch user profile + stats |
| `/api/profile` | PUT | Required | 10/60s per user | Update user profile |
| `/api/courses` | GET | Public | 60/60s per IP | Paginated course listing |
| `/api/patterns` | GET | Public | 60/60s per IP | Paginated exam patterns |
| `/api/study-time` | POST | Required | 30/60s per user | Increment study time |
| `/auth/callback` | GET | — | — | PKCE code exchange (covered in Part 2) |

---

## 5.2 Profile API — `app/api/profile/route.ts`

### GET — Fetch Profile + Statistics

```typescript
// app/api/profile/route.ts
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limit: 30 req / 60s
    const rateResult = await checkRateLimit(`profile-read:${user.id}`, PROFILE_READ_RATE_LIMIT);
    if (!rateResult.allowed) { return NextResponse.json({ error: "Too many requests." }, { status: 429 }); }

    // 1. Fetch the full user_profiles row
    const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    // 2. Count total questions asked by this user
    // Uses an inner join: messages → conversations (filtered by user_id)
    const { count: questionCount } = await supabase
        .from("messages")
        .select("*, conversations!inner(user_id)", { count: "exact", head: true })
        .eq("role", "user")
        .eq("conversations.user_id", user.id);

    // 3. Get study time from profile
    const totalStudyTime = Math.round(profile?.study_time_minutes || 0);

    // 4. Get top subject from user_progress
    const { data: progressData } = await supabase
        .from("user_progress")
        .select("course_id, courses(course_name)")
        .eq("user_id", user.id)
        .order("study_time_minutes", { ascending: false })
        .limit(1);

    const topSubject = progressData?.[0]
        ? (progressData[0] as unknown as { courses: { course_name: string } })?.courses?.course_name || "N/A"
        : "N/A";

    // 5. Return combined response
    return NextResponse.json({
        profile: profile || {
            full_name: user.user_metadata?.full_name || "",
            email: user.email || "",
            college_name: "", branch: "", semester: 1,
        },
        stats: {
            questions: questionCount || 0,
            studyTime: totalStudyTime,
            favSubject: topSubject,
        },
    });
}
```

**What it returns:**

```json
{
    "profile": {
        "id": "user-uuid",
        "full_name": "John Doe",
        "email": "john@example.com",
        "college_name": "College of Engineering, Trivandrum",
        "branch": "Computer Science & Engineering",
        "semester": 3,
        "study_time_minutes": 42.5,
        "onboarding_completed": true,
        "created_at": "2026-03-15T10:30:00Z",
        "updated_at": "2026-04-05T14:20:00Z"
    },
    "stats": {
        "questions": 47,
        "studyTime": 43,
        "favSubject": "Object Oriented Programming"
    }
}
```

**The question count query explained:**
```sql
-- Supabase SDK translates this to:
SELECT count(*) FROM messages 
  INNER JOIN conversations ON messages.conversation_id = conversations.id
WHERE messages.role = 'user'
  AND conversations.user_id = 'user-uuid';
```
This counts only user messages (not AI responses) in the user's own conversations.

**Connected to:**
- `app/(dashboard)/profile/page.tsx` → fetches this on mount to populate the profile form
- `supabase/schema.sql` → `user_profiles`, `messages`, `conversations`, `user_progress` tables

---

### PUT — Update Profile

```typescript
export async function PUT(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limit: 10 req / 60s (stricter for writes)
    const rateResult = await checkRateLimit(`profile:${user.id}`, PROFILE_RATE_LIMIT);
    if (!rateResult.allowed) { return NextResponse.json({ error: "Too many requests." }, { status: 429 }); }

    const body = await request.json();
    const { full_name, college_name, branch, semester } = body;

    // ── Input Validation ──
    if (typeof full_name !== "string" || full_name.trim().length < 2 || full_name.length > 100) {
        return NextResponse.json({ error: "Name must be 2-100 characters" }, { status: 400 });
    }
    if (typeof college_name !== "string" || college_name.length > 200) {
        return NextResponse.json({ error: "Invalid college name" }, { status: 400 });
    }
    if (typeof branch !== "string" || branch.length > 50) {
        return NextResponse.json({ error: "Invalid department" }, { status: 400 });
    }
    const semesterNum = Number(semester);
    if (!Number.isInteger(semesterNum) || semesterNum < 1 || semesterNum > 8) {
        return NextResponse.json({ error: "Semester must be 1-8" }, { status: 400 });
    }

    // ── Update user_profiles table ──
    await supabase.from("user_profiles").upsert({
        id: user.id,
        full_name: full_name.trim(),
        email: user.email || "",
        college_name: college_name.trim(),
        branch: branch.trim(),
        semester: semesterNum,
        onboarding_completed: true,
    });

    // ── Also update auth.users.user_metadata ──
    const serviceClient = await createServiceClient();
    await serviceClient.auth.admin.updateUserById(user.id, {
        user_metadata: {
            ...user.user_metadata,
            full_name: full_name.trim(),
        },
    });

    return NextResponse.json({ success: true, profile: { ... } });
}
```

**Why two database writes?**

1. **`user_profiles` table update** — The main profile data store (RLS: user can only update their own row)
2. **`auth.users.user_metadata` update** — This updates Supabase Auth's internal user record so that `supabase.auth.getUser()` returns the updated name. This uses the **service role client** because only admin operations can update auth user metadata.

**Input validation table:**

| Field | Type Check | Length Limit | Range Check |
|-------|-----------|--------------|-------------|
| `full_name` | `typeof === "string"` | 2-100 chars | — |
| `college_name` | `typeof === "string"` | max 200 chars | — |
| `branch` | `typeof === "string"` | max 50 chars | — |
| `semester` | `Number.isInteger()` | — | 1-8 |

**Connected to:**
- `app/(dashboard)/profile/page.tsx` → calls PUT when user submits profile form
- `lib/supabase/server.ts` → `createClient()` for profile update, `createServiceClient()` for auth metadata update

---

## 5.3 Courses API — `app/api/courses/route.ts`

```typescript
// app/api/courses/route.ts
const COURSES_RATE_LIMIT = { maxRequests: 60, windowSeconds: 60 };
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
    const supabase = await createClient();

    // IP-based rate limiting (public route, no auth required)
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
    const rateResult = await checkRateLimit(`courses:${ip}`, COURSES_RATE_LIMIT);
    if (!rateResult.allowed) { return NextResponse.json({ error: "Too many requests." }, { status: 429 }); }

    const { searchParams } = new URL(request.url);
    const semester = searchParams.get("semester");
    const limitParam = Number(searchParams.get("limit") ?? DEFAULT_LIMIT);
    const offsetParam = Number(searchParams.get("offset") ?? 0);

    // Clamp pagination params
    const limit = Math.min(Math.max(1, limitParam), MAX_LIMIT);
    const offset = Math.max(0, offsetParam);

    let query = supabase
        .from("courses")
        .select("*", { count: "exact" })
        .order("semester")
        .order("course_code")
        .range(offset, offset + limit - 1);

    // Optional filter by semester
    if (semester) {
        const s = Number(semester);
        if (!Number.isInteger(s) || s < 1 || s > 8) {
            return NextResponse.json({ error: "Invalid semester. Must be 1-8." }, { status: 400 });
        }
        query = query.eq("semester", s);
    }

    const { data, error, count } = await query;

    return NextResponse.json({
        courses: data || [],
        total: count ?? 0,
        limit,
        offset,
    });
}
```

**Key details:**
- **Public route** — No auth required (middleware allows `/api/courses` without session)
- **IP-based rate limiting** — Uses `x-forwarded-for` header since there's no user ID
- **Pagination** — `limit` (clamped to 1-100) and `offset` (min 0) query params
- **Optional semester filter** — `?semester=3` returns only semester 3 courses
- **Sorted by** semester first, then course code

**Example request & response:**

```
GET /api/courses?semester=3&limit=10&offset=0

{
    "courses": [
        {
            "id": "uuid",
            "course_code": "PBCST304",
            "course_name": "Object Oriented Programming",
            "semester": 3,
            "credits": 3,
            "department": "CSE",
            "description": "...",
            "module_count": 4
        }
    ],
    "total": 1,
    "limit": 10,
    "offset": 0
}
```

**Connected to:**
- `app/(dashboard)/courses/page.tsx` → fetches and displays the course catalog
- `supabase/schema.sql` → `courses` table (public SELECT via RLS)

---

## 5.4 Patterns API — `app/api/patterns/route.ts`

```typescript
// app/api/patterns/route.ts
export async function GET(request: NextRequest) {
    // ... same IP-based rate limiting as courses ...

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const limit = Math.min(Math.max(1, limitParam), MAX_LIMIT);
    const offset = Math.max(0, offsetParam);

    let query = supabase
        .from("question_patterns")
        .select("*, course:courses(*)", { count: "exact" })
        .order("total_frequency", { ascending: false })        // Most frequent first
        .range(offset, offset + limit - 1);

    if (courseId) {
        // Validate UUID format (full regex)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(courseId)) {
            return NextResponse.json({ error: "Invalid course ID format" }, { status: 400 });
        }
        query = query.eq("course_id", courseId);
    }

    return NextResponse.json({
        patterns: data || [],
        total: count ?? 0,
        limit,
        offset,
    });
}
```

**Key differences from Courses API:**
- Queries `question_patterns` table instead of `courses`
- Joins with `courses` via `course:courses(*)` to include course details
- Filters by `courseId` (UUID) instead of `semester` (integer)
- Sorted by `total_frequency` descending (most asked topics first)
- UUID validation uses the full format regex (`/^[0-9a-f]{8}-...$/i`)

**Connected to:**
- `app/(dashboard)/patterns/page.tsx` → displays exam question frequency analysis
- `supabase/schema.sql` → `question_patterns` + `courses` tables

---

## 5.5 Study Time API — `app/api/study-time/route.ts`

```typescript
// app/api/study-time/route.ts
export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limit: 30 req / 60s
    const rateResult = await checkRateLimit(`study-time:${user.id}`, STUDY_TIME_RATE_LIMIT);
    if (!rateResult.allowed) { return NextResponse.json({ error: "Too many requests." }, { status: 429 }); }

    const body = await request.json();
    const seconds = Number(body.seconds);

    // Validate: positive number, max 300 seconds (5 minutes) per save
    if (!Number.isFinite(seconds) || seconds < 1 || seconds > 300) {
        return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
    }

    const minutesToAdd = seconds / 60;  // Convert to fractional minutes

    // Atomic increment via PostgreSQL RPC
    const { error } = await supabase.rpc("increment_study_time", {
        user_uuid: user.id,
        minutes_to_add: minutesToAdd,
    });

    // Fallback: if Supabase SDK RPC fails, try direct PostgREST fetch
    if (error) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const fallbackRes = await fetch(`${supabaseUrl}/rest/v1/rpc/increment_study_time`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({ user_uuid: user.id, minutes_to_add: minutesToAdd }),
        });
        if (!fallbackRes.ok) {
            console.error("[study-time] Fallback RPC failed:", await fallbackRes.text());
        }
    }

    return NextResponse.json({ success: true });
}
```

**Why max 300 seconds?**
The `useStudyTimer` hook saves every 60 seconds and on visibility changes. A single save should never exceed ~60-70 seconds of accumulated time. The 300-second cap prevents abuse (e.g., someone sending `{ seconds: 999999 }` to inflate their study time).

**Why `Number.isFinite()`?**
`Number.isFinite()` rejects `NaN`, `Infinity`, and `-Infinity` — all of which would pass a simple `seconds > 0` check.

**Fallback mechanism:**
If the Supabase SDK's `.rpc()` call fails (which can happen with serialization issues), the route falls back to a direct HTTP `fetch` to PostgREST's RPC endpoint. This double-try ensures reliable time tracking.

**Connected to:**
- `hooks/useStudyTimer.ts` → `flush()` sends POST to this endpoint
- `hooks/useStudyTimer.ts` → `handleBeforeUnload` sends via `navigator.sendBeacon()`
- `supabase/migrations/add_study_time.sql` → `increment_study_time()` RPC function

---

## 5.6 Search API — `app/api/search/route.ts`

This is a **standalone semantic search** endpoint — separate from the chat. It allows searching the syllabus without generating an AI answer.

```typescript
// app/api/search/route.ts
export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 30 req / 60s
    const rateResult = await checkRateLimit(`search:${user.id}`, SEARCH_RATE_LIMIT);

    const body = await req.json();
    const query: string = body.query;
    const courseId: string | undefined = body.courseId;

    // Validate
    if (!query || typeof query !== "string" || query.trim().length === 0) {
        return NextResponse.json({ error: "Query is required." }, { status: 400 });
    }
    if (query.length > 1000) {
        return NextResponse.json({ error: "Query too long." }, { status: 400 });
    }
    if (courseId && !/^[0-9a-f-]{36}$/.test(courseId)) {
        return NextResponse.json({ error: "Invalid courseId." }, { status: 400 });
    }

    // Call RAG search (embed + pgvector similarity)
    const matches = await searchSyllabus(query, courseId);
    const context = formatContext(matches);

    return NextResponse.json({ matches, context });
}
```

**Difference from `/api/chat`:**
- `/api/search` → Only does Step 1 (embed) + Step 2 (search) of the RAG pipeline. Returns raw matches.
- `/api/chat` → Full pipeline: embed → search → format → prompt → GPT → save to DB.

**Use case:** Useful for a "search syllabus" feature where users want to find content without waiting for an AI response. Can also be used by future features like "related topics" or "study recommendations".

**Connected to:**
- `lib/rag/search.ts` → `searchSyllabus()` and `formatContext()`

---

## 5.7 Types & Constants — `types/index.ts`

This file contains all TypeScript interfaces and constant data used throughout the application.

```typescript
// types/index.ts

// ---- Core Data Types ----

export interface Message {
    id: string;
    conversation_id: string;
    role: "user" | "assistant";
    content: string;
    sources?: Array<{
        course_code: string;
        module: string;
        topic: string;
        similarity: number;
    }>;
    created_at: string;
}

export interface Conversation {
    id: string;
    user_id: string;
    title: string;
    course_id?: string;
    created_at: string;
    updated_at: string;
}

export interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    college_name: string;
    graduation_year: number;
    branch: string;
    semester: number;
    referral_source?: string;
    onboarding_completed: boolean;
    study_time_minutes: number;
    created_at: string;
    updated_at: string;
}

export interface Course {
    id: string;
    course_code: string;
    course_name: string;
    semester: number;
    credits: number;
    department: string;
    description?: string;
    module_count: number;
    created_at: string;
}

// ---- Constants ----

export const DEPARTMENTS = [
    { id: "CSE", name: "Computer Science & Engineering", shortName: "CSE", icon: "⚙️" },
    { id: "CE", name: "Civil Engineering", shortName: "CE", icon: "🏗️" },
    { id: "ME", name: "Mechanical Engineering", shortName: "ME", icon: "🔧" },
    { id: "EEE", name: "Electrical & Electronics Engineering", shortName: "EEE", icon: "⚡" },
    { id: "ECE", name: "Electronics & Communication Engineering", shortName: "ECE", icon: "📡" },
];

export const REFERRAL_OPTIONS = [
    { id: "friend", label: "👥 Friend or Classmate" },
    { id: "instagram", label: "📱 Instagram" },
    { id: "whatsapp", label: "💬 WhatsApp / Telegram" },
    { id: "google", label: "🔍 Google Search" },
    { id: "facebook", label: "📘 Facebook" },
    { id: "college", label: "🎓 College Notice / Poster" },
    { id: "other", label: "📰 Other" },
];

export const KTU_COLLEGES = [
    "College of Engineering, Trivandrum (CET)",
    "Government Engineering College, Thrissur (GECT)",
    "Government Engineering College, Barton Hill",
    "TKM College of Engineering, Kollam",
    "Model Engineering College, Kochi (MEC)",
    // ... 130+ KTU-affiliated engineering colleges
    "Other",
];
```

**Who uses what:**

| Type / Constant | Used By |
|-----------------|---------|
| `Message` | `ChatInterface`, `MessageList`, `Message`, `/api/chat` |
| `Conversation` | `RecentChats`, `ChatItem` |
| `UserProfile` | `/api/profile`, `UserProfile` sidebar, profile page |
| `Course` | `/api/courses`, courses page |
| `DEPARTMENTS` | `DepartmentCards` (onboarding step 2) |
| `REFERRAL_OPTIONS` | `ReferralOptions` (onboarding step 4) |
| `KTU_COLLEGES` | `CollegeSelector` (onboarding step 1) |

---

## 5.8 Utility Functions — `lib/utils.ts`

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes intelligently (resolves conflicts like "p-2 p-4" → "p-4")
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// "John Doe" → "JD", "Alice" → "A"
export function getInitials(name: string): string {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// "A very long string that goes on..." → "A very long str..."
export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + "...";
}

// "2026-04-05T14:20:00Z" → "5 Apr 2026" (Indian English locale)
export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(date));
}
```

**`cn()` explained in depth:**
```typescript
cn("p-4", "p-2")                    // → "p-2" (tailwind-merge resolves conflict)
cn("text-red-500", false && "hidden") // → "text-red-500" (clsx removes falsy values)
cn("bg-gray-100", isActive && "bg-indigo-50") // Conditional classes + merge
```

This is the most-used utility in the codebase — every component with conditional Tailwind classes uses it.

**Connected to:** Used by `NavigationLinks`, `ChatItem`, `Message`, `InputBox`, and every component with conditional styling.

---

*End of Part 5.*

---

# Part 6: Data Seeding, Rate Limiter, File Connections & User Flow

## 6.1 Rate Limiter — `lib/rate-limit.ts`

Every API route uses this module for rate limiting via Upstash Redis.

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitConfig {
    maxRequests: number;
    windowSeconds: number;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
}

// Lazily create Redis client — missing env vars in dev don't crash at import time
let redis: Redis | null = null;
function getRedis(): Redis | null {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return null;
    }
    if (!redis) {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    }
    return redis;
}

// Cache limiters by config to avoid recreating on every request
const limiterCache = new Map<string, Ratelimit>();

function getLimiter(config: RateLimitConfig): Ratelimit | null {
    const r = getRedis();
    if (!r) return null;

    const cacheKey = `${config.maxRequests}:${config.windowSeconds}`;
    if (!limiterCache.has(cacheKey)) {
        limiterCache.set(cacheKey, new Ratelimit({
            redis: r,
            limiter: Ratelimit.slidingWindow(config.maxRequests, `${config.windowSeconds} s`),
            analytics: false,
        }));
    }
    return limiterCache.get(cacheKey)!;
}

export async function checkRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const limiter = getLimiter(config);

    // Graceful degradation: if Redis not configured, allow all requests
    if (!limiter) {
        console.warn("[RateLimit] Upstash Redis not configured — rate limiting is disabled.");
        return { allowed: true, remaining: config.maxRequests, resetAt: Date.now() + config.windowSeconds * 1000 };
    }

    try {
        const result = await limiter.limit(key);
        return { allowed: result.success, remaining: result.remaining, resetAt: result.reset };
    } catch (err) {
        // If Upstash is unreachable, degrade gracefully
        console.warn("[RateLimit] Upstash error, allowing request:", err instanceof Error ? err.message : err);
        return { allowed: true, remaining: config.maxRequests, resetAt: Date.now() + config.windowSeconds * 1000 };
    }
}
```

**Key architectural patterns:**

1. **Lazy initialization** — Redis client is only created when the first rate limit check happens, not at module import. This prevents crashes during local development when env vars are missing.

2. **Limiter cache** — `Map<string, Ratelimit>` ensures limiters with the same config (`20:60`, `30:60`, etc.) are created only once and reused. This is critical in serverless environments where each cold start would otherwise create new limiter instances.

3. **Sliding window** — `Ratelimit.slidingWindow(20, "60 s")` uses a sliding window algorithm (not fixed windows). This prevents the "burst at boundary" problem where a user could send 20 requests at 0:59 and 20 more at 1:01 — effectively 40 in 2 seconds.

4. **Graceful degradation** — Two levels of fallback:
   - No env vars → allow all (local dev without Redis)
   - Redis unreachable → allow all (prevents downtime from Redis outages)

**Connected to:** Every API route (`/api/chat`, `/api/profile`, `/api/courses`, `/api/patterns`, `/api/study-time`, `/api/search`)

---

## 6.2 Data Seeding Script — `scripts/seed-syllabus.ts`

This is a standalone TypeScript script that populates the database with syllabus content for the RAG pipeline.

### Architecture

```
scripts/seed-syllabus.ts
    │
    ├── SYLLABUS_DATA constant (hardcoded)
    │   ├── Course: PBCST304 (Object Oriented Programming)
    │   ├── 4 Modules × ~6-8 topics each = ~26 topic chunks
    │   └── Each topic: 200-500 word description of the syllabus content
    │
    ├── buildChunks() → flattens modules/topics into embeddable chunks
    │
    ├── seedCourseAndModules() → upserts course + modules into DB
    │
    └── embedAndInsert() → embeds all chunks via OpenAI, inserts into syllabus_embeddings
```

### Key Functions

```typescript
// 1. Build embeddable chunks from nested syllabus structure
function buildChunks(courses: CourseEntry[]): Chunk[] {
    const chunks: Chunk[] = [];
    for (const course of courses) {
        for (const module of course.modules) {
            for (const topic of module.topics) {
                chunks.push({
                    content: topic.description,       // The text to embed
                    metadata: {                       // Stored alongside for context
                        course_id: course.course_id,
                        course_code: course.course_code,
                        course_name: course.course_name,
                        semester: course.semester,
                        module_number: module.module_number,
                        module_title: module.title,
                        topic: topic.name,
                    },
                });
            }
        }
    }
    return chunks;
}

// 2. Embed chunks in batches of 10, insert into database
async function embedAndInsert(chunks: Chunk[]): Promise<void> {
    const BATCH_SIZE = 10;
    let inserted = 0;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);

        // Batch embed all texts in one API call
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: batch.map((c) => c.content),
        });

        // Build rows for Supabase insert
        const rows = batch.map((chunk, idx) => ({
            course_id: chunk.metadata.course_id,
            content: chunk.content,
            embedding: embeddingResponse.data[idx].embedding,  // 1536 floats
            metadata: chunk.metadata,
        }));

        // Insert into syllabus_embeddings table
        const { error } = await supabase.from("syllabus_embeddings").insert(rows);

        if (error) console.error(`[FAILED] Batch ${Math.floor(i / BATCH_SIZE) + 1}`);
        else {
            inserted += batch.length;
            console.log(`[OK] Batch ${Math.floor(i / BATCH_SIZE) + 1} — ${inserted}/${chunks.length}`);
        }

        // 500ms delay between batches to avoid OpenAI rate limits
        if (i + BATCH_SIZE < chunks.length) await new Promise((r) => setTimeout(r, 500));
    }
}

// 3. Main entry point
async function main() {
    // Validate environment variables
    // Upsert course into courses table
    // Upsert modules into modules table
    // Delete existing embeddings for this course (idempotent re-runs)
    // Build chunks → embed → insert
}
```

### Running the Script

```bash
npx tsx scripts/seed-syllabus.ts
```

**Output:**
```
=== KTU OOPs Syllabus Seeder ===

Upserting course and modules...
  Module 1: Introduction to Java and OOP Concepts
  Module 2: Polymorphism and Inheritance
  Module 3: Packages, Interfaces, Exception Handling, and Design Patterns
  Module 4: SOLID Principles, Swings, Event Handling, and JDBC

Clearing existing embeddings for this course...

Seeding 26 topic chunks...

  [OK] Batch 1 — 10/26 done
  [OK] Batch 2 — 20/26 done
  [OK] Batch 3 — 26/26 done

Done. 26 chunks inserted.
```

**What gets created in the database:**

| Table | Rows Created |
|-------|-------------|
| `courses` | 1 row (PBCST304 — Object Oriented Programming) |
| `modules` | 4 rows (one per module) |
| `syllabus_embeddings` | 26 rows (one per topic, each with a 1536-dim vector) |

**Idempotent**: Running the script again deletes existing embeddings first (`DELETE FROM syllabus_embeddings WHERE course_id = '...'`) and re-inserts, so it's safe to re-run.

**Connected to:**
- `supabase/schema.sql` → `courses`, `modules`, `syllabus_embeddings` tables
- `lib/rag/search.ts` → queries these embeddings during chat
- `.env.local` → reads `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

---

## 6.3 Complete File Connection Map

This map shows how every file in the project connects to every other file. It is organized by layer.

### Layer 1: Configuration & Infrastructure

```
next.config.ts
  └── Defines: CSP headers, security headers
  └── Used by: Next.js build system

.env.local (not in git)
  └── Contains: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  │             SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY,
  │             UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
  └── Read by: lib/supabase/server.ts, lib/supabase/client.ts,
               lib/rag/search.ts, lib/rag/generate.ts, lib/rate-limit.ts,
               scripts/seed-syllabus.ts

tsconfig.json
  └── Defines: "@/*" path alias → "./*"
  └── Used by: All import statements project-wide
```

### Layer 2: Supabase Clients & Middleware

```
lib/supabase/client.ts
  └── Exports: createClient() — browser Supabase client
  └── Used by: components/sidebar/RecentChats.tsx
  │            components/sidebar/UserProfile.tsx
  │            components/chat/ChatInterface.tsx

lib/supabase/server.ts
  └── Exports: createClient() — server Supabase client (cookies-based)
  │            createServiceClient() — admin/service role client
  └── Used by: app/api/chat/route.ts, app/api/profile/route.ts,
  │            app/api/courses/route.ts, app/api/patterns/route.ts,
  │            app/api/study-time/route.ts, app/api/search/route.ts,
  │            lib/supabase/middleware.ts

lib/supabase/middleware.ts
  └── Exports: updateSession() — enforces auth & onboarding
  └── Used by: middleware.ts (root)

middleware.ts
  └── Calls: updateSession() from lib/supabase/middleware.ts
  └── Matches: All routes except static assets, _next, favicon
```

### Layer 3: Shared Utilities

```
lib/utils.ts
  └── Exports: cn(), getInitials(), truncate(), formatDate()
  └── Used by: components/sidebar/NavigationLinks.tsx,
  │            components/sidebar/ChatItem.tsx,
  │            components/chat/Message.tsx,
  │            components/chat/InputBox.tsx,
  │            (and most UI components)

lib/rate-limit.ts
  └── Exports: checkRateLimit()
  └── Used by: ALL 6 API routes

types/index.ts
  └── Exports: Message, Conversation, UserProfile, Course,
  │            DEPARTMENTS, REFERRAL_OPTIONS, KTU_COLLEGES
  └── Used by: components/chat/*, components/sidebar/*,
  │            app/onboarding/*/page.tsx, app/api/chat/route.ts

lib/rag/search.ts
  └── Exports: searchSyllabus(), formatContext(), SyllabusMatch
  └── Used by: lib/rag/generate.ts, app/api/search/route.ts

lib/rag/generate.ts
  └── Exports: generateAnswer()
  └── Used by: app/api/chat/route.ts
```

### Layer 4: Auth & Onboarding Pages

```
app/(auth)/layout.tsx
  └── Wraps: login/page.tsx, signup/page.tsx
  └── Provides: centered card layout

app/(auth)/login/page.tsx → components/auth/LoginForm.tsx
  └── Calls: supabase.auth.signInWithPassword()
  └── Redirects to: /chat (on success)

app/(auth)/signup/page.tsx → components/auth/SignupForm.tsx
  └── Calls: supabase.auth.signUp()
  └── Creates: user_profiles row
  └── Redirects to: /auth/callback → /onboarding/step-1

app/auth/callback/route.ts
  └── Exchanges: PKCE code for session
  └── Checks: onboarding_completed flag
  └── Redirects to: /onboarding/step-1 or /chat

app/onboarding/layout.tsx → wraps all 4 steps
app/onboarding/step-1/page.tsx → components/onboarding/CollegeSelector.tsx
app/onboarding/step-2/page.tsx → components/onboarding/DepartmentCards.tsx
app/onboarding/step-3/page.tsx → components/onboarding/SemesterGrid.tsx
app/onboarding/step-4/page.tsx → components/onboarding/ReferralOptions.tsx
  └── All store to: localStorage("onboarding_data")
  └── Step 4 writes to: supabase.user_profiles (upsert)
```

### Layer 5: Dashboard Layout & Sidebar

```
app/(dashboard)/layout.tsx
  ├── components/sidebar/NewChatButton.tsx      → navigates to /chat
  ├── components/sidebar/NavigationLinks.tsx     → /patterns, /courses
  ├── components/sidebar/RecentChats.tsx
  │   └── components/sidebar/ChatItem.tsx
  │       └── components/sidebar/ChatItemMenu.tsx
  ├── components/sidebar/UserProfile.tsx         → /profile, signOut
  └── hooks/useStudyTimer.ts                     → POST /api/study-time
```

### Layer 6: Chat System

```
app/(dashboard)/chat/page.tsx
  └── components/chat/ChatInterface.tsx
      ├── components/chat/MessageList.tsx
      │   ├── components/chat/Message.tsx       (react-markdown, remark-gfm)
      │   └── components/chat/TypingIndicator.tsx
      ├── components/chat/InputBox.tsx
      └── POST /api/chat → lib/rag/generate.ts
                           └── lib/rag/search.ts
                               └── OpenAI text-embedding-3-small
                               └── Supabase match_syllabus() RPC
```

### Layer 7: Other Dashboard Pages

```
app/(dashboard)/courses/page.tsx  → GET /api/courses → supabase.courses
app/(dashboard)/patterns/page.tsx → GET /api/patterns → supabase.question_patterns
app/(dashboard)/profile/page.tsx  → GET /api/profile  → supabase.user_profiles
                                  → PUT /api/profile  → supabase.user_profiles + auth.users
                                  → hooks/useStudyTimer.ts (useLiveSessionSeconds)
```

### Layer 8: Database (Supabase)

```
supabase/schema.sql
  └── Tables: user_profiles, courses, modules, syllabus_embeddings,
  │           conversations, messages, question_patterns, user_progress
  └── RPC: match_syllabus(), increment_study_time()
  └── RLS: Policies on all 8 tables
  └── Extensions: pgvector (vector similarity search)

scripts/seed-syllabus.ts
  └── Populates: courses, modules, syllabus_embeddings
  └── Requires: .env.local (OPENAI_API_KEY, SUPABASE_SERVICE_ROLE_KEY)
```

---

## 6.4 User Perspective Flow — End-to-End Walkthrough

This section traces the complete user journey from first visit to active studying.

### Phase 1: First Visit

```
User visits ktu-exam-prep.vercel.app
    │
    ▼
middleware.ts intercepts request
    │ → updateSession() checks cookies
    │ → No session cookie found
    │ → Path is "/" (not in public paths list)
    │
    ▼
Redirect → /login
    │
    ▼
app/(auth)/layout.tsx renders centered card
    │
    ▼
app/(auth)/login/page.tsx renders LoginForm
    │ → User sees: "Welcome back" heading
    │ → Email input, password input
    │ → "Sign in" button
    │ → "Don't have an account? Sign up" link
    │
    ▼
User clicks "Sign up" link
    │
    ▼
app/(auth)/signup/page.tsx renders SignupForm
    │ → User enters: Full name, Email, Password
    │ → Real-time password strength meter (0-4 score)
    │ → Client-side validation (Zod-like manual checks)
    │
    ▼
User clicks "Create account"
    │
    ├── 1. supabase.auth.signUp({ email, password, fullName })
    │      → Row created in auth.users with user_metadata.full_name
    │
    ├── 2. supabase.user_profiles.insert({ id, full_name, email })
    │      → Initial profile row with onboarding_completed = false
    │
    └── 3. router.push("/auth/callback?next=/onboarding/step-1")
```

### Phase 2: Email Verification & Onboarding

```
User clicks verification link in email
    │ → URL: /auth/callback?code=XXXX
    │
    ▼
app/auth/callback/route.ts
    │ → Exchanges PKCE code for session cookies
    │ → Checks user_profiles.onboarding_completed
    │ → onboarding_completed = false
    │
    ▼
Redirect → /onboarding/step-1
    │
    ▼
Step 1: College Selection
    │ → CollegeSelector: searchable dropdown of 130+ KTU colleges
    │ → GraduationYearPicker: 2025-2030
    │ → Save to localStorage: { college_name, graduation_year }
    │ → Click "Next" → router.push("/onboarding/step-2")
    │
    ▼
Step 2: Department Selection
    │ → DepartmentCards: 5 department cards (CSE, CE, ME, EEE, ECE)
    │ → Click card → merge into localStorage: { ...prev, branch }
    │ → Auto-navigate → router.push("/onboarding/step-3")
    │
    ▼
Step 3: Semester Selection
    │ → SemesterGrid: 8 semester buttons in 2×4 grid
    │ → Click button → merge into localStorage: { ...prev, semester }
    │ → Auto-navigate → router.push("/onboarding/step-4")
    │
    ▼
Step 4: Referral + Complete
    │ → ReferralOptions: 7 options (friend, instagram, whatsapp, etc.)
    │ → Click "Get Started" button
    │
    ├── Read all data from localStorage("onboarding_data")
    ├── Validate: college_name, branch, semester all present
    ├── supabase.user_profiles.upsert({
    │       id, full_name, email, college_name, graduation_year,
    │       branch, semester, referral_source, onboarding_completed: true
    │   })
    ├── Clear localStorage("onboarding_data")
    │
    ▼
Redirect → /chat
```

### Phase 3: Dashboard & Chat

```
User arrives at /chat
    │
    ▼
middleware.ts
    │ → updateSession() refreshes session cookies
    │ → Session valid, onboarding_completed = true
    │ → Route is /chat → allowed
    │
    ▼
app/(dashboard)/layout.tsx renders
    │
    ├── <StudyTimerTracker /> mounts
    │   └── useStudyTimer() starts tracking (startSession())
    │
    ├── Sidebar loads:
    │   ├── Logo + "KTU Exam Prep"
    │   ├── [+ New Chat] button
    │   ├── Patterns | Courses navigation links
    │   ├── Recent Chats (fetches from conversations table)
    │   │   └── Subscribes to Supabase Realtime (postgres_changes)
    │   └── User Profile (fetches name, email, shows initials avatar)
    │
    └── Main content: app/(dashboard)/chat/page.tsx
        └── <ChatInterface />
            │
            ▼
        Empty state shown:
            │ → GraduationCap icon
            │ → "Start a Conversation"
            │ → 3 suggested prompts:
            │     📚 "Explain the OSI model layers"
            │     🧠 "What is Dijkstra's algorithm?"
            │     🎯 "Important topics in Data Structures"
            │ → InputBox at bottom: "Ask anything from your syllabus..."
```

### Phase 4: First Chat Message

```
User types: "What is polymorphism in Java?"
    │ → InputBox textarea expands as user types
    │ → Send button turns indigo (active)
    │
    ▼
User presses Enter (or clicks Send)
    │
    ├── 1. Optimistic UI: user message appears instantly in chat
    ├── 2. isLoading = true → TypingIndicator shows (🤖 ...)
    ├── 3. InputBox clears, send button goes gray
    │
    ▼
POST /api/chat { message: "What is polymorphism...", conversationId: null }
    │
    ├── 4. Server authenticates (session cookies)
    ├── 5. Rate limit check: chat:user-uuid → 19/20 remaining
    ├── 6. Validate: message is string, < 5000 chars
    │
    ├── 7. conversationId is null → CREATE new conversation
    │      INSERT INTO conversations (user_id, title: "What is polymorphism in Java?")
    │      → Returns new conversation UUID
    │
    ├── 8. INSERT user message into messages table
    │
    ├── 9. Fetch last 10 messages for history (just 1 message now)
    │
    ├── 10. RAG PIPELINE:
    │      a. OpenAI embed "What is polymorphism in Java?" → 1536 floats
    │      b. match_syllabus() RPC → top 5 matching chunks (similarity > 0.5)
    │         → Returns: Module 2 Polymorphism (0.89), Module 2 Overriding (0.85), etc.
    │      c. Format context: "[Reference 1] Course: OOPs | Module 2 | ..."
    │      d. Build system prompt: KTU assistant rules + syllabus context
    │      e. GPT-4o-mini generates answer (temperature 0.3, max 1500 tokens)
    │      f. Format sources: [{ course_code: "PBCST304", module: "Module 2", ... }]
    │
    ├── 11. INSERT AI response into messages (with sources JSONB)
    ├── 12. UPDATE conversations.updated_at
    │
    ▼
JSON Response: { answer: "**Polymorphism** (Module 2)...", sources: [...], conversationId: "uuid" }
    │
    ▼
ChatInterface receives response
    │
    ├── 13. AI message appears in chat (with markdown rendering)
    │       → ReactMarkdown renders headings, code blocks, tables
    │       → Source pills shown: 📄 PBCST304 Module 2
    ├── 14. URL updates: /chat → /chat?id=new-uuid (replaceState)
    ├── 15. Sidebar: "conversation-updated" event → RecentChats refetches
    │       → New conversation "What is polymorphism in..." appears at top
    ├── 16. isLoading = false → TypingIndicator hides
    └── 17. Auto-scroll to bottom (smooth)
```

### Phase 5: Continued Study

```
User continues chatting (subsequent messages)
    │ → conversationId is now set → reuses existing conversation
    │ → History grows (last 10 messages sent as context)
    │ → Each response builds on previous conversation
    │
    ▼
User explores sidebar:
    │
    ├── Click "Patterns" → /patterns page
    │   → GET /api/patterns → shows exam question frequency data
    │
    ├── Click "Courses" → /courses page
    │   → GET /api/courses?semester=3 → shows semester 3 courses
    │
    ├── Click "Profile Settings" → /profile page
    │   → GET /api/profile → shows profile + stats
    │   → Stats: 47 questions asked, 43 min study time, OOPs as fav subject
    │   → Live session timer ticking: "Session: 12:34"
    │   → Edit form → PUT /api/profile to update
    │
    └── Click [+ New Chat] → /chat (no id)
        → Empty state returns, ready for new conversation

Meanwhile, in the background:
    │
    ├── Study timer tracking:
    │   ├── Every 60s: flush() → POST /api/study-time { seconds: ~60 }
    │   │              → increment_study_time RPC: study_time_minutes += 1.0
    │   ├── Tab hidden/blur: pause + flush
    │   ├── Tab visible/focus: resume
    │   └── Tab close: sendBeacon() (fire-and-forget)
    │
    └── Sidebar updates:
        ├── Supabase Realtime: WebSocket subscription on conversations table
        └── Custom events: "conversation-updated" on new messages
```

### Phase 6: Sign Out & Return

```
User clicks their profile avatar → menu opens upward
    │
    ├── "Profile Settings" → navigates to /profile
    │
    └── "Sign Out" → supabase.auth.signOut()
        │ → Cookies cleared
        │ → router.push("/login")
        │ → router.refresh() → middleware detects no session
        │
        ▼
    Login page shown. All study time has been saved.

User returns later:
    │ → Visits the site
    │ → middleware.ts detects valid session cookie
    │ → Checks onboarding_completed → true
    │ → Redirects to /chat
    │ → Previous conversations load in sidebar
    │ → Click any conversation → messages load from database
    │ → Study timer starts fresh session
```

---

## 6.5 Security Summary

| Layer | Protection | Implementation |
|-------|-----------|----------------|
| **Transport** | HTTPS | Vercel enforces TLS |
| **Headers** | CSP, X-Frame-Options, X-Content-Type | `next.config.ts` security headers |
| **Auth** | Session cookies (httpOnly, SameSite) | `@supabase/ssr` cookie management |
| **Route protection** | Middleware intercepts all requests | `middleware.ts` → `updateSession()` |
| **API auth** | `supabase.auth.getUser()` on every request | All API routes verify session |
| **Rate limiting** | Upstash Redis sliding window | `lib/rate-limit.ts` on every route |
| **Input validation** | Type checks, length limits, UUID regex | Per-route manual validation |
| **SQL injection** | Parameterized queries via Supabase SDK | Never concatenates user input into SQL |
| **Row-level security** | PostgreSQL RLS policies | `supabase/schema.sql` — users see only their own data |
| **Open redirects** | Whitelist validation on callback `next` param | `app/auth/callback/route.ts` |
| **Error leakage** | Generic error messages to client | Real errors only logged server-side |

---

## 6.6 Environment Variables Reference

| Variable | Where Used | Purpose |
|----------|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Public anonymous key (RLS-protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin key (bypasses RLS) |
| `OPENAI_API_KEY` | Server only | OpenAI API for embeddings + chat completions |
| `UPSTASH_REDIS_REST_URL` | Server only | Upstash Redis URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Server only | Upstash Redis auth token |

---

*End of Part 6. This concludes the complete project flow documentation.*

---

# Document Summary

This document covered the **entire KTU Exam Prep AI platform** in 6 parts:

| Part | Content | Key Files |
|------|---------|-----------|
| **1** | Architecture, Config, Supabase Layer | `schema.sql`, `middleware.ts`, `server.ts`, `client.ts` |
| **2** | Auth System + Onboarding | `LoginForm`, `SignupForm`, `callback/route.ts`, Steps 1-4 |
| **3** | Dashboard Layout + Sidebar + Study Timer | `layout.tsx`, 6 sidebar components, `useStudyTimer.ts` |
| **4** | AI Chat System + RAG Pipeline | `ChatInterface`, `Message`, `search.ts`, `generate.ts`, `/api/chat` |
| **5** | API Routes + Types + Utilities | 6 API routes, `types/index.ts`, `lib/utils.ts` |
| **6** | Seeding + File Map + User Flow | `seed-syllabus.ts`, connection map, end-to-end walkthrough |

**Total files documented**: 60+  
**Total database tables**: 8  
**Total API routes**: 7  
**Total React components**: 20+  

---

*Generated on April 6, 2026 — KTU Exam Prep AI v1.0*
