# Features

A complete breakdown of all features in the KTU Exam Prep AI platform, organized by area.

---

## 🔐 Authentication

### Sign Up
- Email + password registration with client-side validation
- Full name captured during signup
- Password strength indicator (weak/medium/strong)
- Real-time password match validation
- Rate limiting to prevent abuse
- Automatic user profile creation in `user_profiles` table
- Immediate redirect to onboarding (no email verification required)

### Sign In
- Email + password login
- Show/hide password toggle
- Intelligent error messages (network error vs. wrong credentials)
- Redirect to chat (or onboarding if not completed)

### Session Management
- Cookie-based sessions via Supabase SSR
- Automatic session refresh in middleware
- Sign out clears session and redirects to login

### Route Protection
- Middleware-based authentication guard on all dashboard routes
- Unauthenticated users redirected to `/login`
- Authenticated users redirected away from `/login` and `/signup`
- Onboarding enforcement: incomplete onboarding → redirect to step-1
- Completed onboarding: accessing `/onboarding` → redirect to `/chat`

---

## 🎓 Onboarding (4 Steps)

### Step 1 — Personal Info
- **College selection**: Searchable dropdown with 130+ KTU-affiliated colleges
- **Graduation year**: Dropdown (2024-2030)
- Data persisted in localStorage between steps

### Step 2 — Branch Selection
- Visual cards for departments: CSE, CE, ME, EEE, ECE
- Each card shows department icon and full name

### Step 3 — Semester Selection
- Buttons for semesters 1-8
- Single selection with visual highlight

### Step 4 — Referral Source
- Options: Friend, Instagram, WhatsApp/Telegram, Google, Facebook, College, Other
- Final step triggers API call to save all onboarding data
- Sets `onboarding_completed = true`
- Redirects to `/chat`

### Progress Indicator
- Visual step indicator showing current step (1-4)
- Appears on all onboarding pages

---

## 💬 AI Chat

### Chat Interface
- **Real-time messaging** with optimistic UI updates
- **Markdown rendering** for AI responses (code blocks, tables, lists, bold/italic)
- **Suggested prompts** on empty chat (e.g., "Explain the OSI model layers")
- **Loading spinner** while AI processes response
- **Error handling** with user-friendly messages (rate limit, server error)
- **Regenerate** last response button

### Conversation Management
- Automatic conversation creation on first message
- URL updates to `/chat?id=<uuid>` for deep linking
- Chat title generation (from first message)
- Conversation history loaded when revisiting a chat
- **Loading state** with spinner when loading chat history

### Sidebar — Recent Chats
- Lists up to 50 most recent conversations (ordered by `updated_at`)
- **Real-time updates**: sidebar refreshes instantly when new chat is created
- Active chat highlighting
- **Rename** conversations via inline editing
- **Delete** conversations with cascade (messages deleted too)
- Custom event system (`conversation-updated`) for instant sidebar refresh
- Supabase Realtime subscription as backup

### Sidebar — New Chat
- Button to start a fresh conversation
- Clears current messages and resets URL to `/chat`

---

## 📚 Courses

### Course Browsing
- Fetches all courses from Supabase via `/api/courses`
- Displays course cards with: code, name, semester, credits, module count
- Publicly accessible data (no auth required for API)

---

## 📊 Exam Patterns

### Pattern Analysis
- Fetches question patterns from `/api/patterns`
- Shows topic-wise frequency breakdown (Part A, B, C)
- Priority classification: HIGH, MEDIUM, LOW
- Years appeared for each topic
- Helps students focus on frequently asked topics

---

## 👤 Profile

### Personal Information
- Editable fields: Full Name, College (searchable dropdown), Department, Semester
- Email displayed but not editable
- Avatar with initials
- Server-side validation with sanitization
- Success/error toast notifications on save

### Usage Statistics
- **Questions Asked**: Total count of user messages across all conversations
- **Study Time**: Live-ticking `HH:MM:SS` timer showing lifetime active study time

---

## ⏱️ Study Timer

### Active Time Tracking
- Runs automatically on all dashboard pages
- Uses `document.visibilitychange` to detect tab focus
- Uses `window.focus`/`window.blur` for window focus detection
- **Pauses** when user switches tabs, minimizes browser, or goes AFK
- **Resumes** when user returns to the app

### Data Persistence
- Accumulated time saved every 60 seconds via `/api/study-time`
- Uses `navigator.sendBeacon` for reliable save on tab close
- Atomic database increment via `increment_study_time` RPC function
- Seconds are stored as fractional minutes for precision

### Live Display
- Profile page shows real-time ticking timer
- Combines saved DB time + unsaved session time
- Updates every second when profile page is open
- Format: `HH:MM:SS` (e.g., `01:23:45`)

---

## 🎨 UI/UX

### Design System
- Clean, modern design with indigo accent color
- Responsive sidebar (collapsible on mobile, persistent on desktop)
- Mobile hamburger menu with overlay
- Smooth animations: `slide-up-fade`, `fade-in`, skeleton loading
- Password strength indicator with color gradient

### Loading States
- Route-level loading spinners for auth and onboarding pages
- Dashboard-level loading spinner
- Skeleton placeholders for recent chats
- Chat history loading spinner
- Button loading states with animated spinner icon

### Error Handling
- Global error boundary for dashboard
- 404 Not Found page
- Inline error messages on forms
- Rate limit feedback
- Network error detection

---

## 🔒 Security

### Rate Limiting
- Sliding-window rate limiting via Upstash Redis
- Applied to: chat API (10 req/60s), profile update (10 req/60s), study time (10 req/60s)
- Returns 429 status with user-friendly error message

### Input Validation
- Server-side validation on all API routes
- Zod schema validation on forms
- HTML entity sanitization
- Max length enforcement on all text fields

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Course/pattern data is publicly readable
- Messages access controlled via conversation ownership subquery
