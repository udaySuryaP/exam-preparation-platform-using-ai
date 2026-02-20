# KTU Exam Prep AI

An AI-powered exam preparation platform for APJ Abdul Kalam Technological University (KTU) students. Get personalized Q&A, analyze exam patterns, and track your study progress — all powered by GPT-4 Turbo and trained on the 2024 KTU syllabus.

## ✨ Features

- **AI-Powered Chat** — Ask questions from your KTU syllabus and get accurate, exam-focused answers
- **Exam Pattern Analysis** — Analyze past question paper patterns with topic frequency data
- **Course Browser** — Browse courses by semester with search and filtering
- **Smart Progress Tracking** — Track questions asked, study time, and favorite subjects
- **Complete Auth Flow** — Email/password authentication with OTP verification
- **Guided Onboarding** — 4-step onboarding (college, department, semester, referral)
- **Responsive Design** — Works seamlessly on mobile, tablet, and desktop

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL + pgvector) |
| Auth | Supabase Auth |
| AI | OpenAI GPT-4 Turbo + text-embedding-3-small |
| Forms | react-hook-form + zod |
| Markdown | react-markdown + remark-gfm |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase account
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ktu-exam-prep-ai.git
cd ktu-exam-prep-ai

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### Environment Variables

Edit `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

1. Go to your Supabase dashboard → SQL Editor
2. Run the SQL from `supabase/schema.sql`
3. This creates all tables, RLS policies, indexes, and the vector search function

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
├── app/
│   ├── (auth)/           # Login, Signup, Email Verification
│   ├── (onboarding)/     # 4-step onboarding flow
│   ├── (dashboard)/      # Chat, Courses, Patterns, Profile
│   ├── api/              # API routes (chat, courses, patterns, search)
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   ├── not-found.tsx     # 404 page
│   ├── loading.tsx       # Loading state
│   └── error.tsx         # Error boundary
├── components/
│   ├── auth/             # LoginForm, SignupForm, OTPInput
│   ├── onboarding/       # ProgressIndicator, selectors
│   ├── chat/             # ChatInterface, Message, InputBox
│   └── layout/           # Sidebar components
├── lib/
│   ├── supabase/         # Client, server, middleware helpers
│   ├── openai/           # OpenAI client & embeddings
│   ├── rag/              # Search & generate utilities
│   └── utils.ts          # Utility functions
├── types/                # TypeScript interfaces
├── supabase/             # SQL schema
├── middleware.ts          # Auth middleware
└── .env.example          # Environment template
```

## 📊 Database Schema

The application uses the following Supabase tables:

- **user_profiles** — User info (college, branch, semester)
- **courses** — KTU course catalog
- **modules** — Course module details
- **syllabus_embeddings** — Vector embeddings for RAG search
- **question_patterns** — Topic frequency analysis
- **conversations** — Chat conversation metadata
- **messages** — Individual chat messages
- **user_progress** — Study progress tracking

## 🚢 Deployment

Deploy to Vercel:

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request
