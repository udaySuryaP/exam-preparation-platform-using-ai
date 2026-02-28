-- Add study_time_minutes column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS study_time_minutes FLOAT DEFAULT 0;

-- Create atomic increment function for study time
CREATE OR REPLACE FUNCTION increment_study_time(
  user_uuid UUID,
  minutes_to_add FLOAT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_profiles
  SET study_time_minutes = COALESCE(study_time_minutes, 0) + minutes_to_add,
      updated_at = NOW()
  WHERE id = user_uuid;
END;
$$;
