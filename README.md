# 🎓 KTU Exam Prep AI

> An AI-powered exam preparation platform for APJ Abdul Kalam Technological University (KTU) students.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-blue?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 🚀 What is KTU Exam Prep AI?

KTU Exam Prep AI is a full-stack web application that helps KTU engineering students prepare for semester exams using artificial intelligence. The platform provides:

- 🤖 **AI Study Assistant** — Ask any academic question and get syllabus-aware answers
- 📚 **Course Browser** — Browse courses organized by semester and department
- 📊 **Exam Patterns** — Analyze question frequency to focus on high-priority topics
- ⏱️ **Study Timer** — Automatically tracks your active study time
- 💬 **Chat History** — All conversations saved and searchable

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **AI Chat** | GPT-powered chatbot with markdown rendering, code blocks, tables |
| **Smart Onboarding** | 4-step wizard to personalize the experience |
| **130+ Colleges** | Searchable dropdown with all KTU-affiliated colleges |
| **Active Study Timer** | Tracks time only when you're actively using the app |
| **Real-time Sidebar** | Chat history updates instantly when new conversations are created |
| **Profile Management** | Update college, department, semester; view live usage stats |
| **Route Protection** | Middleware-based auth guards with onboarding enforcement |
| **Rate Limiting** | Protects APIs from abuse via Upstash Redis |
| **Responsive Design** | Mobile-first with collapsible sidebar |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4 |
| **Backend** | Next.js API Routes, Supabase (PostgreSQL + Auth + Realtime) |
| **AI** | OpenAI GPT + Embeddings, pgvector for semantic search |
| **Rate Limiting** | Upstash Redis with sliding-window limiter |
| **UI** | Lucide icons, React Markdown, React Hook Form + Zod |

> See [docs/TECH_STACK.md](./docs/TECH_STACK.md) for complete details.

---

## 📁 Project Structure

```
exam-preparation-platform-using-ai/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, signup)
│   ├── (dashboard)/              # Protected pages (chat, courses, patterns, profile)
│   ├── api/                      # API routes (chat, profile, courses, patterns, study-time, search)
│   ├── onboarding/               # 4-step onboarding wizard
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── auth/                     # LoginForm, SignupForm
│   ├── chat/                     # ChatInterface, MessageList, InputBox, MessageBubble
│   ├── onboarding/               # CollegeSelector, BranchSelector, ProgressIndicator
│   └── sidebar/                  # NavigationLinks, RecentChats, NewChatButton, UserProfile
├── hooks/                        # Custom hooks (useStudyTimer)
├── lib/                          # Utilities (Supabase clients, rate limiter, cn)
├── types/                        # TypeScript types, constants (colleges, departments)
├── supabase/                     # Schema + migrations
├── docs/                         # Project documentation
└── middleware.ts                 # Auth + route protection
```

---

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js** 18+ and **npm**
- A **Supabase** account and project
- An **OpenAI** API key
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

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:

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
2. Copy the contents of `supabase/schema.sql`
3. Execute it to create all tables, RLS policies, and functions
4. Run `supabase/migrations/add_study_time.sql` for the study timer

### 5. Configure Supabase Auth

In your Supabase dashboard:

1. Go to **Authentication → Providers → Email**
2. Disable "Confirm email" (for development)
3. Set redirect URL to your app URL

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📖 Documentation

Comprehensive documentation is available in the `docs/` directory:

| Document | Description |
|----------|-------------|
| [Project Overview](./docs/PROJECT_OVERVIEW.md) | High-level overview, architecture, and project structure |
| [Tech Stack](./docs/TECH_STACK.md) | All technologies, versions, environment variables, design decisions |
| [Data Model](./docs/DATA_MODEL.md) | Database tables, columns, relationships, RLS policies, functions |
| [User Flow](./docs/USER_FLOW.md) | Every user journey with navigation paths and system responses |
| [Features](./docs/FEATURES.md) | Complete feature breakdown organized by area |
| [Milestones](./docs/MILESTONES.md) | What's built, how it was done, and future roadmap |

---

## 🗄️ Database Schema

The app uses 8 PostgreSQL tables with Row Level Security:

| Table | Purpose |
|-------|---------|
| `user_profiles` | User data (name, college, branch, study time) |
| `courses` | KTU courses by semester and department |
| `modules` | Course modules with topics |
| `conversations` | Chat threads per user |
| `messages` | Chat messages (user + AI) |
| `question_patterns` | Exam question frequency data |
| `user_progress` | Per-course progress tracking |
| `syllabus_embeddings` | Vector embeddings for AI semantic search |

> See [docs/DATA_MODEL.md](./docs/DATA_MODEL.md) for the full ER diagram and column reference.

---

## 🧪 Scripts

```bash
# Development
npm run dev          # Start dev server (Turbopack)

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

---

## 🗺️ Roadmap

- [ ] OpenAI API integration with real AI responses
- [ ] KTU syllabus data ingestion (courses, modules, embeddings)
- [ ] Exam pattern data population
- [ ] Dark mode
- [ ] Chat export (PDF/markdown)
- [ ] Password reset flow
- [ ] PWA support
- [ ] Practice test generation
- [ ] Multi-language support (Malayalam)
- [ ] Vercel deployment

> See [docs/MILESTONES.md](./docs/MILESTONES.md) for the complete roadmap.

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
