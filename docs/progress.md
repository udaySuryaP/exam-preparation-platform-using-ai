# KTU Exam Prep AI — Project Progress Report

> **Generated**: March 29, 2026  
> **Version**: 0.1.0 (MVP)  
> **Repository**: `udaySuryaP/exam-preparation-platform-using-ai`

---

## Summary

| Category | Status |
|---|---|
| Overall MVP Completion | ~75% |
| Core Infrastructure | ✅ Complete |
| Authentication & Onboarding | ✅ Complete |
| Dashboard & Chat UI | ✅ Complete |
| AI Integration (OpenAI + RAG) | ❌ Not Started |
| Syllabus / Courses Data | ❌ Empty (no data populated) |
| Exam Patterns Data | ❌ Empty (no data populated) |
| Production Deployment | ❌ Not Done |

---

## ✅ Completed Features

### 1. Project Foundation
- **Next.js 16** + React 19 + TypeScript + Tailwind CSS v4 (App Router)
- Full directory scaffold: `app/`, `components/`, `lib/`, `types/`, `hooks/`, `docs/`, `supabase/`
- ESLint, PostCSS, TypeScript configured
- `.env.example` with all required environment variables documented
- Git repository with `.gitignore`

---

### 2. Database Schema (Supabase + PostgreSQL)
All 8 tables designed, deployed, and secured:

| Table | Purpose | RLS |
|---|---|---|
| `user_profiles` | User personal data, study time, onboarding status | ✅ User-scoped |
| `courses` | KTU courses by semester/department | ✅ Public read |
| `modules` | Course modules + topics | ✅ Public read |
| `conversations` | Chat threads per user | ✅ User-scoped |
| `messages` | Messages (user + assistant) with JSONB sources | ✅ User-scoped via join |
| `question_patterns` | Exam topic frequency analysis | ✅ Public read |
| `user_progress` | Per-course study progress | ✅ User-scoped |
| `syllabus_embeddings` | pgvector embeddings for AI RAG | ✅ Public read |

**Additional DB features:**
- `pgvector` extension enabled for 1536-dim embeddings
- `match_syllabus()` function for cosine-similarity vector search
- `increment_study_time()` RPC for atomic time tracking
- `update_updated_at_column()` trigger on all relevant tables
- IVFFlat index on embeddings for fast approximate search

---

### 3. Authentication System
- **Email + password signup** with Supabase Auth (SSR cookies)
- **Login form** with show/hide password toggle
- **Password strength indicator** (weak/medium/strong visual bar)
- **Real-time password match validation**
- **Session management**: cookie-based via `@supabase/ssr`, auto-refreshed in middleware
- **Route protection**: middleware guards all dashboard routes
  - Unauthenticated → redirect to `/login`
  - Authenticated on auth pages → redirect to `/chat`
  - Auth callback handler at `/auth/callback`
- **Rate limiting** on auth operations via Upstash Redis
- Friendly error messages (network error vs. wrong credentials vs. rate limit)
- Email verification is currently **disabled** for streamlined development signup

---

### 4. Onboarding Flow (4 Steps)
- **Step 1** — College (searchable dropdown, 130+ KTU colleges) + Graduation Year (2024–2030)
- **Step 2** — Branch selection via visual cards: CSE, CE, ME, EEE, ECE
- **Step 3** — Semester selection (1–8)
- **Step 4** — Referral source (Friend, Instagram, WhatsApp/Telegram, Google, etc.)
- Progress indicator component showing current step
- `localStorage` persistence between steps
- Final step POSTs all data to profile; sets `onboarding_completed = true`
- Middleware enforces: dashboard blocked until onboarding complete; completed users bounced back from `/onboarding` → `/chat`

---

### 5. Dashboard Layout & Sidebar
- Responsive layout with collapsible sidebar (hamburger on mobile, persistent on desktop)
- **Sidebar components:**
  - App logo and branding
  - New Chat button (clears messages, resets URL to `/chat`)
  - Navigation links (Patterns, Courses) with Lucide icons
  - Recent Chats list (up to 50, ordered by `updated_at`)
    - Rename conversations via inline editing
    - Delete conversations (cascades to messages)
    - Active conversation highlighting
  - User profile section (avatar initials, name, email, sign-out)
- Mobile overlay backdrop

---

### 6. AI Chat Interface
- **Message bubbles** (user vs. assistant, distinct styling)
- **Markdown rendering** for AI responses: code blocks, tables, bold/italic, GFM extensions
- **Suggested prompts** on empty state (e.g., "Explain the OSI model layers")
- **Loading spinner** while waiting for AI response
- **Regenerate last response** button
- **Optimistic UI**: message appears immediately on send
- **URL routing**: `/chat?id=<uuid>` deep-links to specific conversation
- Chat history loaded from database on revisit
- Conversation auto-created on first message
- Chat title auto-generated from first message (50-char truncation)
- Custom event system `conversation-updated` → sidebar refreshes instantly
- Supabase Realtime subscription as secondary refresh mechanism

> ⚠️ **AI responses are currently placeholder text**: `"AI responses are not enabled yet. This feature is coming soon 🚀"`. OpenAI is installed as a package but not wired up.

---

### 7. Active Study Timer
- `useStudyTimer` hook (module-level singleton, survives re-renders)
- Tracks active engagement only:
  - Pauses on `document.visibilitychange` (tab hidden)
  - Pauses on `window.blur`; resumes on `window.focus`
- Flush (save) every 60 seconds via `/api/study-time` POST
- `navigator.sendBeacon` for reliable save on tab close
- Abuse protection: max 300 seconds (5 min) per save
- Atomic DB increment via `increment_study_time` RPC (non-atomic fallback included)
- Profile page: live-ticking `HH:MM:SS` display via `useLiveSessionSeconds` hook
  - Combines DB-saved time + unsaved session time
  - Ticks every second

---

### 8. API Routes
All routes are authenticated, validated, and rate-limited:

| Route | Method | Auth | Rate Limit | Notes |
|---|---|---|---|---|
| `/api/chat` | POST | Required | 20 req/60s per user | Returns placeholder answer |
| `/api/profile` | GET | Required | 10 req/60s per user | Returns profile + stats |
| `/api/profile` | PUT | Required | 10 req/60s per user | Updates profile |
| `/api/courses` | GET | Public (IP) | 60 req/60s per IP | Paginated, semester filter |
| `/api/patterns` | GET | Public (IP) | 60 req/60s per IP | Paginated, courseId filter |
| `/api/study-time` | POST | Required | 30 req/60s per user | Atomic time increment |

---

### 9. Courses & Patterns Pages
- `/courses` — card grid UI fetching from `/api/courses`
- `/patterns` — frequency table fetching from `/api/patterns`
- Both pages are **UI-complete but show empty state** because database has no data

---

### 10. Profile Page
- Editable: Full Name, College (searchable dropdown), Department, Semester
- Email displayed (not editable)
- Avatar with name initials
- Server-side validation + sanitization on all fields
- Also updates Supabase Auth user metadata (`full_name`)
- Usage stats: **Questions Asked** + **Live Study Time**
- Toast notifications on save success/error

---

### 11. Security
- **Security HTTP headers** via `next.config.ts`:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-XSS-Protection: 1; mode=block`
  - `Permissions-Policy` (camera, microphone, geolocation disabled)
  - `Strict-Transport-Security` (HSTS, 2 years, includeSubDomains, preload)
- **Row Level Security** on all Supabase tables
- **Rate limiting** via Upstash Redis (sliding window, graceful fallback in dev)
- **Input validation**: Zod on forms, manual checks in all API routes
- **UUID validation regex** on all ID parameters
- **Content-Security-Policy (CSP)** header is NOT set (see Issues)

---

### 12. Project Documentation
All documentation files are in `docs/`:
- `PROJECT_OVERVIEW.md` — what the app is, architecture diagram, project structure
- `TECH_STACK.md` — full technology choices and rationale
- `DATA_MODEL.md` — detailed schema description
- `USER_FLOW.md` — step-by-step user journeys
- `FEATURES.md` — complete feature breakdown
- `MILESTONES.md` — build history and upcoming roadmap

---

## ❌ Not Yet Completed

### 🔴 High Priority (Blockers for functional product)

| Item | Description |
|---|---|
| **OpenAI API Integration** | `openai` package is installed and imported, but no API key wired up and no actual call made. The chat route has a `TODO` comment where GPT + RAG should be called. Every AI reply is a static placeholder. |
| **Syllabus Data Ingestion** | The `courses`, `modules`, and `syllabus_embeddings` tables are empty. The UI pages work but show no data. Actual KTU syllabus content must be ingested. |
| **Exam Pattern Data** | The `question_patterns` table is empty. The Patterns page UI works but shows no analysis. Historical KTU exam data needs to be populated. |
| **Vector Embeddings** | `syllabus_embeddings` table is schema-ready with pgvector + IVFFlat index, but zero records exist. Embeddings won't be computable until courses/modules are populated. |
| **`/api/search` Route** | Listed in the architecture diagram (`PROJECT_OVERVIEW.md`) but the route file does not exist in `app/api/search/`. |

---

### 🟡 Medium Priority

| Item | Description |
|---|---|
| **Forgot Password Flow** | No password reset page exists. `/verify-email` route exists in the auth group but no reset/forgot-password page. |
| **Email Verification** | Disabled for now. Should be re-enabled as optional 2FA. |
| **Chat Export** | No export to PDF/Markdown. |
| **Course Filtering in Chat** | No UI to link a chat to a specific course for context-aware AI answers. |
| **Full-text Search across Conversations** | UI has search in sidebar (recent chats list) but no cross-conversation full-text search. |
| **Dark Mode Toggle** | Design uses a dark theme but there is no theme toggle—it is fixed dark. |

---

### 🟢 Low Priority / Nice-to-Have

| Item | Description |
|---|---|
| **PWA Support** | No `manifest.json`, service worker, or offline caching. |
| **Push Notifications** | Not implemented. |
| **Flashcard Generation** | Not started. |
| **Practice Tests** | AI-generated mock exams—not started. |
| **Analytics Dashboard** | Study charts, streaks—not started. |
| **Multi-language Support** | Malayalam/Hindi—not started. |
| **Voice Input** | Speech-to-text—not started. |
| **Collaborative Study** | Shared sessions—not started. |
| **Production Deployment** | No Vercel config, custom domain, or CI/CD pipeline set up. |

---

## Build Timeline

| Month | Milestone |
|---|---|
| Feb 2026 | Project init, database schema, authentication system |
| Feb 2026 | Dashboard layout, chat UI, sidebar, conversation management |
| Feb 2026 | 4-step onboarding flow, college database (130+ colleges) |
| Feb 2026 | Study timer (active tracking, live HH:MM:SS display) |
| Feb–Mar 2026 | Security hardening (RLS, rate limiting, HTTP headers) |
| Mar 2026 | Full project documentation suite |

---

## Next Steps (Recommended Order)

1. **Wire up OpenAI API** — add key to `.env.local`, implement `generateAnswer()` in `/api/chat`
2. **Ingest KTU syllabus** — populate `courses`, `modules`, `syllabus_embeddings`
3. **Populate exam patterns** — add historical KTU question data to `question_patterns`
4. **Implement `/api/search`** — missing despite being in architecture docs
5. **Add Forgot Password page** — critical UX gap
6. **Deploy to Vercel** — production environment with proper env vars
