'use client';

import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const articles = [
  {
    img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    title: 'Cybersecurity Essentials Every Developer Should Know',
    category: 'Technology',
    createdAt: 'April 13, 2025 10:55:12',
  },
  {
    img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
    title: 'The Future of Work: Remote-First Teams and Digital Tools',
    category: 'Technology',
    createdAt: 'April 13, 2025 10:55:12',
  },
  {
    img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
    title: 'Design Systems: Why Your Team Needs One in 2025',
    category: 'Technology',
    createdAt: 'April 13, 2025 10:55:12',
  },
  {
    img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    title: 'Web3 and the Decentralized Internet: What You Need to Know',
    category: 'Technology',
    createdAt: 'April 13, 2025 10:55:12',
  },
  {
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    title: 'Debugging Like a Pro: Tools & Techniques for Faster Fixes',
    category: 'Technology',
    createdAt: 'April 13, 2025 10:55:12',
  },
  {
    img: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99',
    title: 'Accessibility in Design: More Than Just Compliance',
    category: 'Technology',
    createdAt: 'April 13, 2025 10:55:12',
  },
  {
    img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
    title: "Figma's New Dev Mode: A Game-Changer for Designers & Developers",
    category: 'Technology',
    createdAt: 'April 13, 2025 10:55:12',
  },
  {
    img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
    title: 'How AI Is Changing the Game in Front-End Development',
    category: 'Technology',
    createdAt: 'April 13, 2025 10:55:12',
  },
  {
    img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    title: '10 UI Trends Dominating 2025',
    category: 'Technology',
    createdAt: 'April 13, 2025 10:55:12',
  },
];

interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  username: string;
}

interface Article {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  category: Category;
  user: User;
}

interface DummyArticle {
  img: string;
  title: string;
  category: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState('Articles');
  const [categoryTerm, setCategoryTerm] = useState('');
  const [titleTerm, setTitleTerm] = useState('');
  const [debouncedCategoryTerm, setDebouncedCategoryTerm] = useState('');
  const [debouncedTitleTerm, setDebouncedTitleTerm] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<(Article | DummyArticle)[]>(articles);
  const [apiArticles, setApiArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://test-fe.mysellerpintar.com/api/articles');
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        const data = await response.json();
        setApiArticles(data.data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching articles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCategoryTerm(categoryTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [categoryTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTitleTerm(titleTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [titleTerm]);

  useEffect(() => {
    const articlesToFilter = apiArticles.length > 0 ? apiArticles : articles;
    const filtered = articlesToFilter.filter(article => {
      const matchesCategory = !debouncedCategoryTerm || 
        ('category' in article && typeof article.category === 'object' && article.category?.name?.toLowerCase().includes(debouncedCategoryTerm.toLowerCase())) ||
        ('category' in article && typeof article.category === 'string' && article.category.toLowerCase().includes(debouncedCategoryTerm.toLowerCase()));
      const matchesTitle = !debouncedTitleTerm || 
        article.title.toLowerCase().includes(debouncedTitleTerm.toLowerCase());
      return matchesCategory && matchesTitle;
    });
    setFilteredArticles(filtered);
  }, [debouncedCategoryTerm, debouncedTitleTerm, apiArticles]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredArticles.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeMenu="Articles" setActiveMenu={() => {}} />

      {/* Main Content */}
      <main className="flex-1 p-10">
        {/* Header */}
        <Navbar title="Articles" userName="James Dean" userInitial="J" />
        
        {/* Card: Filter + Table */}
        <div className="bg-white rounded-xl shadow p-6">
          {/* Total Articles */}
          <div className="text-gray-700 font-medium mb-2">Total Articles : {filteredArticles.length}</div>
          {/* Filter Bar */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <select
                className="rounded-md px-3 py-2 border border-gray-300 text-gray-700 focus:outline-none min-w-[120px]"
                value={categoryTerm}
                onChange={(e) => setCategoryTerm(e.target.value)}
              >
                <option value="">Category</option>
                <option value="Technology">Technology</option>
                <option value="Design">Design</option>
              </select>
              <input
                type="text"
                placeholder="Search by title"
                className="rounded-md px-3 py-2 border border-gray-300 focus:outline-none min-w-[200px]"
                value={titleTerm}
                onChange={(e) => setTitleTerm(e.target.value)}
              />
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              onClick={() => router.push('/admin/create')}
            >
              + Add Articles
            </button>
          </div>
          {/* Table */}
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-600">{error}</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-sm border-b">
                  <th className="py-2 font-medium">Thumbnails</th>
                  <th className="py-2 font-medium">Title</th>
                  <th className="py-2 font-medium">Category</th>
                  <th className="py-2 font-medium">Created at</th>
                  <th className="py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((a, i) => (
                  <tr key={i} className="border-b last:border-none hover:bg-gray-50 text-gray-700 text-sm">
                    <td className="py-2">
                      {('imageUrl' in a && a.imageUrl) || ('img' in a && a.img) ? (
                        <img 
                          src={'imageUrl' in a ? String(a.imageUrl) : String(a.img)} 
                          alt={a.title} 
                          className="h-10 w-14 object-cover rounded" 
                        />
                      ) : (
                        <div className="h-10 w-14 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </td>
                    <td className="py-2">{a.title}</td>
                    <td className="py-2">
                      {'category' in a && typeof a.category === 'object' ? a.category.name : String(a.category)}
                    </td>
                    <td className="py-2">{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 space-x-2">
                      <button className="text-blue-600 hover:underline">Preview</button>
                      <button 
                        className="text-green-600 hover:underline"
                        onClick={() => router.push(`/admin/edit/${('id' in a) ? a.id : i}`)}
                      >
                        Edit
                      </button>
                      <button className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* Pagination */}
          {filteredArticles.length > itemsPerPage && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button 
                className="px-3 py-1 rounded border border-gray-300 bg-white disabled:opacity-50"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                {'<'}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`px-3 py-1 rounded border border-gray-300 bg-white ${
                    currentPage === page ? 'font-bold bg-blue-50 border-blue-500' : ''
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
              <button 
                className="px-3 py-1 rounded border border-gray-300 bg-white disabled:opacity-50"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                {'>'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
