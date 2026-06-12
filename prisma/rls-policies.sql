-- Row-Level Security policies for Supabase
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Fix column types — Supabase Auth uses uuid, but Prisma String → text
-- This converts user_id columns to the correct type
ALTER TABLE assessments ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE reports ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Step 2: Enable RLS on all three tables
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Step 3: assessments — can only read/write own records
CREATE POLICY "Users can access own assessments" ON assessments
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Step 4: reports — can only read/write own records
CREATE POLICY "Users can access own reports" ON reports
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Step 5: answers — verify ownership through join with assessments
CREATE POLICY "Users can access answers of own assessments" ON answers
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = answers.assessment_id
        AND assessments.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = answers.assessment_id
        AND assessments.user_id = auth.uid()
    )
  );
