# Milestones

A record of what has been built, how it was done, and what remains for future development.

---

## ✅ Completed Milestones

### Milestone 1: Project Foundation
**Status**: Complete

- Initialized Next.js 16 project with TypeScript, Tailwind CSS v4, and App Router
- Set up project structure: `app/`, `components/`, `lib/`, `types/`, `hooks/`
- Configured ESLint, PostCSS, TypeScript
- Created `.env.example` with all required environment variables
- Set up Git repository with `.gitignore`

---

### Milestone 2: Supabase Backend Setup
**Status**: Complete

- Created Supabase project with PostgreSQL database
- Designed and deployed full database schema (`supabase/schema.sql`):
  - `user_profiles` — user data (college, branch, semester, study time)
  - `courses` — KTU courses by semester and department
  - `modules` — course modules with topics
  - `conversations` — chat threads per user
  - `messages` — conversation messages (user + assistant)
  - `question_patterns` — exam frequency analysis
  - `user_progress` — per-course progress tracking
  - `syllabus_embeddings` — vector embeddings for AI search
- Enabled Row Level Security (RLS) on all tables with appropriate policies
- Created database triggers for automatic `updated_at` timestamps
- Created `match_syllabus` function for vector similarity search
- Created `increment_study_time` function for atomic time tracking
- Enabled pgvector extension for embedding storage

---

### Milestone 3: Authentication System
**Status**: Complete

- Implemented email + password signup with `@supabase/ssr`
- Implemented login with session cookie management
- Created middleware for route protection and session refresh
- Built `SignupForm` with React Hook Form + Zod validation
- Built `LoginForm` with error handling
- Password strength indicator
- Disabled email verification for streamlined signup
- Added rate limiting on auth operations
- Error messaging: network errors vs. auth errors vs. rate limits

---

### Milestone 4: Onboarding Flow
**Status**: Complete

- Built 4-step onboarding wizard:
  - Step 1: College (searchable dropdown, 130+ colleges) + Graduation Year
  - Step 2: Branch/Department selection (visual cards)
  - Step 3: Semester selection (1-8)
  - Step 4: Referral source
- Progress indicator component
- LocalStorage persistence between steps
- Final step saves all data to `user_profiles` and sets `onboarding_completed = true`
- Middleware enforcement: dashboard blocked until onboarding is complete

---

### Milestone 5: Dashboard & Chat UI
**Status**: Complete

- Created responsive dashboard layout with sidebar
- Sidebar components:
  - App logo and branding
  - New Chat button
  - Navigation links (Patterns, Courses)
  - Recent Chats list (searchable, 50 items)
  - User profile section with sign-out
- Chat interface:
  - Message list with user/assistant bubbles
  - Markdown rendering for AI responses (code blocks, tables, GFM)
  - Input box with auto-resize textarea
  - Suggested prompts on empty state
  - Loading state for AI response
  - Regenerate last response
- Chat history loading from database
- URL-based conversation routing (`/chat?id=<uuid>`)
- Mobile-responsive sidebar with hamburger menu

---

### Milestone 6: AI Chat Backend
**Status**: Complete (framework ready, needs OpenAI key)

- Created `/api/chat` route handler
- Conversation auto-creation on first message
- Message persistence to database (user + assistant)
- Chat title generation from first message
- OpenAI GPT integration (requires API key)
- Vector search integration via `match_syllabus` for context-aware responses
- Rate limiting (10 requests per 60 seconds)

---

### Milestone 7: Real-Time Sidebar Updates
**Status**: Complete

- Custom event system: `ChatInterface` dispatches `conversation-updated` event
- `RecentChats` listens for event and re-fetches conversation list
- Supabase Realtime subscription as secondary mechanism
- Instant sidebar updates when new conversation is created or updated

---

### Milestone 8: Active Study Timer
**Status**: Complete

- Created `useStudyTimer` hook with timestamp-based tracking
- Visibility change detection (`document.hidden`)
- Window focus/blur detection
- Automatic pause when user leaves app
- Automatic resume when user returns
- Periodic save every 60 seconds
- `navigator.sendBeacon` for reliable save on tab close
- `/api/study-time` endpoint with abuse protection (max 5 min per save)
- Atomic database increment via `increment_study_time` RPC
- Live-ticking `HH:MM:SS` display on profile page via `useLiveSessionSeconds` hook

---

### Milestone 9: Courses & Patterns Pages
**Status**: Complete (UI ready, needs data population)

- Created `/courses` page with course card grid
- Created `/patterns` page with pattern frequency table
- API routes: `/api/courses`, `/api/patterns`
- Publicly readable data (no auth required for read)

---

### Milestone 10: Profile Management
**Status**: Complete

- Profile page with editable personal information
- College searchable dropdown (130+ KTU colleges)
- Department and semester selectors
- Server-side validation and sanitization
- Usage statistics: Questions Asked + Live Study Time
- Success/error toast notifications

---

### Milestone 11: College Database
**Status**: Complete

- Populated 130+ KTU-affiliated colleges organized by category:
  - State Government Engineering Colleges (12)
  - Government Department Colleges (22)
  - Private Self-Financing Colleges (100+)
  - "Other" option as fallback
- Searchable dropdown component used in both onboarding and profile

---

### Milestone 12: Project Documentation
**Status**: Complete

- Created `docs/PROJECT_OVERVIEW.md`
- Created `docs/TECH_STACK.md`
- Created `docs/DATA_MODEL.md`
- Created `docs/USER_FLOW.md`
- Created `docs/FEATURES.md`
- Created `docs/MILESTONES.md`
- Updated `README.md`

---

## 🔜 Upcoming / Future Scope

### High Priority

- [ ] **OpenAI API Integration**: Add API key and enable AI chat responses
- [ ] **Syllabus Data Ingestion**: Populate `courses`, `modules`, and `syllabus_embeddings` with real KTU syllabus data
- [ ] **Exam Pattern Data**: Populate `question_patterns` with historical exam question frequency data
- [ ] **Vector Search**: Generate and store embeddings for all syllabus content

### Medium Priority

- [ ] **Two-Factor Auth**: Re-enable email verification as optional
- [ ] **Forgot Password**: Password reset flow via email
- [ ] **Chat Export**: Export conversation as PDF/markdown
- [ ] **Dark Mode**: Full dark mode theme toggle
- [ ] **Course Filtering**: Filter chat by selected course for more focused AI responses
- [ ] **Search**: Full-text search across conversations

### Low Priority / Nice-to-Have

- [ ] **PWA Support**: Installable as a Progressive Web App
- [ ] **Push Notifications**: Study reminders and new feature alerts
- [ ] **Collaborative Study**: Share conversations or study sessions
- [ ] **Flashcard Generation**: Auto-generate flashcards from AI responses
- [ ] **Practice Tests**: AI-generated mock exams based on patterns
- [ ] **Analytics Dashboard**: Detailed study analytics with charts
- [ ] **Multi-language**: Malayalam/Hindi support for regional accessibility
- [ ] **Voice Input**: Speech-to-text for asking questions
- [ ] **Deployment**: Vercel production deployment with custom domain

---

## Build History

| Date | Milestone | Key Changes |
|------|-----------|-------------|
| Feb 2026 | Foundation | Project init, schema design, auth system |
| Feb 2026 | Dashboard | Chat UI, sidebar, conversation management |
| Feb 2026 | Onboarding | 4-step flow, college database |
| Feb 2026 | Study Timer | Active time tracking with live display |
| Feb 2026 | Documentation | Full project documentation suite |
