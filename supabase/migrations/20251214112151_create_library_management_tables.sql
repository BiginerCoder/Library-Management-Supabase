/*
  # Library Management System Schema

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email` (text, unique, required)
      - `phone` (text)
      - `created_at` (timestamptz)
    
    - `books`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `author` (text, required)
      - `isbn` (text, unique)
      - `quantity` (integer, total copies)
      - `available_quantity` (integer, available copies)
      - `created_at` (timestamptz)
    
    - `borrows`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to students)
      - `book_id` (uuid, foreign key to books)
      - `borrow_date` (timestamptz)
      - `due_date` (timestamptz)
      - `return_date` (timestamptz, nullable)
      - `status` (text, 'borrowed' or 'returned')
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (for demo purposes)
    
  3. Important Notes
    - Books track both total quantity and available quantity
    - Borrows track the full lifecycle of book lending
    - All timestamps are stored in UTC
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  isbn text UNIQUE,
  quantity integer NOT NULL DEFAULT 1,
  available_quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create borrows table
CREATE TABLE IF NOT EXISTS borrows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  borrow_date timestamptz NOT NULL DEFAULT now(),
  due_date timestamptz NOT NULL,
  return_date timestamptz,
  status text NOT NULL DEFAULT 'borrowed',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrows ENABLE ROW LEVEL SECURITY;

-- Create policies for students (public access for demo)
CREATE POLICY "Allow public to view students"
  ON students FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public to insert students"
  ON students FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public to update students"
  ON students FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public to delete students"
  ON students FOR DELETE
  TO public
  USING (true);

-- Create policies for books (public access for demo)
CREATE POLICY "Allow public to view books"
  ON books FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public to insert books"
  ON books FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public to update books"
  ON books FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public to delete books"
  ON books FOR DELETE
  TO public
  USING (true);

-- Create policies for borrows (public access for demo)
CREATE POLICY "Allow public to view borrows"
  ON borrows FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public to insert borrows"
  ON borrows FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public to update borrows"
  ON borrows FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public to delete borrows"
  ON borrows FOR DELETE
  TO public
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_borrows_student_id ON borrows(student_id);
CREATE INDEX IF NOT EXISTS idx_borrows_book_id ON borrows(book_id);
CREATE INDEX IF NOT EXISTS idx_borrows_status ON borrows(status);
