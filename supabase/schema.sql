-- Enable the pgvector extension for embedding storage
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- USER PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
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
);

-- ============================================
-- COURSES
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code TEXT NOT NULL UNIQUE,
  course_name TEXT NOT NULL,
  semester INTEGER NOT NULL,
  credits INTEGER DEFAULT 3,
  department TEXT DEFAULT '',
  description TEXT,
  module_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MODULES
-- ============================================
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  topics TEXT[] DEFAULT '{}',
  hours INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SYLLABUS EMBEDDINGS (Vector Search)
-- ============================================
CREATE TABLE IF NOT EXISTS syllabus_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast vector search
CREATE INDEX IF NOT EXISTS syllabus_embeddings_embedding_idx
  ON syllabus_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================
-- QUESTION PATTERNS
-- ============================================
CREATE TABLE IF NOT EXISTS question_patterns (
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
);

-- ============================================
-- CONVERSATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER PROGRESS
-- ============================================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  questions_asked INTEGER DEFAULT 0,
  study_time_minutes INTEGER DEFAULT 0,
  last_studied TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- ============================================
-- VECTOR SEARCH FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION match_syllabus(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_course_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    se.id,
    se.content,
    1 - (se.embedding <=> query_embedding) AS similarity,
    se.metadata
  FROM syllabus_embeddings se
  WHERE
    (filter_course_id IS NULL OR se.course_id = filter_course_id)
    AND 1 - (se.embedding <=> query_embedding) > match_threshold
  ORDER BY se.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- User Profiles: users can CRUD their own profile
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Courses: publicly readable
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Courses are publicly readable" ON courses
  FOR SELECT USING (true);

-- Modules: publicly readable
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Modules are publicly readable" ON modules
  FOR SELECT USING (true);

-- Syllabus Embeddings: publicly readable for search
ALTER TABLE syllabus_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Embeddings are publicly readable" ON syllabus_embeddings
  FOR SELECT USING (true);

-- Question Patterns: publicly readable
ALTER TABLE question_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patterns are publicly readable" ON question_patterns
  FOR SELECT USING (true);

-- Conversations: users can CRUD their own conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Messages: users can CRUD messages in their conversations
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages in own conversations" ON messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()
    )
  );

-- User Progress: users can CRUD their own progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
