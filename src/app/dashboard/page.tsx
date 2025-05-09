'use client';

import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

interface Article {
  id?: string;
  title: string;
  content: string;
  date?: string;
  tags?: string[];
  img?: string;
  imageUrl?: string;
  category?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 9;

  // Fetch articles from API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('https://test-fe.mysellerpintar.com/api/articles');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API Response:', data); // Debug log

        // Check if data has the expected structure
        if (data && data.data) {
          // If the API returns data in a nested structure
          const formattedArticles = Array.isArray(data.data) ? data.data.map((article: Article) => ({
            ...article,
            date: new Date(article.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            tags: article.category ? [article.category.name] : [],
            img: article.imageUrl || 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308'
          })) : [];
          console.log('Formatted Articles:', formattedArticles); // Debug log
          setArticles(formattedArticles);
          setFilteredArticles(formattedArticles);
        } else {
          // If the API returns data directly
          const formattedArticles = Array.isArray(data) ? data.map((article: Article) => ({
            ...article,
            date: new Date(article.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            tags: article.category ? [article.category.name] : [],
            img: article.imageUrl || 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308'
          })) : [];
          console.log('Formatted Articles:', formattedArticles); // Debug log
          setArticles(formattedArticles);
          setFilteredArticles(formattedArticles);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setArticles([]);
        setFilteredArticles([]);
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Debug log for articles state
  useEffect(() => {
    console.log('Current Articles State:', articles);
  }, [articles]);

  // Debug log for filtered articles
  useEffect(() => {
    console.log('Current Filtered Articles:', filteredArticles);
  }, [filteredArticles]);

  // Simulasi: jika belum login, redirect ke login
  useEffect(() => {
    // if (!localStorage.getItem('token')) router.push('/login');
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!Array.isArray(articles)) return;
      
      const filtered = articles.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredArticles(filtered);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, articles]);

  // Close dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil((Array.isArray(filteredArticles) ? filteredArticles.length : 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArticles = Array.isArray(filteredArticles) ? filteredArticles.slice(startIndex, endIndex) : [];

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of visible pages
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the start
      if (currentPage <= 2) {
        end = 4;
      }
      // Adjust if at the end
      if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="relative w-full h-[350px]">
        <img 
          src="/Image.jpg" 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-600/75">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img src="/Frame.png" alt="Logo" className="h-7 w-40" />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold focus:outline-none"
                    onClick={() => setDropdownOpen((open) => !open)}
                    aria-label="User menu"
                    type="button"
                  >
                    JD
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 z-50 border">
                      <button
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setDropdownOpen(false);
                          router.push('/profile');
                        }}
                      >
                        My Account
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setDropdownOpen(false);
                          localStorage.removeItem('token');
                          router.push('/');
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="max-w-2xl mx-auto text-center mt-8">
              <div className="uppercase text-sm tracking-widest mb-2 text-blue-100">Blog genzet</div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">The Journal : Design Resources, Interviews, and Industry News</h1>
              <p className="text-lg text-blue-100">Your daily dose of design insights!</p>
              <div className="flex gap-2 mt-6 justify-center">
                <select className="rounded-md px-3 py-2 border border-gray-300 text-gray-700 focus:outline-none bg-white">
                  <option>Select category</option>
                  <option>Technology</option>
                  <option>Design</option>
                </select>
                <input
                  type="text"
                  placeholder="Search articles"
                  className="rounded-md px-3 py-2 border border-gray-300 focus:outline-none w-64 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Article List */}
      <main className="max-w-7xl mx-auto w-full flex-1 p-10">
        <div className="mb-4 text-gray-600 text-sm">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredArticles.length)} of {filteredArticles.length} articles
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredArticles && filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {currentArticles.map((a, i) => {
              // Generate slug from title
              const slug = a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow p-4 flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/dashboard/${slug}`)}
                >
                  <div className="relative h-48 w-full mb-4">
                    <img 
                      src={a.imageUrl || 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308'} 
                      alt={a.title} 
                      className="rounded-lg w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Image failed to load:', a.imageUrl);
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308';
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 text-black mb-1">{a.date}</div>
                  <div className="font-semibold text-lg text-black mb-1 line-clamp-2">{a.title}</div>
                  <div className="text-gray-600 text-sm text-black mb-2 line-clamp-3">{a.content.replace(/<[^>]*>/g, '')}</div>
                  <div className="flex gap-2 mt-auto">
                    {a.tags && a.tags.map((tag, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{tag}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No articles found</p>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button 
              className="px-3 py-1 rounded border border-gray-300 text-black bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-black">...</span>
              ) : (
                <button
                  key={page}
                  className={`px-3 py-1 rounded border ${
                    currentPage === page 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'border-gray-300 bg-white text-black'
                  }`}
                  onClick={() => setCurrentPage(Number(page))}
                >
                  {page}
                </button>
              )
            ))}
            
            <button 
              className="px-3 py-1 rounded border border-gray-300 text-black bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
