// 'use client';

// import { useRouter } from 'next/navigation';
// import Sidebar from '@/components/Sidebar';
// import Navbar from '@/components/Navbar';
// import { useState, useRef, useEffect } from 'react';
// import axios from 'axios';

// interface Category {
//   id: string;
//   name: string;
//   userId: string;
//   createdAt: string;
//   updatedAt: string;
// }

// export default function CreateArticle() {
//   const router = useRouter();
//   const [selectedImage, setSelectedImage] = useState<File | null>(null);
//   const [imageUrl, setImageUrl] = useState<string>('');
//   const [isUploading, setIsUploading] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [formData, setFormData] = useState({
//     title: '',
//     content: '',
//     categoryId: ''
//   });
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     // Log token for debugging
//     const token = localStorage.getItem('token');
//     console.log('Current token:', token ? 'Token exists' : 'No token found');
    
//     const fetchCategories = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//           alert('You are not logged in. Please login first.');
//           router.push('/login');
//           return;
//         }

//         const response = await axios.get('https://test-fe.mysellerpintar.com/api/categories', {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });

//         if (response.data && response.data.data) {
//           setCategories(response.data.data);
//         }
//       } catch (error) {
//         console.error('Error fetching categories:', error);
//         if (axios.isAxiosError(error) && error.response?.status === 401) {
//           alert('Your session has expired. Please login again.');
//           localStorage.removeItem('token');
//           router.push('/login');
//         } else {
//           alert('Failed to load categories. Please refresh the page.');
//         }
//       }
//     };

//     fetchCategories();
//   }, [router]);

//   const handleImageClick = () => {
//     fileInputRef.current?.click();
//   };

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Validate file type
//     if (!['image/jpeg', 'image/png'].includes(file.type)) {
//       alert('Please select a valid image file (JPG or PNG)');
//       return;
//     }

//     // Validate file size (max 5MB)
//     const maxSize = 5 * 1024 * 1024; // 5MB in bytes
//     if (file.size > maxSize) {
//       alert('File size must be less than 5MB');
//       return;
//     }

//     setSelectedImage(file);
//     setIsUploading(true);

    
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Validate all required fields
//     const errors = [];
//     if (!formData.title.trim()) errors.push('Title is required');
//     if (!formData.content.trim()) errors.push('Content is required');
//     if (!formData.categoryId) errors.push('Category is required');

//     if (errors.length > 0) {
//       alert(errors.join('\n'));
//       return;
//     }

//     setIsSubmitting(true);

//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <Sidebar activeMenu="Articles" setActiveMenu={() => {}} />
//       <main className="flex-1 p-10">
//         {/* Header */}
//         <Navbar title="Articles" userName="James Dean" userInitial="J" />
//         {/* Card */}
//         <div className="bg-white rounded-xl shadow p-8 max-w-4xl mx-auto">
//           <div className="flex items-center gap-2 mb-6">
//             <button onClick={() => router.back()} className="text-gray-500 hover:text-blue-700 text-lg">&#8592;</button>
//             <span className="font-semibold text-lg text-black">Create Articles</span>
//           </div>
//           {/* Form */}
//           <form className="space-y-6" onSubmit={handleSubmit}>
//             {/* Thumbnails */}
//             <div>
//               <label className="block font-medium mb-2 text-black">Thumbnails</label>
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//                 accept="image/jpeg,image/png"
//                 className="hidden"
//               />
//               <div 
//                 onClick={handleImageClick}
//                 className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-36 w-64 text-gray-400 cursor-pointer mb-1 relative"
//               >
//                 {selectedImage ? (
//                   <img
//                     src={URL.createObjectURL(selectedImage)}
//                     alt="Preview"
//                     className="w-full h-full object-cover rounded-lg"
//                   />
//                 ) : (
//                   <>
//                     <span className="text-2xl">&#43;</span>
//                     <span className="text-xs">Click to select files</span>
//                     <span className="text-xs">Support File Type : jpg or png</span>
//                   </>
//                 )}
//                 {isUploading && (
//                   <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
//                     <span className="text-white">Uploading...</span>
//                   </div>
//                 )}
//               </div>
//               {imageUrl && (
//                 <input type="hidden" name="imageUrl" value={imageUrl} />
//               )}
//             </div>
//             {/* Title */}
//             <div>
//               <label className="block font-medium mb-2 text-black">Title</label>
//               <input 
//                 type="text" 
//                 name="title"
//                 value={formData.title}
//                 onChange={handleInputChange}
//                 className="w-full border border-gray-300 rounded-md px-3 text-black py-2 focus:outline-none" 
//                 placeholder="Input title" 
//               />
//             </div>
//             {/* Category */}
//             <div>
//               <label className="block font-medium mb-2 text-black">Category</label>
//               <select 
//                 name="categoryId"
//                 value={formData.categoryId}
//                 onChange={handleInputChange}
//                 className="w-full border border-gray-300 rounded-md px-3 text-black py-2 focus:outline-none"
//               >
//                 <option value="">Select category</option>
//                 {categories.map((category) => (
//                   <option key={category.id} value={category.id}>
//                     {category.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             {/* Content Editor */}
//             <div>
//               <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
//                 <div className="flex gap-2 mb-2 text-gray-400">
//                   <button type="button">↺</button>
//                   <button type="button">↻</button>
//                   <button type="button" className="font-bold">B</button>
//                   <button type="button" className="italic">I</button>
//                   <button type="button">🖼️</button>
//                   <button type="button">📎</button>
//                   <button type="button">≡</button>
//                 </div>
//                 <textarea 
//                   name="content"
//                   value={formData.content}
//                   onChange={handleInputChange}
//                   className="w-full h-40 bg-transparent text-black outline-none resize-none" 
//                   placeholder="Type a content..." 
//                 />
//               </div>
//               <div className="flex justify-between text-xs mt-1">
//                 <span>0 Words</span>
//               </div>
//               <div className="text-red-500 text-xs mt-1">Content field cannot be empty</div>
//             </div>
//             {/* Action Buttons */}
//             <div className="flex justify-end gap-2 pt-4">
//               <button 
//                 type="button" 
//                 className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700"
//                 onClick={() => router.back()}
//               >
//                 Cancel
//               </button>
//               <button 
//                 type="button" 
//                 className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700"
//               >
//                 Preview
//               </button>
//               <button 
//                 type="submit" 
//                 className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-blue-400"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? 'Creating...' : 'Create Article'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </main>
//     </div>
//   );
// }
