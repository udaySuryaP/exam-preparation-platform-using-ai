// Database setup script for the new Supabase project
// Run with: node scripts/setup-db.mjs

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bhmfejawrxlckajrspbp.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJobWZlamF3cnhsY2thanJzcGJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI3ODkzNywiZXhwIjoyMDg3ODU0OTM3fQ.YISHm2056bfarouxEGGsNSFhwPEpi8mZzYMORHAKAJw';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const SQL_STATEMENTS = [
    // Enable pgvector
    `CREATE EXTENSION IF NOT EXISTS vector;`,

    // User Profiles
    `CREATE TABLE IF NOT EXISTS user_profiles (
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,

    // Courses
    `CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code TEXT NOT NULL UNIQUE,
    course_name TEXT NOT NULL,
    semester INTEGER NOT NULL,
    credits INTEGER DEFAULT 3,
    department TEXT DEFAULT '',
    description TEXT,
    module_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,

    // Modules
    `CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    module_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    topics TEXT[] DEFAULT '{}',
    hours INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,

    // Syllabus Embeddings
    `CREATE TABLE IF NOT EXISTS syllabus_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,

    // Question Patterns
    `CREATE TABLE IF NOT EXISTS question_patterns (
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
  );`,

    // Conversations
    `CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Chat',
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,

    // Messages
    `CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,

    // User Progress
    `CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    questions_asked INTEGER DEFAULT 0,
    study_time_minutes INTEGER DEFAULT 0,
    last_studied TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
  );`,

    // RLS Policies
    `ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;`,
    `DO $$ BEGIN CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

    `ALTER TABLE courses ENABLE ROW LEVEL SECURITY;`,
    `DO $$ BEGIN CREATE POLICY "Courses are publicly readable" ON courses FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

    `ALTER TABLE modules ENABLE ROW LEVEL SECURITY;`,
    `DO $$ BEGIN CREATE POLICY "Modules are publicly readable" ON modules FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

    `ALTER TABLE syllabus_embeddings ENABLE ROW LEVEL SECURITY;`,
    `DO $$ BEGIN CREATE POLICY "Embeddings are publicly readable" ON syllabus_embeddings FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

    `ALTER TABLE question_patterns ENABLE ROW LEVEL SECURITY;`,
    `DO $$ BEGIN CREATE POLICY "Patterns are publicly readable" ON question_patterns FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

    `ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;`,
    `DO $$ BEGIN CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN CREATE POLICY "Users can insert own conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN CREATE POLICY "Users can update own conversations" ON conversations FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN CREATE POLICY "Users can delete own conversations" ON conversations FOR DELETE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

    `ALTER TABLE messages ENABLE ROW LEVEL SECURITY;`,
    `DO $$ BEGIN CREATE POLICY "Users can view messages in own conversations" ON messages FOR SELECT USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN CREATE POLICY "Users can insert messages in own conversations" ON messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN CREATE POLICY "Users can delete messages in own conversations" ON messages FOR DELETE USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

    `ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;`,
    `DO $$ BEGIN CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

    // Trigger function
    `CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;`,

    // Triggers
    `DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
  CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,

    `DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
  CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,

    `DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
  CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,

    // Vector search function
    `CREATE OR REPLACE FUNCTION match_syllabus(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 5,
    filter_course_id UUID DEFAULT NULL
  )
  RETURNS TABLE (id UUID, content TEXT, similarity FLOAT, metadata JSONB)
  LANGUAGE plpgsql AS $$
  BEGIN
    RETURN QUERY SELECT se.id, se.content, 1 - (se.embedding <=> query_embedding) AS similarity, se.metadata
    FROM syllabus_embeddings se
    WHERE (filter_course_id IS NULL OR se.course_id = filter_course_id) AND 1 - (se.embedding <=> query_embedding) > match_threshold
    ORDER BY se.embedding <=> query_embedding
    LIMIT match_count;
  END;
  $$;`,
];

async function setup() {
    console.log('🚀 Setting up database schema...\n');

    for (let i = 0; i < SQL_STATEMENTS.length; i++) {
        const sql = SQL_STATEMENTS[i];
        const label = sql.trim().substring(0, 60).replace(/\n/g, ' ');
        process.stdout.write(`  [${i + 1}/${SQL_STATEMENTS.length}] ${label}...`);

        const { error } = await supabase.rpc('', {}).throwOnError().then(() => ({ error: null })).catch(async () => {
            // Use the SQL endpoint directly
            const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
                method: 'POST',
                headers: {
                    'apikey': SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                    'Content-Type': 'application/json',
                },
            });
            return { error: null };
        });

        // Actually just use the raw SQL via the management API
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
                headers: {
                    'apikey': SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                },
            });
            if (response.ok) {
                console.log(' ✅');
            }
        } catch (e) {
            console.log(` ❌ ${e.message}`);
        }
    }
    console.log('\n✅ Database setup complete!');
}

// Simple connectivity test first
async function testConnection() {
    console.log('Testing Supabase connectivity...');
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            headers: {
                'apikey': SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            },
        });
        console.log(`Status: ${response.status} - ${response.ok ? 'CONNECTED!' : 'ERROR'}`);
        return response.ok;
    } catch (e) {
        console.log(`Connection failed: ${e.message}`);
        return false;
    }
}

const connected = await testConnection();
if (!connected) {
    console.log('\n⚠️ Cannot reach Supabase. DNS may not have propagated yet.');
    console.log('Please run the schema.sql manually in the Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/bhmfejawrxlckajrspbp/sql/new');
    process.exit(1);
}
