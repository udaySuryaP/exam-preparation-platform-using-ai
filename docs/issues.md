# KTU Exam Prep AI — Issues, Bugs & Security Vulnerabilities

> **Audit Date**: March 29, 2026  
> **Auditor**: Automated codebase review  
> **Scope**: All source files in `app/`, `components/`, `lib/`, `hooks/`, `middleware.ts`, `next.config.ts`, `supabase/schema.sql`

---

## Severity Levels

| Level | Meaning |
|---|---|
| 🔴 CRITICAL | Immediate security risk or data loss potential |
| 🟠 HIGH | Significant functional or security gap |
| 🟡 MEDIUM | Notable issue that should be addressed before production |
| 🔵 LOW | Code quality / maintainability concern |
| ⚪ INFO | Observation or best-practice note |

---

## 🔴 Critical Issues

### C-1: No Content-Security-Policy (CSP) Header
**File**: `next.config.ts`  
**Description**: The security headers block sets `X-Frame-Options`, HSTS, `X-Content-Type-Options`, etc., but **no `Content-Security-Policy` header is defined**. CSP is the primary defense against Cross-Site Scripting (XSS) attacks. Without it, any XSS vulnerability (e.g., in markdown rendering of AI content) can execute arbitrary scripts.  
**Risk**: High — especially since AI responses are rendered as Markdown via `react-markdown`, which could render untrusted HTML if not configured correctly.  
**Fix**:
```ts
{ key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.openai.com;" }
```

---

### C-2: Rate Limiting Silently Disabled in Dev / Missing Redis Credentials
**File**: `lib/rate-limit.ts` (line 66–72)  
**Description**: If `UPSTASH_REDIS_REST_URL` or `UPSTASH_REDIS_REST_TOKEN` are missing, all rate limiting is **completely bypassed** with a `console.warn`. This is intentional for local dev, but if env vars are missing in production (e.g., deployment misconfiguration), all API routes become unprotected and vulnerable to brute-force and abuse.  
**Risk**: If production deployment omits Redis credentials, an attacker can send unlimited requests to the chat, profile, and study-time APIs.  
**Fix**: In production, validate that Redis env vars are set at startup and throw an error (fail-fast) rather than silently allowing all requests.

---

## 🟠 High Issues

### H-1: Missing `/api/search` Route
**File**: `app/api/search/` (does not exist)  
**Description**: `docs/PROJECT_OVERVIEW.md` architecture diagram explicitly lists `/api/search` as a backend route. The frontend sidebar has a search input for recent chats but there is no dedicated search API. This is a functional gap, not just a missing feature — if any component tries to call this route, it will get a 404.  
**Fix**: Implement `app/api/search/route.ts` for full-text conversation/message search, or remove the reference from documentation.

---

### H-2: AI Chat Returns Static Placeholder — No Streaming
**File**: `app/api/chat/route.ts` (lines 132–140)  
**Description**: The entire AI integration is a `TODO` comment. Every response is `"AI responses are not enabled yet."` The `openai` package (v6.22.0) is installed but never called. No streaming is implemented — the response is a single JSON object rather than a streamed `ReadableStream`, which will result in poor UX when real AI responses are eventually added (long wait with no feedback).  
**Impact**: The product's core value proposition is entirely non-functional.  
**Fix**: 
1. Add `OPENAI_API_KEY` to `.env.local` and `.env.example`
2. Implement streaming via `openai.chat.completions.create({ stream: true })` + Next.js `ReadableStream`
3. Wire up `match_syllabus` RPC for RAG context injection

---

### H-3: Conversation Ownership Verified in Code but Not Enforced by RLS on Messages
**File**: `supabase/schema.sql` (lines 215–237), `app/api/chat/route.ts` (lines 82–94)  
**Description**: The `messages` RLS policy allows SELECT/INSERT/DELETE where the `conversation_id` belongs to the authenticated user. However, the `messages` table has **no UPDATE policy**. If a client-side update is attempted (e.g., edit message), it would silently fail. More importantly, since all DB interaction is via the service role in server routes, the RLS effectively only protects direct Supabase SDK access from clients — this is fine architecturally but should be documented.  
**Fix**: Add a `messages` UPDATE policy for completeness, or document the intentional omission.

---

### H-4: IP Spoofing Risk on Public API Rate Limiting
**File**: `app/api/courses/route.ts` (line 12), `app/api/patterns/route.ts` (line 12)  
**Description**: Public routes use the `x-forwarded-for` header's first value for IP-based rate limiting. This header can be **forged by an attacker** who sends requests directly to the origin (not via a CDN/proxy). A malicious client can rotate the `x-forwarded-for` value to bypass rate limits entirely.  
**Risk**: Public `/api/courses` and `/api/patterns` endpoints could be scraped without restriction.  
**Fix**: When deployed behind Vercel/Cloudflare, use a trusted IP extraction method that validates the proxy chain, or use Cloudflare access rules as the primary protection rather than relying solely on app-level IP detection.

---

### H-5: `onboarding_completed` Always Set to `true` on Profile Update
**File**: `app/api/profile/route.ts` (line 146)  
**Description**: The profile PUT endpoint always sets `onboarding_completed: true` in the upsert, regardless of whether the user actually completed onboarding. This means a user who manually calls the profile API can bypass the onboarding requirement entirely.  
**Risk**: Minor — the onboarding data would still be incomplete if fields are missing, but the middleware gate would be bypassed.  
**Fix**: Only set `onboarding_completed: true` if it isn't already set, or remove it from the profile update endpoint entirely.

---

### H-6: `createServiceClient` Exposes Service Role Key Usage
**File**: `app/api/profile/route.ts` (lines 157–163)  
**Description**: The profile route uses `createServiceClient()` (which holds the Supabase service role key) to update auth user metadata. While this is necessary, the service client should never be exposed client-side. Verify that `createServiceClient` is in `lib/supabase/server.ts` and only imported in server-side contexts.  
**Status**: Appears safe (server-only API route), but flag for code review. Ensure `SUPABASE_SERVICE_ROLE_KEY` is never prefixed with `NEXT_PUBLIC_`.

---

## 🟡 Medium Issues

### M-1: LocalStorage Used for Onboarding Persistence — No Expiry
**File**: `app/onboarding/` components  
**Description**: Onboarding step data is stored in `localStorage` with no expiry/TTL. If a user abandons onboarding, stale partial data persists indefinitely on their browser. If another user logs in on the same browser, they could see/submit the previous user's onboarding selections.  
**Fix**: Clear `localStorage` onboarding keys on sign-out and on sign-in start.

---

### M-2: Study Timer Module-Level Singleton (SSR/Multi-Tab Risk)
**File**: `hooks/useStudyTimer.ts` (lines 8–10)  
**Description**: The timer uses module-level variables (`_sessionStartedAt`, `_pausedAccumulatedMs`, `_isPaused`). In a server-side rendering context these would be shared across requests (though the `"use client"` directive mitigates this). In development with React Strict Mode, `useEffect` runs twice — the timer may be started and paused immediately, causing an incorrect initial state.  
**Fix**: Ensure `"use client"` is respected, add a guard for server-side environments, and test with React Strict Mode enabled.

---

### M-3: Chat `sendBeacon` Does Not Send Authentication Cookies Reliably
**File**: `hooks/useStudyTimer.ts` (lines 85–93)  
**Description**: `navigator.sendBeacon` is used on `beforeunload` to save study time. While `sendBeacon` does send cookies, some browsers may not send cookies with Beacon requests if the page is being unloaded. If the session cookie is missing, the `/api/study-time` POST will return 401 and time will be lost without the error-recovery logic triggering (since `sendBeacon` provides no response callback).  
**Workaround currently in place**: None. Time is simply lost on failed beacon.  
**Fix**: Accept this as a known limitation, or implement time recovery on next page load by comparing last-known saved time vs. expected active time.

---

### M-4: No CSRF Protection on State-Changing API Routes
**File**: `app/api/profile/route.ts`, `app/api/study-time/route.ts`  
**Description**: The API routes use Supabase session cookies for authentication. These are `HttpOnly` cookies, which protects against XSS theft, but they are still vulnerable to Cross-Site Request Forgery (CSRF) since the browser automatically sends cookies with cross-origin requests. Next.js App Router has some built-in CSRF mitigations via the `SameSite=Lax` cookie default, but this should be verified.  
**Fix**: Ensure Supabase auth cookies are set with `SameSite=Lax` or `SameSite=Strict`. If using custom cookie config, verify this is handled.

---

### M-5: `full_name` Sanitization is Incomplete
**File**: `app/api/profile/route.ts` (line 107)  
**Description**: `full_name` is validated for length (2–100 chars) and trimmed, but **not sanitized for HTML/script injection**. If `full_name` is rendered as raw HTML anywhere in the UI (e.g., in a greeting), it could cause stored XSS.  
**Risk**: Low if React's JSX always escapes values (which it does by default), but worth a note.  
**Fix**: Already safe if using JSX rendering. Explicitly document that raw HTML rendering of user data is prohibited.

---

### M-6: No `robots.txt` or `sitemap.xml`
**File**: `public/`  
**Description**: There is no `robots.txt` or `sitemap.xml` in the `public/` folder. Search engines could index authenticated pages or sensitive routes.  
**Fix**: Add `public/robots.txt` to disallow indexing of `/chat`, `/profile`, `/onboarding`, and `/api/*` while allowing the landing page.

---

### M-7: `user_progress.study_time_minutes` Type Inconsistency
**File**: `supabase/schema.sql` (line 117)  
**Description**: `user_profiles.study_time_minutes` is `FLOAT` (correct, stores fractional minutes), but `user_progress.study_time_minutes` is `INTEGER`. If fractional minutes are ever stored in `user_progress`, precision is lost. The `user_progress` table is also never written to by any current API route.  
**Fix**: Change `user_progress.study_time_minutes` to `FLOAT` for consistency.

---

### M-8: `user_progress` Table is Never Written To
**File**: `app/api/` (all routes)  
**Description**: The `user_progress` table exists in the schema but no API route ever inserts or updates it. The profile GET reads from it (for "top subject"), which will always return empty. This is a silent dead-code table.  
**Fix**: Remove it from the schema or implement course-specific progress tracking.

---

### M-9: No Error Recovery for Failed Message Insert in Chat
**File**: `app/api/chat/route.ts` (lines 117–122)  
**Description**: The user message is saved to the database without checking the error result (`await supabase.from("messages").insert(...)`). If this insert fails, the code continues and the AI response is still returned, but the user message is permanently lost from history.  
**Fix**: Check the insert result and return a 500 if it fails.

---

## 🔵 Low / Code Quality Issues

### L-1: `README.md` Contains Placeholder/Generic Next.js Content
**File**: `README.md`  
**Description**: The README mentions "This is a Next.js project bootstrapped with `create-next-app`" at the top with generic getting-started instructions, rather than project-specific onboarding.  
**Fix**: Replace with KTU Exam Prep AI specific setup instructions (env var guide, Supabase setup, seeding data).

---

### L-2: `history` Variable Fetched but Never Used
**File**: `app/api/chat/route.ts` (lines 124–130)  
**Description**: The code fetches the last 10 messages from the conversation for AI context, stores it in `history`, but since OpenAI integration is commented out, `history` is never used. TypeScript/ESLint may not flag this but it's dead code.  
**Fix**: Wrap in the same `TODO` comment or remove until OpenAI is integrated.

---

### L-3: `topSubject` / `favSubject` Returned but Never Displayed
**File**: `app/api/profile/route.ts` (lines 51–54, 67)  
**Description**: The profile API computes and returns `favSubject` (top subject from `user_progress`), but the profile page UI only shows "Questions Asked" and "Study Time". The `favSubject` field is computed unnecessarily on every profile load.  
**Fix**: Either display it in the UI or remove the computation.

---

### L-4: `avg_score` / Module Progress Fields Missing from Schema
**File**: `supabase/schema.sql`  
**Description**: `docs/DATA_MODEL.md` (if it lists these fields) may reference fields that don't exist in the actual schema. `user_progress` only has `questions_asked` and `study_time_minutes` — no completion percentage or score tracking.  
**Fix**: Reconcile `DATA_MODEL.md` with the actual schema.

---

### L-5: `app/api/search/route.ts` Completely Missing
**File**: `app/api/search/` (directory does not exist)  
**Description**: Referenced in architecture but not implemented. Any code that calls `/api/search` will get 404.  
**Fix**: Implement or remove all references.

---

### L-6: `onboarding/` API Route Missing
**File**: No `app/api/onboarding/` route  
**Description**: The onboarding final step (Step 4) presumably calls an API to save all data, but there is no dedicated `/api/onboarding` route visible. If it uses `/api/profile` PUT, the `referral_source` and `graduation_year` fields from onboarding would not be saved (they are not included in the profile PUT validation).  
**Fix**: Confirm where Step 4 POSTs to, ensure `referral_source` and `graduation_year` are actually persisted.

---

## ⚪ Informational Notes

### I-1: OpenAI Package Version
`openai` v6.22.0 is installed. This is sufficient for GPT-4o and embeddings. The package is completely unused currently.

### I-2: `@hookform/resolvers` v5 + `zod` v4 Compatibility
Zod v4 is a breaking change from v3. Ensure `@hookform/resolvers` v5 supports Zod v4 (it does as of v5.0+). Monitor for any resolver-specific issues.

### I-3: `react-markdown` and HTML Rendering
`react-markdown` with `remark-gfm` by default does **not** allow raw HTML (`rehype-raw` is needed for that). This is a safe default — AI responses rendered as Markdown won't execute embedded HTML. Keep this as-is.

### I-4: `next` v16.1.6 — Near Latest
Next.js 16.1.6 is very recent. Monitor for breaking changes and patch updates.

### I-5: Rate Limiting for `study-time` is 30 req/60s
The `MILESTONES.md` says 10 req/60s for study-time, but the actual implementation (`app/api/study-time/route.ts`) sets 30 req/60s. Documentation is out of date.

---

## Summary Table

| ID | Severity | Area | One-Line Description |
|---|---|---|---|
| C-1 | 🔴 CRITICAL | Security | No Content-Security-Policy header |
| C-2 | 🔴 CRITICAL | Security | Rate limiting silently disabled if Redis unconfigured |
| H-1 | 🟠 HIGH | Functionality | `/api/search` route missing |
| H-2 | 🟠 HIGH | Functionality | AI chat returns static placeholder, no OpenAI integration |
| H-3 | 🟠 HIGH | Security/Schema | No `messages` UPDATE RLS policy |
| H-4 | 🟠 HIGH | Security | IP spoofing risk on public API rate limiting |
| H-5 | 🟠 HIGH | Security | Profile API bypasses onboarding gate |
| H-6 | 🟠 HIGH | Security | Service role key usage — verify server-only |
| M-1 | 🟡 MEDIUM | UX/Security | Onboarding localStorage persists across user sessions |
| M-2 | 🟡 MEDIUM | Bug | Study timer singleton may misbehave under Strict Mode |
| M-3 | 🟡 MEDIUM | Reliability | `sendBeacon` may fail silently, losing study time |
| M-4 | 🟡 MEDIUM | Security | CSRF protection not explicitly verified |
| M-5 | 🟡 MEDIUM | Security | `full_name` not HTML-sanitized (safe in JSX, verify) |
| M-6 | 🟡 MEDIUM | SEO/Security | No `robots.txt` — sensitive pages may be indexed |
| M-7 | 🟡 MEDIUM | Schema | `user_progress.study_time_minutes` is INTEGER not FLOAT |
| M-8 | 🟡 MEDIUM | Dead Code | `user_progress` table never written to |
| M-9 | 🟡 MEDIUM | Reliability | Failed user message insert is silently ignored |
| L-1 | 🔵 LOW | Docs | README has generic Next.js boilerplate |
| L-2 | 🔵 LOW | Code Quality | `history` variable fetched but never used |
| L-3 | 🔵 LOW | Code Quality | `favSubject` computed but never displayed |
| L-4 | 🔵 LOW | Docs | DATA_MODEL.md may be out of sync with schema |
| L-5 | 🔵 LOW | Functionality | `/api/search` not implemented but referenced in docs |
| L-6 | 🔵 LOW | Functionality | `referral_source` and `graduation_year` may not be saved |
| I-1 | ⚪ INFO | Deps | OpenAI package installed, unused |
| I-2 | ⚪ INFO | Deps | Zod v4 + @hookform/resolvers v5 — verify compat |
| I-3 | ⚪ INFO | Security | react-markdown HTML rendering is safely disabled |
| I-4 | ⚪ INFO | Deps | Next.js 16.1.6 — monitor for patches |
| I-5 | ⚪ INFO | Docs | `MILESTONES.md` documents wrong rate limit for study-time |
