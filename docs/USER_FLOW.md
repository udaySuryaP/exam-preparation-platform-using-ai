# User Flow

A detailed breakdown of every user journey in the application, including navigation paths, actions, and system responses.

---

## 1. Landing Page (`/`)

**Trigger**: User visits the app for the first time or while unauthenticated.

```
User visits /
    │
    ├── Views landing page with:
    │   ├── Hero section (app description, CTA buttons)
    │   ├── Features section (AI Answers, Exam Patterns, Smart Study)
    │   ├── How It Works section (3 steps)
    │   └── Footer
    │
    ├── Clicks "Get Started Free" → Navigates to /signup
    └── Clicks "Sign In" → Navigates to /login
```

---

## 2. Sign Up (`/signup`)

**Trigger**: New user clicks "Get Started" or navigates to `/signup`.

```
User on /signup
    │
    ├── Fills form:
    │   ├── Full Name (required, 2-100 chars)
    │   ├── Email (required, valid format)
    │   ├── Password (required, 8+ chars, strength indicator shown)
    │   └── Confirm Password (must match)
    │
    ├── Clicks "Create Account"
    │   ├── [SUCCESS] Supabase creates auth user
    │   │   ├── Creates user_profiles row (full_name, email, onboarding_completed=false)
    │   │   └── Redirects → /onboarding/step-1
    │   │
    │   ├── [RATE LIMIT] Shows "Too many attempts. Please wait."
    │   ├── [DUPLICATE] Shows "An account with this email already exists"
    │   └── [NETWORK ERROR] Shows "Unable to connect to the server"
    │
    └── Clicks "Sign In" link → Navigates to /login
```

---

## 3. Sign In (`/login`)

**Trigger**: Existing user returns to login.

```
User on /login
    │
    ├── Fills form:
    │   ├── Email (required)
    │   └── Password (required)
    │
    ├── Clicks "Sign In"
    │   ├── [SUCCESS]
    │   │   ├── Middleware checks onboarding_completed
    │   │   ├── If onboarding NOT completed → /onboarding/step-1
    │   │   └── If onboarding completed → /chat
    │   │
    │   ├── [WRONG CREDENTIALS] Shows "Invalid email or password"
    │   └── [NETWORK ERROR] Shows "Unable to connect to the server"
    │
    └── Clicks "Create Account" link → Navigates to /signup
```

---

## 4. Onboarding (`/onboarding/step-1` → `step-4`)

**Trigger**: User just signed up or hasn't completed onboarding yet. Middleware enforces this for all dashboard routes.

```
Step 1: Tell Us About Yourself (/onboarding/step-1)
    ├── College Name → Searchable dropdown (130+ KTU colleges + "Other")
    ├── Graduation Year → Dropdown (2024-2030)
    └── [Continue] → Saves to localStorage, goes to step-2

Step 2: Select Your Branch (/onboarding/step-2)
    ├── Shows department cards (CSE, CE, ME, EEE, ECE)
    ├── Click to select one
    └── [Continue] → Saves to localStorage, goes to step-3

Step 3: Select Your Semester (/onboarding/step-3)
    ├── Shows semester buttons (1-8)
    ├── Click to select one
    └── [Continue] → Saves to localStorage, goes to step-4

Step 4: How Did You Hear About Us? (/onboarding/step-4)
    ├── Shows referral source options (Friend, Instagram, WhatsApp, Google, etc.)
    ├── Click to select one
    └── [Complete Setup]
        ├── Reads all data from localStorage
        ├── Calls API to update user_profiles with all fields
        ├── Sets onboarding_completed = true
        └── Redirects → /chat
```

---

## 5. Dashboard — Chat (`/chat`)

**Trigger**: Authenticated user with completed onboarding.

```
User on /chat (no conversation selected)
    │
    ├── Sidebar shows:
    │   ├── App logo (KTU Exam Prep)
    │   ├── New Chat button
    │   ├── Navigation links (Patterns, Courses)
    │   ├── Recent Chats list (last 50, ordered by updated_at)
    │   └── User profile (name, avatar, sign out)
    │
    ├── Main area shows:
    │   ├── Welcome screen with suggested prompts
    │   └── Input box at bottom
    │
    ├── User types a message and sends
    │   ├── Message appears instantly (optimistic)
    │   ├── POST /api/chat with message + optional conversationId
    │   ├── API creates conversation (if new), saves user message, calls OpenAI
    │   ├── AI response appears with markdown rendering
    │   ├── URL updates to /chat?id=<conversation_id>
    │   ├── Sidebar updates with new conversation (custom event)
    │   └── Study timer ticking in background
    │
    └── User clicks a chat in sidebar
        ├── Navigates to /chat?id=<id>
        ├── Loads all messages from Supabase
        └── Shows conversation with full history

User on /chat?id=<conversation_id>
    │
    ├── Chat history loaded from database
    ├── Can continue conversation
    ├── Can rename chat (via sidebar context menu)
    ├── Can delete chat (via sidebar context menu)
    └── Can start new chat (New Chat button → /chat with no id)
```

---

## 6. Dashboard — Courses (`/courses`)

**Trigger**: User clicks "Courses" in sidebar navigation.

```
User on /courses
    │
    ├── Fetches all courses from /api/courses
    ├── Displays course cards organized by semester
    ├── Each card shows: course code, name, credits, module count
    └── (Future: click to filter chat by course)
```

---

## 7. Dashboard — Exam Patterns (`/patterns`)

**Trigger**: User clicks "Patterns" in sidebar navigation.

```
User on /patterns
    │
    ├── Fetches question patterns from /api/patterns
    ├── Shows topic-wise frequency analysis
    ├── Each pattern shows:
    │   ├── Topic name
    │   ├── Part A/B/C frequency
    │   ├── Priority badge (HIGH/MEDIUM/LOW)
    │   └── Years appeared
    └── Helps students focus on high-frequency topics
```

---

## 8. Dashboard — Profile (`/profile`)

**Trigger**: User clicks their profile in the sidebar or navigates to `/profile`.

```
User on /profile
    │
    ├── Loads profile from /api/profile
    ├── Shows:
    │   ├── Avatar (initials-based)
    │   ├── Name and email
    │   ├── Editable form: Name, College (searchable dropdown), Department, Semester
    │   └── Usage Statistics:
    │       ├── Questions Asked (total user messages)
    │       └── Study Time (live ticking HH:MM:SS timer)
    │
    ├── User edits fields and clicks "Save Changes"
    │   ├── PUT /api/profile with updated data
    │   ├── Server validates and updates user_profiles
    │   └── Success/error toast shown
    │
    └── Study timer ticks in real-time showing lifetime active time
```

---

## 9. Middleware & Route Protection

The middleware (proxy) runs on **every navigation** and enforces:

```
Request to any route
    │
    ├── Is it a public route? (/,  /login, /signup, /verify-email, /auth/callback)
    │   └── YES → Allow through
    │
    ├── Is user authenticated?
    │   └── NO → Redirect to /login
    │
    ├── Is user on /login or /signup while authenticated?
    │   └── YES → Redirect to /chat
    │
    ├── Is user on a dashboard route?
    │   ├── Check user_profiles.onboarding_completed
    │   └── NOT completed → Redirect to /onboarding/step-1
    │
    └── Is user on /onboarding while onboarding IS completed?
        └── YES → Redirect to /chat
```

---

## 10. Study Timer (Background)

Runs invisibly on all dashboard pages via the `<StudyTimerTracker />` component.

```
User enters any dashboard page
    │
    ├── useStudyTimer() starts
    │   ├── Records session start timestamp
    │   └── Begins tracking active time
    │
    ├── User switches tab / minimizes
    │   ├── visibilitychange + blur events fire
    │   ├── Timer PAUSES
    │   └── Accumulated time saved to /api/study-time
    │
    ├── User returns to tab
    │   ├── visibilitychange + focus events fire
    │   └── Timer RESUMES from new timestamp
    │
    ├── Every 60 seconds (while active)
    │   └── Flushes accumulated time to database via /api/study-time
    │
    └── User closes tab
        └── navigator.sendBeacon saves final time (reliable unload)
```

---

## 11. Sign Out

```
User clicks Sign Out (in sidebar UserProfile)
    │
    ├── Calls supabase.auth.signOut()
    ├── Session cookies cleared
    └── Redirects to /login
```
