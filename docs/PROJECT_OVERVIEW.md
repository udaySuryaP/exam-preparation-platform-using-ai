# KTU Exam Prep AI — Project Overview

## What is KTU Exam Prep AI?

KTU Exam Prep AI is a **full-stack web application** built to help students of **APJ Abdul Kalam Technological University (KTU)** prepare for their semester exams using artificial intelligence. The platform provides an AI-powered study assistant that understands KTU syllabi, answers academic questions, and helps students study smarter.

---

## Problem Statement

KTU engineering students face several challenges during exam preparation:
- **Vast syllabi** across multiple modules per subject
- **No quick way** to get explanations for specific topics
- **Scattered resources** across multiple platforms
- **No personalized study tracking** to measure progress

## Solution

This platform addresses these challenges by providing:
- An **AI chatbot** that understands the KTU syllabus and can answer academic questions
- **Course browsing** organized by semester and department
- **Exam pattern analysis** showing topic frequency and priority
- **Active study time tracking** that measures how long students engage with the platform
- A **personalized dashboard** with chat history, profile management, and usage statistics

---

## Target Users

- **Primary**: KTU B.Tech students (all semesters, all branches)
- **Secondary**: Faculty members seeking quick reference, competitive exam aspirants

## Key User Journeys

1. **Sign Up → Onboarding → Chat**: New users create an account, complete a 4-step onboarding (college, branch, semester, referral source), then land in the AI chat
2. **Return Visit → Chat History**: Returning users sign in and see their conversation history in the sidebar, resuming any previous chat
3. **Study Session**: Users interact with the AI, ask questions, and the app transparently tracks their active study time
4. **Profile Management**: Users can update their details, view usage statistics and live study time

---

## Architecture Summary

```
┌─────────────────────────────────────────────────┐
│                    Frontend                      │
│  Next.js 16 (App Router) + React 19 + Tailwind  │
│  Client Components with Server-Side Auth Check   │
└─────────────┬───────────────────┬───────────────┘
              │                   │
              ▼                   ▼
┌─────────────────────┐  ┌───────────────────────┐
│   API Routes        │  │   Middleware (Proxy)   │
│   /api/chat         │  │   Auth session check   │
│   /api/profile      │  │   Route protection     │
│   /api/courses      │  │   Onboarding guard     │
│   /api/patterns     │  └───────────────────────┘
│   /api/search       │
│   /api/study-time   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│                 Backend Services                  │
│  ┌──────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │  Supabase    │  │  OpenAI API │  │ Upstash │ │
│  │  Auth + DB   │  │  GPT + Emb  │  │  Redis  │ │
│  │  + RLS       │  │             │  │  Rate   │ │
│  │  + Realtime  │  │             │  │  Limit  │ │
│  └──────────────┘  └─────────────┘  └─────────┘ │
└─────────────────────────────────────────────────┘
```

---

## Project Structure

```
exam-preparation-platform-using-ai/
├── app/                      # Next.js App Router pages
│   ├── (auth)/               # Auth pages (login, signup, verify-email)
│   ├── (dashboard)/          # Protected pages (chat, courses, patterns, profile)
│   ├── api/                  # API route handlers
│   ├── auth/                 # Auth callback handler
│   ├── onboarding/           # 4-step onboarding flow
│   ├── page.tsx              # Landing page
│   └── globals.css           # Global styles + Tailwind config
├── components/               # React components
│   ├── auth/                 # LoginForm, SignupForm
│   ├── chat/                 # ChatInterface, MessageList, InputBox, MessageBubble
│   ├── onboarding/           # CollegeSelector, ProgressIndicator, BranchSelector, etc.
│   └── sidebar/              # NavigationLinks, RecentChats, ChatItem, NewChatButton, UserProfile
├── hooks/                    # Custom React hooks
│   └── useStudyTimer.ts      # Active study time tracker
├── lib/                      # Utility libraries
│   ├── supabase/             # Supabase client (browser, server, middleware)
│   ├── rate-limit.ts         # Upstash Redis rate limiter
│   └── utils.ts              # Utility functions (cn, etc.)
├── types/                    # TypeScript types and constants
│   └── index.ts              # All interfaces, KTU_COLLEGES, DEPARTMENTS, etc.
├── supabase/                 # Database schema and migrations
│   ├── schema.sql            # Full database schema
│   └── migrations/           # Incremental migrations
├── public/                   # Static assets
├── docs/                     # Project documentation
└── middleware.ts              # Next.js middleware (auth + route protection)
```

---

## Repository Information

- **Repository**: `udaySuryaP/exam-preparation-platform-using-ai`
- **License**: MIT
- **Version**: 0.1.0 (MVP)
