import { useState, useEffect } from 'react';
import { supabase, type BorrowWithDetails, type Student, type Book } from '../lib/supabase';
import { BookOpen, X, CheckCircle } from 'lucide-react';

export default function BorrowPage() {
  const [borrows, setBorrows] = useState<BorrowWithDetails[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    book_id: '',
    due_date: '',
  });

  useEffect(() => {
    fetchBorrows();
    fetchStudents();
    fetchBooks();
  }, []);

  const fetchBorrows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('borrows')
      .select(`
        *,
        students (*),
        books (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching borrows:', error);
    } else {
      setBorrows(data || []);
    }
    setLoading(false);
  };

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('students')
      .select('*')
      .order('name');
    setStudents(data || []);
  };

  const fetchBooks = async () => {
    const { data } = await supabase
      .from('books')
      .select('*')
      .gt('available_quantity', 0)
      .order('title');
    setBooks(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedBook = books.find(b => b.id === formData.book_id);
    if (!selectedBook || selectedBook.available_quantity < 1) {
      alert('This book is not available for borrowing.');
      return;
    }

    const { error: borrowError } = await supabase.from('borrows').insert([{
      student_id: formData.student_id,
      book_id: formData.book_id,
      due_date: formData.due_date,
      status: 'borrowed',
    }]);

    if (borrowError) {
      console.error('Error creating borrow:', borrowError);
      return;
    }

    const { error: updateError } = await supabase
      .from('books')
      .update({ available_quantity: selectedBook.available_quantity - 1 })
      .eq('id', formData.book_id);

    if (updateError) {
      console.error('Error updating book availability:', updateError);
      return;
    }

    await fetchBorrows();
    await fetchBooks();
    resetForm();
  };

  const handleReturn = async (borrow: BorrowWithDetails) => {
    if (confirm('Mark this book as returned?')) {
      const { error: borrowError } = await supabase
        .from('borrows')
        .update({
          status: 'returned',
          return_date: new Date().toISOString(),
        })
        .eq('id', borrow.id);

      if (borrowError) {
        console.error('Error returning book:', borrowError);
        return;
      }

      const { error: updateError } = await supabase
        .from('books')
        .update({ available_quantity: borrow.books.available_quantity + 1 })
        .eq('id', borrow.book_id);

      if (updateError) {
        console.error('Error updating book availability:', updateError);
        return;
      }

      await fetchBorrows();
      await fetchBooks();
    }
  };

  const resetForm = () => {
    setFormData({ student_id: '', book_id: '', due_date: '' });
    setShowForm(false);
  };

  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Borrow Management</h2>
        <button
          onClick={() => {
            setFormData({ ...formData, due_date: getDefaultDueDate() });
            setShowForm(true);
          }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <BookOpen size={20} />
          New Borrow
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create New Borrow</h3>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student *
                </label>
                <select
                  required
                  value={formData.student_id}
                  onChange={(e) =>
                    setFormData({ ...formData, student_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Book *
                </label>
                <select
                  required
                  value={formData.book_id}
                  onChange={(e) =>
                    setFormData({ ...formData, book_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select a book</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} by {book.author} (Available: {book.available_quantity})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.due_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition-colors"
                >
                  Create Borrow
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Borrows</h3>
              {borrows.filter((b) => b.status === 'borrowed').length === 0 ? (
                <p className="text-gray-500 text-center py-4">No active borrows</p>
              ) : (
                <div className="space-y-3">
                  {borrows
                    .filter((b) => b.status === 'borrowed')
                    .map((borrow) => {
                      const dueDate = new Date(borrow.due_date);
                      const isOverdue = dueDate < new Date();
                      return (
                        <div
                          key={borrow.id}
                          className={`border rounded-lg p-4 ${
                            isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {borrow.books.title}
                              </p>
                              <p className="text-sm text-gray-600">
                                {borrow.students.name}
                              </p>
                            </div>
                            <button
                              onClick={() => handleReturn(borrow)}
                              className="text-green-600 hover:text-green-800"
                              title="Mark as returned"
                            >
                              <CheckCircle size={20} />
                            </button>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Borrowed: {new Date(borrow.borrow_date).toLocaleDateString()}</span>
                            <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                              Due: {dueDate.toLocaleDateString()}
                            </span>
                          </div>
                          {isOverdue && (
                            <p className="text-xs text-red-600 font-semibold mt-1">
                              OVERDUE
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recently Returned</h3>
              {borrows.filter((b) => b.status === 'returned').length === 0 ? (
                <p className="text-gray-500 text-center py-4">No returned books yet</p>
              ) : (
                <div className="space-y-3">
                  {borrows
                    .filter((b) => b.status === 'returned')
                    .slice(0, 5)
                    .map((borrow) => (
                      <div
                        key={borrow.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <p className="font-semibold text-gray-900">
                          {borrow.books.title}
                        </p>
                        <p className="text-sm text-gray-600">{borrow.students.name}</p>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>Borrowed: {new Date(borrow.borrow_date).toLocaleDateString()}</span>
                          <span>Returned: {borrow.return_date ? new Date(borrow.return_date).toLocaleDateString() : '-'}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
