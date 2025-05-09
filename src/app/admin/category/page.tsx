'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import axios from 'axios';

const dummyCategories = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: 'Technology',
  createdAt: 'April 13, 2025 10:55:12',
}));

export default function CategoryPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [showModal, setShowModal] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCategoryInput, setEditCategoryInput] = useState('');
  const [editError, setEditError] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ id: number; name: string; createdAt: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<{ id: number; name: string; createdAt: string } | null>(null);
  const [categories, setCategories] = useState(dummyCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const source = axios.CancelToken.source();
        const timeoutId = setTimeout(() => source.cancel('Request timed out'), 10000); // 10 second timeout

        const response = await axios.get('https://test-fe.mysellerpintar.com/api/categories', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          withCredentials: false, // Changed to false since we're using token auth
          cancelToken: source.token,
          timeout: 10000,
          validateStatus: function (status) {
            return status >= 200 && status < 500; // Handle any status code to prevent network errors
          }
        });

        clearTimeout(timeoutId);

        if (response.data.data) {
          setCategories(response.data.data.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            createdAt: new Date(cat.createdAt).toLocaleString()
          })));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        if (axios.isCancel(error)) {
          console.error('Request timed out. Please check your internet connection.');
        } else if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            console.error('Your session has expired. Please login again.');
          } else if (error.code === 'ECONNABORTED') {
            console.error('Request timed out. Please check your internet connection.');
          } else if (!error.response) {
            console.error('Network error. Please check your internet connection or the API endpoint.');
          } else {
            console.error(`Error ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`);
          }
        }
        // Keep using dummy data if API fails
        setCategories(dummyCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter berdasarkan search
  const filteredCategories = categories.filter(cat => {
    if (!cat || !cat.name) return false;
    return cat.name.toLowerCase().includes(search.toLowerCase());
  });
  const total = filteredCategories.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pagedCategories = filteredCategories.slice(startIdx, endIdx);

  // Helper untuk membuat array pagination
  const getPages = () => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page === 1) return [1, 2, '...', totalPages];
    if (page === totalPages) return [1, '...', totalPages - 1, totalPages];
    return [1, '...', page, '...', totalPages];
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeMenu="Category" setActiveMenu={() => {}} />
      <main className="flex-1 p-8">
        <Navbar title="Category" userName="Admin" userInitial="A" />
        <div className="flex justify-between items-center mb-4">
          <div className="text-black">Total Category : {total}</div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => setShowModal(true)}
          >
            + Add Category
          </button>
        </div>
        <input
          className="border px-3 py-2 rounded text-black mb-4 w-1/3"
          placeholder="Search Category"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left text-black">Category</th>
              <th className="py-2 px-4 text-left text-black">Created at</th>
              <th className="py-2 px-4 text-left text-black">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="py-4 text-center">
                  Loading categories...
                </td>
              </tr>
            ) : (
              pagedCategories.map(cat => (
                <tr key={cat.id} className="border-b">
                  <td className="py-2 text-black px-4">{cat.name}</td>
                  <td className="py-2 text-black px-4">{cat.createdAt}</td>
                  <td className="py-2 text-black px-4">
                    <a
                      href="#"
                      className="text-blue-600 mr-2"
                      onClick={e => {
                        e.preventDefault();
                        setEditingCategory(cat);
                        setEditCategoryInput(cat.name);
                        setEditError('');
                        setShowEditModal(true);
                      }}
                    >
                      Edit
                    </a>
                    <a
                      href="#"
                      className="text-red-600"
                      onClick={e => {
                        e.preventDefault();
                        setDeletingCategory(cat);
                        setShowDeleteModal(true);
                      }}
                    >
                      Delete
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex justify-between items-center">
          <div></div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border rounded text-black disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              {'<'}
            </button>
            {getPages().map((p, idx) =>
              p === '...'
                ? <span key={idx} className="px-3 py-1">...</span>
                : <button
                    key={p}
                    className={`px-3 py-1 border rounded text-black ${page === p ? 'bg-blue-600 text-white' : ''}`}
                    onClick={() => setPage(Number(p))}
                  >
                    {p}
                  </button>
            )}
            <button
              className="px-3 py-1 border rounded text-black disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              {'>'}
            </button>
          </div>
          <div></div>
        </div>
      </main>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-xl text-black font-semibold mb-4">Add Category</h2>
            <label className="block mb-1 text-black font-medium">Category</label>
            <input
              className="border px-3 py-2 rounded text-black w-full mb-1"
              placeholder="Input Category"
              value={categoryInput}
              onChange={e => {
                setCategoryInput(e.target.value);
                setError('');
              }}
            />
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 border rounded text-black"
                onClick={() => {
                  setShowModal(false);
                  setCategoryInput('');
                  setError('');
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded text-black"
                onClick={() => {
                  if (!categoryInput.trim()) {
                    setError('Category field cannot be empty');
                    return;
                  }
                  // Tambahkan logic untuk menambah kategori di sini
                  setShowModal(false);
                  setCategoryInput('');
                  setError('');
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-xl text-black font-semibold mb-4">Edit Category</h2>
            <label className="block mb-1 font-medium">Category</label>
            <input
              className="border px-3 py-2 rounded text-black w-full mb-1"
              placeholder="Input Category"
              value={editCategoryInput}
              onChange={e => {
                setEditCategoryInput(e.target.value);
                setEditError('');
              }}
            />
            {editError && <div className="text-red-500 text-sm mb-2">{editError}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 border rounded text-black"
                onClick={() => {
                  setShowEditModal(false);
                  setEditCategoryInput('');
                  setEditError('');
                  setEditingCategory(null);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded text-black"
                onClick={async () => {
                  if (!editCategoryInput.trim()) {
                    setEditError('Category field cannot be empty');
                    return;
                  }
                  try {
                    const source = axios.CancelToken.source();
                    const timeoutId = setTimeout(() => source.cancel('Request timed out'), 10000);

                    const response = await axios.put(
                      `https://test-fe.mysellerpintar.com/api/categories/${editingCategory?.id}`,
                      {
                        name: editCategoryInput.trim()
                      },
                      {
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('token')}`,
                          'Accept': 'application/json',
                          'Access-Control-Allow-Origin': '*'
                        },
                        withCredentials: false,
                        cancelToken: source.token,
                        timeout: 10000,
                        validateStatus: function (status) {
                          return status >= 200 && status < 500;
                        }
                      }
                    );

                    clearTimeout(timeoutId);

                    if (response.status !== 200) {
                      throw new Error(response.data.message || 'Failed to update category');
                    }

                    const updatedCategory = response.data;
                    
                    // Update the categories list with the new data
                    setCategories(prevCategories => 
                      prevCategories.map(cat => 
                        cat.id === editingCategory?.id 
                          ? {
                              ...cat,
                              name: updatedCategory.name,
                              createdAt: new Date(updatedCategory.updatedAt).toLocaleString()
                            }
                          : cat
                      )
                    );

                    setShowEditModal(false);
                    setEditCategoryInput('');
                    setEditError('');
                    setEditingCategory(null);
                  } catch (error) {
                    console.error('Error updating category:', error);
                    if (axios.isCancel(error)) {
                      setEditError('Request timed out. Please check your internet connection and try again.');
                    } else if (axios.isAxiosError(error)) {
                      if (error.response?.status === 403) {
                        setEditError('You do not have permission to update this category');
                      } else if (error.response?.status === 401) {
                        setEditError('Your session has expired. Please login again.');
                      } else if (error.code === 'ECONNABORTED') {
                        setEditError('Request timed out. Please check your internet connection.');
                      } else if (!error.response) {
                        setEditError('Network error. Please check your internet connection or try again later.');
                      } else {
                        setEditError(error.response.data?.message || 'Failed to update category. Please try again.');
                      }
                    } else {
                      setEditError('An unexpected error occurred. Please try again.');
                    }
                  }
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && deletingCategory && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
          <div className="bg-white p-6 rounded shadow-md w-[400px]">
            <h2 className="text-xl font-semibold mb-4 text-black">Delete Category</h2>
            <p className="mb-6 text-black">
              Delete category <b>“{deletingCategory.name}”</b>? This will remove it from master data permanently.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 border text-black rounded"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingCategory(null);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={async () => {
                  try {
                    const source = axios.CancelToken.source();
                    const timeoutId = setTimeout(() => source.cancel('Request timed out'), 10000);

                    const response = await axios.delete(
                      `https://test-fe.mysellerpintar.com/api/categories/${deletingCategory?.id}`,
                      {
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('token')}`,
                          'Accept': 'application/json',
                          'Access-Control-Allow-Origin': '*'
                        },
                        withCredentials: false,
                        cancelToken: source.token,
                        timeout: 10000,
                        validateStatus: function (status) {
                          return status >= 200 && status < 500;
                        }
                      }
                    );

                    clearTimeout(timeoutId);

                    // if (response.status !== 200) {
                    //   throw new Error(response.data.message || 'Failed to delete category');
                    // }

                    // Update the categories list by removing the deleted category
                    setCategories(prevCategories => 
                      prevCategories.filter(cat => cat.id !== deletingCategory?.id)
                    );

                    setShowDeleteModal(false);
                    setDeletingCategory(null);
                  } catch (error) {
                    console.error('Error deleting category:', error);
                    if (axios.isCancel(error)) {
                      alert('Request timed out. Please check your internet connection and try again.');
                    } else if (axios.isAxiosError(error)) {
                      if (error.response?.status === 403) {
                        alert('You do not have permission to delete this category');
                      } else if (error.response?.status === 401) {
                        alert('Your session has expired. Please login again.');
                      } else if (error.code === 'ECONNABORTED') {
                        alert('Request timed out. Please check your internet connection.');
                      } else if (!error.response) {
                        alert('Network error. Please check your internet connection or try again later.');
                      } else {
                        alert(error.response.data?.message || 'Failed to delete category. Please try again.');
                      }
                    } else {
                      alert('An unexpected error occurred. Please try again.');
                    }
                    setShowDeleteModal(false);
                    setDeletingCategory(null);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
