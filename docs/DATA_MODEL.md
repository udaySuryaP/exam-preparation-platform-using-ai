# Data Model

A detailed reference of all database tables, columns, types, constraints, relationships, and security policies.

---

## Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   auth.users     │       │  user_profiles    │       │  user_progress   │
│  (Supabase Auth) │       │                   │       │                  │
│──────────────────│       │──────────────────│       │──────────────────│
│ id (UUID) PK     │◄──────│ id (UUID) PK, FK  │       │ id (UUID) PK     │
│ email            │       │ full_name         │       │ user_id (FK)     │──► auth.users
│ user_metadata    │       │ email             │       │ course_id (FK)   │──► courses
│ ...              │       │ college_name      │       │ questions_asked  │
└──────────────────┘       │ branch            │       │ study_time_min   │
         │                 │ semester          │       │ last_studied     │
         │                 │ graduation_year   │       └──────────────────┘
         │                 │ study_time_minutes│
         │                 │ onboarding_done   │
         │                 └──────────────────┘
         │
         │         ┌──────────────────┐       ┌──────────────────┐
         │         │  conversations   │       │    messages       │
         │         │──────────────────│       │──────────────────│
         └────────►│ id (UUID) PK     │◄──────│ id (UUID) PK     │
                   │ user_id (FK)     │       │ conversation_id  │
                   │ title            │       │ role             │
                   │ course_id (FK)   │──┐    │ content          │
                   │ updated_at       │  │    │ sources (JSONB)  │
                   └──────────────────┘  │    └──────────────────┘
                                         │
         ┌───────────────────────────────┘
         │
         ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    courses       │       │    modules        │       │ question_patterns│
│──────────────────│       │──────────────────│       │──────────────────│
│ id (UUID) PK     │◄──────│ id (UUID) PK     │       │ id (UUID) PK     │
│ course_code (UQ) │       │ course_id (FK)   │       │ course_id (FK)   │──► courses
│ course_name      │       │ module_number    │       │ topic            │
│ semester         │       │ title            │       │ part_a/b/c_freq  │
│ credits          │       │ topics (TEXT[])  │       │ priority         │
│ department       │       │ hours            │       │ years_appeared   │
│ module_count     │       └──────────────────┘       └──────────────────┘
└──────────────────┘
         │
         ▼
┌──────────────────────┐
│ syllabus_embeddings  │
│──────────────────────│
│ id (UUID) PK         │
│ course_id (FK)       │
│ content (TEXT)        │
│ embedding VECTOR(1536)│
│ metadata (JSONB)     │
└──────────────────────┘
```

---

## Tables

### `user_profiles`

Stores user profile data linked 1:1 with Supabase Auth users.

| Column | Type | Default | Constraints | Description |
|--------|------|---------|-------------|-------------|
| `id` | UUID | — | PK, FK → `auth.users(id)` ON DELETE CASCADE | User's auth ID |
| `full_name` | TEXT | `''` | NOT NULL | Display name |
| `email` | TEXT | `''` | NOT NULL | Email (denormalized from auth) |
| `avatar_url` | TEXT | NULL | — | Profile picture URL |
| `college_name` | TEXT | `''` | — | Selected college from KTU list |
| `graduation_year` | INTEGER | `2025` | — | Expected graduation year |
| `branch` | TEXT | `''` | — | Department/branch (e.g., `cse`, `ece`) |
| `semester` | INTEGER | `1` | — | Current semester (1-8) |
| `referral_source` | TEXT | NULL | — | How they found the app |
| `onboarding_completed` | BOOLEAN | `FALSE` | — | Whether 4-step onboarding is done |
| `study_time_minutes` | FLOAT | `0` | — | Lifetime active study time in minutes |
| `created_at` | TIMESTAMPTZ | `NOW()` | — | Account creation time |
| `updated_at` | TIMESTAMPTZ | `NOW()` | — | Last profile update (auto-trigger) |

**RLS Policies**: Users can SELECT, INSERT, UPDATE **only their own row** (`auth.uid() = id`).

---

### `courses`

Academic courses offered under KTU curriculum.

| Column | Type | Default | Constraints | Description |
|--------|------|---------|-------------|-------------|
| `id` | UUID | `gen_random_uuid()` | PK | Auto-generated ID |
| `course_code` | TEXT | — | NOT NULL, UNIQUE | e.g., `CS301`, `EC201` |
| `course_name` | TEXT | — | NOT NULL | e.g., `Data Structures` |
| `semester` | INTEGER | — | NOT NULL | Which semester (1-8) |
| `credits` | INTEGER | `3` | — | Credit hours |
| `department` | TEXT | `''` | — | Department code |
| `description` | TEXT | NULL | — | Course description |
| `module_count` | INTEGER | `0` | — | Number of modules |
| `created_at` | TIMESTAMPTZ | `NOW()` | — | Record creation |

**RLS Policies**: Publicly readable (SELECT for all), write restricted.

---

### `modules`

Modules within a course, each covering specific topics.

| Column | Type | Default | Constraints | Description |
|--------|------|---------|-------------|-------------|
| `id` | UUID | `gen_random_uuid()` | PK | Auto-generated ID |
| `course_id` | UUID | — | NOT NULL, FK → `courses(id)` CASCADE | Parent course |
| `module_number` | INTEGER | — | NOT NULL | Module sequence (1, 2, 3...) |
| `title` | TEXT | — | NOT NULL | Module title |
| `topics` | TEXT[] | `'{}'` | — | Array of topic strings |
| `hours` | INTEGER | `0` | — | Teaching hours allocated |
| `created_at` | TIMESTAMPTZ | `NOW()` | — | Record creation |

**RLS Policies**: Publicly readable.

---

### `conversations`

Chat conversation threads for each user.

| Column | Type | Default | Constraints | Description |
|--------|------|---------|-------------|-------------|
| `id` | UUID | `gen_random_uuid()` | PK | Conversation ID |
| `user_id` | UUID | — | NOT NULL, FK → `auth.users(id)` CASCADE | Owner |
| `title` | TEXT | `'New Chat'` | NOT NULL | Title (auto-generated from first message) |
| `course_id` | UUID | NULL | FK → `courses(id)` SET NULL | Associated course |
| `created_at` | TIMESTAMPTZ | `NOW()` | — | Conversation start |
| `updated_at` | TIMESTAMPTZ | `NOW()` | — | Last message time (auto-trigger) |

**RLS Policies**: Users can SELECT, INSERT, UPDATE, DELETE **only their own conversations** (`auth.uid() = user_id`).

---

### `messages`

Individual messages within conversations.

| Column | Type | Default | Constraints | Description |
|--------|------|---------|-------------|-------------|
| `id` | UUID | `gen_random_uuid()` | PK | Message ID |
| `conversation_id` | UUID | — | NOT NULL, FK → `conversations(id)` CASCADE | Parent conversation |
| `role` | TEXT | — | NOT NULL, CHECK (`user` or `assistant`) | Who sent it |
| `content` | TEXT | — | NOT NULL | Message text (supports markdown) |
| `sources` | JSONB | `'[]'` | — | AI source references (course, module, topic, similarity) |
| `created_at` | TIMESTAMPTZ | `NOW()` | — | Message timestamp |

**RLS Policies**: Users can SELECT, INSERT, DELETE messages **in their own conversations** (via subquery on `conversations.user_id`).

---

### `syllabus_embeddings`

Vector embeddings of syllabus content for AI-powered semantic search.

| Column | Type | Default | Constraints | Description |
|--------|------|---------|-------------|-------------|
| `id` | UUID | `gen_random_uuid()` | PK | Embedding ID |
| `course_id` | UUID | — | NOT NULL, FK → `courses(id)` CASCADE | Associated course |
| `content` | TEXT | — | NOT NULL | Original text chunk |
| `embedding` | VECTOR(1536) | — | — | OpenAI embedding vector (1536 dimensions) |
| `metadata` | JSONB | `'{}'` | — | Module number, topic, source reference |
| `created_at` | TIMESTAMPTZ | `NOW()` | — | Record creation |

**Index**: IVFFlat index on `embedding` column using cosine distance (`vector_cosine_ops`, lists=100).

**RLS Policies**: Publicly readable.

---

### `question_patterns`

Exam question frequency analysis per topic.

| Column | Type | Default | Constraints | Description |
|--------|------|---------|-------------|-------------|
| `id` | UUID | `gen_random_uuid()` | PK | Pattern ID |
| `course_id` | UUID | — | NOT NULL, FK → `courses(id)` CASCADE | Associated course |
| `topic` | TEXT | — | NOT NULL | Topic name |
| `part_a_frequency` | INTEGER | `0` | — | Times appeared in Part A |
| `part_b_frequency` | INTEGER | `0` | — | Times appeared in Part B |
| `part_c_frequency` | INTEGER | `0` | — | Times appeared in Part C |
| `total_frequency` | INTEGER | `0` | — | Total appearances |
| `priority` | TEXT | `'LOW'` | CHECK (`HIGH`, `MEDIUM`, `LOW`) | Computed priority |
| `years_appeared` | TEXT[] | `'{}'` | — | List of exam years |
| `created_at` | TIMESTAMPTZ | `NOW()` | — | Record creation |

**RLS Policies**: Publicly readable.

---

### `user_progress`

Per-course progress tracking for each user.

| Column | Type | Default | Constraints | Description |
|--------|------|---------|-------------|-------------|
| `id` | UUID | `gen_random_uuid()` | PK | Progress ID |
| `user_id` | UUID | — | NOT NULL, FK → `auth.users(id)` CASCADE | User |
| `course_id` | UUID | — | NOT NULL, FK → `courses(id)` CASCADE | Course |
| `questions_asked` | INTEGER | `0` | — | Questions asked in this course |
| `study_time_minutes` | INTEGER | `0` | — | Study time for this course |
| `last_studied` | TIMESTAMPTZ | `NOW()` | — | Last activity |
| `created_at` | TIMESTAMPTZ | `NOW()` | — | Record creation |
| `updated_at` | TIMESTAMPTZ | `NOW()` | — | Last update (auto-trigger) |

**Constraints**: UNIQUE on `(user_id, course_id)` — one row per user per course.

**RLS Policies**: Users can SELECT, INSERT, UPDATE **only their own progress**.

---

## Database Functions

### `match_syllabus(query_embedding, match_threshold, match_count, filter_course_id)`

Vector similarity search for finding relevant syllabus content.

- **Parameters**: query embedding (1536d vector), similarity threshold (default 0.7), result limit (default 5), optional course filter
- **Returns**: `id`, `content`, `similarity` score, `metadata`
- **Algorithm**: Cosine distance (`<=>` operator) with IVFFlat index

### `increment_study_time(user_uuid, minutes_to_add)`

Atomically increments a user's `study_time_minutes` in `user_profiles`.

- **Parameters**: user UUID, minutes to add (float)
- **Security**: `SECURITY DEFINER` — runs with elevated privileges
- **Purpose**: Called by `/api/study-time` to safely increment without read-modify-write races

### `update_updated_at_column()`

Trigger function that sets `updated_at = NOW()` on row updates.

- **Applied to**: `user_profiles`, `conversations`, `user_progress`
- **Trigger**: `BEFORE UPDATE FOR EACH ROW`

---

## Row Level Security (RLS) Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `user_profiles` | Own row only | Own row only | Own row only | — |
| `courses` | Public | — | — | — |
| `modules` | Public | — | — | — |
| `syllabus_embeddings` | Public | — | — | — |
| `question_patterns` | Public | — | — | — |
| `conversations` | Own only | Own only | Own only | Own only |
| `messages` | Own conversations | Own conversations | — | Own conversations |
| `user_progress` | Own only | Own only | Own only | — |

> All "Own only" policies use `auth.uid() = user_id` (or subquery via `conversations.user_id` for messages).
