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

*End of Part 1. Part 2 will cover the Authentication System and Onboarding Flow.*
