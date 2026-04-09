-- Add study_time_minutes column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS study_time_minutes FLOAT DEFAULT 0;

-- Add constraint to prevent negative study time
ALTER TABLE user_profiles
ADD CONSTRAINT IF NOT EXISTS study_time_non_negative CHECK (study_time_minutes >= 0);

-- Create atomic increment function for study time (with auth + input validation)
CREATE OR REPLACE FUNCTION increment_study_time(
  user_uuid UUID,
  minutes_to_add FLOAT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow users to increment their own study time
  IF auth.uid() IS NOT NULL AND user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: cannot modify another user''s study time';
  END IF;

  -- Validate input range (max 5 minutes per call)
  IF minutes_to_add <= 0 OR minutes_to_add > 5 THEN
    RAISE EXCEPTION 'minutes_to_add must be between 0 and 5';
  END IF;

  UPDATE user_profiles
  SET study_time_minutes = COALESCE(study_time_minutes, 0) + minutes_to_add,
      updated_at = NOW()
  WHERE id = user_uuid;
END;
$$;
