import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Student = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  branch: string;
  semester: number;
  created_at: string;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  quantity: number;
  available_quantity: number;
  created_at: string;
};

export type Borrow = {
  id: string;
  student_id: string;
  book_id: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: 'borrowed' | 'returned';
  created_at: string;
};

export type BorrowWithDetails = Borrow & {
  students: Student;
  books: Book;
};
