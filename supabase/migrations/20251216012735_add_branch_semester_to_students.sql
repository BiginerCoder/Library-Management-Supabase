/*
  # Add branch and semester to students table

  1. Modified Tables
    - `students`
      - Added `branch` (text) - Student's branch/program
      - Added `semester` (integer) - Student's semester/year

  2. Important Notes
    - New columns have default values to maintain data integrity
    - Existing student records will have NULL values that can be updated
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'branch'
  ) THEN
    ALTER TABLE students ADD COLUMN branch text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'semester'
  ) THEN
    ALTER TABLE students ADD COLUMN semester integer DEFAULT 1;
  END IF;
END $$;
