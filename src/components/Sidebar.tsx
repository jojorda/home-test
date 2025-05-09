'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from "react";
import ModalLogout from "./ModalLogout";

type MenuType = 'Articles' | 'Category';

interface SidebarProps {
  activeMenu: MenuType;
  setActiveMenu: (menu: MenuType) => void;
}

export default function Sidebar({ activeMenu, setActiveMenu = () => {} }: SidebarProps) {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <aside className="w-64 bg-blue-700 text-white flex flex-col py-8 px-6 min-h-screen">
      <div className="flex items-center gap-2 mb-10">
        <img src="/Frame.png" alt="Logo" className="h-7" />
        {/* <span className="font-bold text-lg">Logoipsum</span> */}
      </div>
      <nav className="flex-1 flex flex-col gap-2">
        <button
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left ${activeMenu === 'Articles' ? 'bg-blue-900' : 'hover:bg-blue-800'}`}
          onClick={() => {
            setActiveMenu('Articles');
            router.push('/admin');
          }}
        >
          <span>📄</span> Articles
        </button>
        <button
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left ${activeMenu === 'Category' ? 'bg-blue-900' : 'hover:bg-blue-800'}`}
          onClick={() => {
            setActiveMenu('Category');
            router.push('/admin/category');
          }}
        >
          <span>📂</span> Category
        </button>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-blue-800 mt-auto"
          onClick={() => setShowLogoutModal(true)}
        >
          <span>🚪</span> Logout
        </button>
      </nav>
      <ModalLogout
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onLogout={handleLogout}
      />
    </aside>
  );
}
