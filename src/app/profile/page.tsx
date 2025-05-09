'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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

// Add request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function MyAccount() {
  const router = useRouter();
  const [user, setUser] = useState({
    username: '',
    role: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const fetchUserProfile = async (retry = 0) => {
    try {
      const token = localStorage.getItem('token');
      console.log(`Attempting to fetch profile (attempt ${retry + 1}/${MAX_RETRIES})`);
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.');
        router.push('/');
        return;
      }

      console.log('Memulai request ke API...');
      const response = await api.get('/auth/profile');
      console.log('Response diterima:', response.data);

      if (!response.data) {
        throw new Error('Data kosong dari server');
      }

      setUser(response.data);
      setLoading(false);
      setError('');
      setRetryCount(0);
    } catch (err) {
      console.error('Error saat fetch profile:', err);
      
      // Handle retry logic
      if (retry < MAX_RETRIES - 1 && 
          (axios.isAxiosError(err) && 
           (err.code === 'ECONNABORTED' || err.response?.status === 504))) {
        console.log(`Mencoba kembali... (${retry + 1}/${MAX_RETRIES})`);
        setRetryCount(retry + 1);
        // Increase delay between retries
        await new Promise(resolve => setTimeout(resolve, 2000 * (retry + 1)));
        return fetchUserProfile(retry + 1);
      }

      // Handle various error cases
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          router.push('/');
        } else if (err.code === 'ECONNABORTED') {
          setError('Koneksi timeout. Silakan periksa koneksi internet Anda dan coba lagi.');
        } else if (err.response?.status === 504) {
          setError('Server sedang sibuk. Silakan coba beberapa saat lagi.');
        } else {
          setError(
            err.response?.data?.message || 
            'Terjadi kesalahan saat mengambil data profile.'
          );
        }
      } else {
        setError('Terjadi kesalahan yang tidak terduga. Silakan coba lagi.');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-blue-600">Memuat data profile...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={() => {
                setLoading(true);
                setError('');
                setRetryCount(0);
                fetchUserProfile();
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
            >
              Coba Lagi
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white rounded-xl shadow p-8 w-full max-w-md flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl text-blue-600 font-bold mb-4">
            {user.username ? user.username.charAt(0).toUpperCase() : '?'}
          </div>
          <h2 className="text-xl font-semibold mb-6 text-blue-600">Profile Pengguna</h2>
          <div className="w-full space-y-3 mb-6">
            <div className="flex justify-between items-center bg-gray-100 rounded px-4 py-2">
              <span className="font-semibold text-blue-600">Username</span>
              <span className="text-gray-700">{user.username || '-'}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-100 rounded px-4 py-2">
              <span className="font-semibold text-blue-600">Role</span>
              <span className="text-gray-700">{user.role || '-'}</span>
            </div>
          </div>
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
            onClick={() => router.push('/dashboard')}
          >
            Kembali ke Dashboard
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
