'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

// Create axios instance with custom config
const api = axios.create({
  baseURL: 'https://test-fe.mysellerpintar.com/api',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<{username?: string; password?: string}>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validate = () => {
    const newErrors: {username?: string; password?: string} = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username field cannot be empty';
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        username: formData.username,
        password: formData.password
      });

      console.log('Login response:', response.data); // Add logging for debugging

      if (response.data && response.data.token) {
        // Store the token in localStorage
        localStorage.setItem('token', response.data.token);
        
        // Store additional user info
        if (response.data.username) {
          localStorage.setItem('username', response.data.username);
        }
        if (response.data.role) {
          localStorage.setItem('role', response.data.role);
        }
        
        // Get user role from the response
        const userRole = response.data.role;
        
        // Redirect based on role
        if (userRole === 'Admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Login error:', err); // Add error logging
      
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          setErrors({
            username: 'Request timeout. Please try again.',
            password: 'Request timeout. Please try again.'
          });
        } else if (!err.response) {
          setErrors({
            username: 'Network error. Please check your connection.',
            password: 'Network error. Please check your connection.'
          });
        } else {
          const errorMessage = err.response?.data?.message || 'Invalid username or password';
          setErrors({
            username: errorMessage,
            password: errorMessage
          });
        }
      } else {
        setErrors({
          username: 'An unexpected error occurred',
          password: 'An unexpected error occurred'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img 
            src="/Frames.png" 
            alt="Logo" 
            className="h-8 mb-4 w-50" 
            width={32}
            height={32}
            onError={(e) => {
              console.error('Error loading image:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
              autoComplete="off"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                autoComplete="off"
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors mt-2 disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="text-center mt-4">
          <span className="text-sm text-gray-600">Don't have an account? </span>
          <Link href="/register" className="text-blue-600 hover:underline text-sm font-medium">Register</Link>
        </div>
      </div>
    </div>
  );
} 