import { useState } from 'react';
import { BookOpen, Users, LibraryBig, LogOut } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import StudentsPage from './pages/StudentsPage';
import BooksPage from './pages/BooksPage';
import BorrowPage from './pages/BorrowPage';
import LoginPage from './pages/LoginPage';

type Page = 'students' | 'books' | 'borrow';

function App() {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('borrow');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <LoginPage />;
  }

  const navigation = [
    { id: 'borrow' as Page, name: 'Borrow Management', icon: LibraryBig },
    { id: 'students' as Page, name: 'Students', icon: Users },
    { id: 'books' as Page, name: 'Books', icon: BookOpen },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <LibraryBig className="text-blue-600" size={32} />
              <h1 className="text-2xl font-bold text-gray-900">Library Management</h1>
            </div>
            <div className="flex gap-2 items-center">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      currentPage === item.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="hidden sm:inline">{item.name}</span>
                  </button>
                );
              })}
              <div className="ml-4 pl-4 border-l border-gray-200 flex items-center gap-3">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 transition-colors"
                  title="Sign out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'students' && <StudentsPage />}
        {currentPage === 'books' && <BooksPage />}
        {currentPage === 'borrow' && <BorrowPage />}
      </main>
    </div>
  );
}

export default App;
