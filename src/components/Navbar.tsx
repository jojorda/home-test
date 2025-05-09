import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  title: string;
  userName: string;
  userInitial: string;
}

const Navbar: React.FC<NavbarProps> = ({ title, userName, userInitial }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl text-black font-bold">{title}</h1>
      <div className="flex items-center gap-4" ref={dropdownRef}>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            setDropdownOpen((open) => !open);
            // navigate('/profile');
          }}
        >
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-blue-700 font-bold">
            {userInitial}
          </div>
          <span className="text-gray-700 font-medium">{userName}</span>
        </div>
        {dropdownOpen && (
          <div className="absolute right-4 mt-12 w-48 bg-white rounded-lg shadow-lg border z-50">
            <div className="px-4 py-2 text-gray-700 font-semibold border-b"
                onClick={() => {
                  // setDropdownOpen((open) => !open);
                  setDropdownOpen(false);
                  router.push('/profile');
                }}
            >My Account</div>
            <button className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-gray-100 w-full text-left"
                onClick={() => {
                  setDropdownOpen(false);
                  localStorage.removeItem('token');
                  router.push('/');
                }}>
              <span>
                {/* Icon Logout (SVG) */}
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                </svg>
              </span>
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar; 