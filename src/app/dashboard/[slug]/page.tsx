"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

export default function ArticleDetail() {
  const router = useRouter();
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [otherArticles, setOtherArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  let slug = params && params.slug ? params.slug : '';
  if (Array.isArray(slug)) slug = slug[0];

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch('https://test-fe.mysellerpintar.com/api/articles');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Find the article that matches the slug
        const foundArticle = data.data.find((a: Article) => {
          const articleSlug = a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          return articleSlug === slug;
        });

        if (foundArticle) {
          setArticle({
            ...foundArticle,
            date: new Date(foundArticle.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            tags: foundArticle.category ? [foundArticle.category.name] : [],
            img: foundArticle.imageUrl || 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308'
          });

          // Get other articles (excluding the current one)
          const otherArticles = data.data
            .filter((a: Article) => a.id !== foundArticle.id)
            .slice(0, 3)
            .map((a: Article) => ({
              ...a,
              date: new Date(a.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              tags: a.category ? [a.category.name] : [],
              img: a.imageUrl || 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308'
            }));
          setOtherArticles(otherArticles);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching article:', error);
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Article Not Found</div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => router.back()}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full flex-1 p-8">
        <article className="bg-white rounded-xl shadow p-0 overflow-hidden">
          {/* Article Meta */}
          <div className="px-8 pt-8 pb-2">
            <div className="text-xs text-gray-400 mb-1">{article.date} · Created by Admin</div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{article.title}</h1>
          </div>
          {/* Article Image */}
          <img 
            src={article.imageUrl || 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308'} 
            alt={article.title} 
            className="rounded-none w-full object-cover mb-0 h-72"
            onError={(e) => {
              console.log('Image failed to load:', article.imageUrl);
              e.currentTarget.src = 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308';
            }}
          />
          {/* Article Content */}
          <div className="px-8 py-8">
            <div className="text-gray-700 text-base mb-6">
              {article.content.replace(/<[^>]*>/g, '')}
            </div>
          </div>
        </article>
        {/* Other Articles */}
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-6 text-gray-900">Other articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherArticles.map((a, idx) => {
              const articleSlug = a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              return (
                <div 
                  key={idx} 
                  className="bg-white rounded-xl shadow p-4 flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/dashboard/${articleSlug}`)}
                >
                  <img 
                    src={a.imageUrl || 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308'} 
                    alt={a.title} 
                    className="rounded-lg w-full object-cover mb-4 h-40"
                    onError={(e) => {
                      console.log('Image failed to load:', a.imageUrl);
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308';
                    }}
                  />
                  <div className="text-xs text-gray-400 mb-1">{a.date}</div>
                  <div className="font-semibold text-gray-900 mb-1 text-base">{a.title}</div>
                  <div className="text-gray-700 text-sm mb-2 flex-1 line-clamp-2">{a.content.replace(/<[^>]*>/g, '')}</div>
                  <div className="flex gap-2 mt-2">
                    {a.tags && a.tags.map((tag, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{tag}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
