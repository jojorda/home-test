'use client';

import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function CreateArticle() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Log token for debugging
    const token = localStorage.getItem('token');
    console.log('Current token:', token ? 'Token exists' : 'No token found');
    
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('You are not logged in. Please login first.');
          router.push('/login');
          return;
        }

        const response = await axios.get('https://test-fe.mysellerpintar.com/api/categories', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data && response.data.data) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('token');
          router.push('/login');
        } else {
          alert('Failed to load categories. Please refresh the page.');
        }
      }
    };

    fetchCategories();
  }, [router]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Please select a valid image file (JPG or PNG)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    setSelectedImage(file);
    setIsUploading(true);

    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('You are not logged in. Please login first.');
        router.push('/login');
        return;
      }

      // Add logging to debug the upload process
      console.log('Starting file upload process');
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`
      });

      const formData = new FormData();
      formData.append('file', file);

      // Log the request configuration
      console.log('Upload request configuration:', {
        url: 'https://test-fe.mysellerpintar.com/api/upload',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token.substring(0, 10)}...` // Only log part of the token for security
        }
      });

      const response = await axios.post('https://test-fe.mysellerpintar.com/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        timeout: 30000, // Increased timeout to 30 seconds
      });

      if (response.data && response.data.imageUrl) {
        console.log('Upload successful, received URL:', response.data.imageUrl);
        setImageUrl(response.data.imageUrl);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      if (axios.isAxiosError(error)) {
        // Log detailed error information
        console.error('Detailed upload error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });

        if (error.code === 'ECONNABORTED') {
          alert('Upload timeout - The server is taking too long to respond. Please try a smaller image or try again later.');
        } else if (error.response?.status === 401) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('token');
          router.push('/login');
        } else if (error.response?.status === 403) {
          alert('You do not have permission to upload files. Please check your login status or contact support.');
          router.push('/');
        } else if (error.response?.status === 500) {
          alert('The server encountered an error while processing your upload. This might be due to:\n- File format issues\n- Server temporary unavailability\n- File processing errors\n\nPlease try again with a different image or try again later.');
        } else if (error.response?.status === 400) {
          alert('Invalid image format or size. Please ensure your image is in JPG/PNG format and under 5MB.');
        } else if (!error.response) {
          alert('Network error - Please check your internet connection and try again.');
        } else {
          alert(`Upload failed: ${error.response.data?.message || 'Please try again with a different image.'}`);
        }
      } else {
        alert('Failed to upload image. Please try again with a different image.');
      }
      // Clear the file input and selected image on error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedImage(null);
      setImageUrl('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    const errors = [];
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.content.trim()) errors.push('Content is required');
    if (!formData.categoryId) errors.push('Category is required');

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('You are not logged in. Please login first.');
        router.push('/login');
        return;
      }

      // Log token for debugging
      console.log('Token being used:', token.substring(0, 10) + '...');

      // Prepare the request payload
      const articleData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        categoryId: formData.categoryId,
        imageUrl: imageUrl || null
      };

      // Log the complete request details
      console.log('Attempting to create article with data:', articleData);

      try {
        // First, verify the token is valid by making a test request
        const testResponse = await axios.get('https://test-fe.mysellerpintar.com/api/articles', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Token verification successful');
      } catch (tokenError) {
        console.error('Token verification failed:', tokenError);
        if (axios.isAxiosError(tokenError) && tokenError.response?.status === 401) {
          alert('Your session is invalid or expired. Please login again.');
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
      }

      // Make the actual create request
      const response = await axios.post(
        'https://test-fe.mysellerpintar.com/api/articles',
        articleData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000, // 10 second timeout
          validateStatus: function (status) {
            return status >= 200 && status < 300; // Only accept success status codes
          }
        }
      );

      // Log the complete response
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });

      if (response.data) {
        alert('Article created successfully!');
        // Wait a moment before redirecting to ensure the article is saved
        setTimeout(() => {
          router.push('/admin');
        }, 1000);
      } else {
        throw new Error('No data received from the API');
      }
    } catch (error) {
      console.error('Error creating article:', error);
      if (axios.isAxiosError(error)) {
        // Log detailed error information
        console.log('Detailed error information:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            data: error.config?.data
          }
        });

        if (error.response?.status === 401) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('token');
          router.push('/login');
        } else if (error.response?.status === 400) {
          const errorMessage = error.response.data?.message || 'Invalid input data. Please check all fields and try again.';
          alert(`Failed to create article: ${errorMessage}`);
          console.log('Server validation errors:', error.response.data);
        } else if (error.response?.status === 413) {
          alert('The article content is too large. Please reduce the content size.');
        } else if (!error.response) {
          alert('Network error. Please check your internet connection and try again.');
        } else {
          alert(`Failed to create article: ${error.response?.data?.message || 'Please try again.'}`);
        }
      } else {
        alert('Failed to create article. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeMenu="Articles" setActiveMenu={() => {}} />
      <main className="flex-1 p-10">
        {/* Header */}
        <Navbar title="Articles" userName="James Dean" userInitial="J" />
        {/* Card */}
        <div className="bg-white rounded-xl shadow p-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={() => router.back()} className="text-gray-500 hover:text-blue-700 text-lg">&#8592;</button>
            <span className="font-semibold text-lg text-black">Create Articles</span>
          </div>
          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Thumbnails */}
            <div>
              <label className="block font-medium mb-2 text-black">Thumbnails</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png"
                className="hidden"
              />
              <div 
                onClick={handleImageClick}
                className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-36 w-64 text-gray-400 cursor-pointer mb-1 relative"
              >
                {selectedImage ? (
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <span className="text-2xl">&#43;</span>
                    <span className="text-xs">Click to select files</span>
                    <span className="text-xs">Support File Type : jpg or png</span>
                  </>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <span className="text-white">Uploading...</span>
                  </div>
                )}
              </div>
              {imageUrl && (
                <input type="hidden" name="imageUrl" value={imageUrl} />
              )}
            </div>
            {/* Title */}
            <div>
              <label className="block font-medium mb-2 text-black">Title</label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 text-black py-2 focus:outline-none" 
                placeholder="Input title" 
              />
            </div>
            {/* Category */}
            <div>
              <label className="block font-medium mb-2 text-black">Category</label>
              <select 
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 text-black py-2 focus:outline-none"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Content Editor */}
            <div>
              <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                <div className="flex gap-2 mb-2 text-gray-400">
                  <button type="button">↺</button>
                  <button type="button">↻</button>
                  <button type="button" className="font-bold">B</button>
                  <button type="button" className="italic">I</button>
                  <button type="button">🖼️</button>
                  <button type="button">📎</button>
                  <button type="button">≡</button>
                </div>
                <textarea 
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full h-40 bg-transparent text-black outline-none resize-none" 
                  placeholder="Type a content..." 
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>0 Words</span>
              </div>
              <div className="text-red-500 text-xs mt-1">Content field cannot be empty</div>
            </div>
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <button 
                type="button" 
                className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700"
                onClick={() => router.back()}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700"
              >
                Preview
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-blue-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Article'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
