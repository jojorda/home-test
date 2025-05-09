import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b py-4 px-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/Frames.png" alt="Logo" className="h-6" />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            <button
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-blue-600 font-bold focus:outline-none"
              onClick={() => setDropdownOpen((open) => !open)}
              aria-label="User menu"
              type="button"
            >
              J
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
                  className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-gray-100 w-full text-left"
                  onClick={() => {
                    setDropdownOpen(false);
                    localStorage.removeItem('token');
                    router.push('/');
                  }}
                >
                  <span>
                    {/* Icon Logout (SVG) */}
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                    </svg>
                  </span>
                  Logout
                </button>
              </div>
            )}
          </div>
            <span onClick={() => setDropdownOpen((open) => !open)} className="text-gray-700 font-medium">James Dean</span>
        </div>
      </div>
    </header>
  );
} 