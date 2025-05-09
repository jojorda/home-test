'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  userId: string;
  categoryId: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export default function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        const token = getAuthToken();
        if (!token) {
          router.push('/login'); // Redirect to login if no token
          return;
        }

        const response = await axios.get(
          `https://test-fe.mysellerpintar.com/api/articles/${resolvedParams.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        const articleData = response.data;
        setArticle(articleData);
        setTitle(articleData.title);
        setContent(articleData.content);
        setCategoryId(articleData.categoryId);
      } catch (err: any) {
        if (err.response?.status === 401) {
          router.push('/login'); // Redirect to login if unauthorized
        } else {
          setError('Failed to fetch article');
          console.error('Error fetching article:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        const response = await axios.get(
          'https://test-fe.mysellerpintar.com/api/categories',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setCategories(response.data.data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          router.push('/login');
        } else {
          console.error('Error fetching categories:', err);
        }
      }
    };

    fetchArticle();
    fetchCategories();
  }, [resolvedParams.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      if (!token) {
        router.push('/login');
        return;
      }

      await axios.put(
        `https://test-fe.mysellerpintar.com/api/articles/${resolvedParams.id}`,
        {
          title,
          content,
          categoryId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      router.push('/admin');
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
      } else {
        setError('Failed to update article');
        console.error('Error updating article:', err);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeMenu="Articles" setActiveMenu={() => {}} />
      
      <main className="flex-1 p-10">
        <Navbar title="Edit Article" userName="James Dean" userInitial="J" />
        
        <div className="bg-white rounded-xl shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 