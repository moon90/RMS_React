import React, { useState, useEffect, useRef } from 'react';

export default function Header({ onToggle }) {

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

      // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };


  return (
    <header className="bg-[#F5F5F5] h-16 flex items-center justify-between px-6 shadow sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={onToggle} className="text-[#424242] text-xl">☰</button>
        <input
          type="text"
          placeholder="Search..."
          className="px-4 py-2 rounded-full border border-gray-300 text-sm w-64"
        />
      </div>
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        <button className="bg-[#E65100] text-white px-4 py-1 rounded-full">Recipe Guide</button>
        <img
          src="https://i.pravatar.cc/40"
          className="w-9 h-9 rounded-full cursor-pointer border-2 border-white"
          onClick={() => setOpen(!open)}
          alt="profile"
        />

      {/* Dropdown menu */}
        {open && (
          <div className="absolute right-0 top-12 w-40 bg-white shadow-lg rounded-md z-50">
            <button
              className="w-full text-left px-4 py-2 hover:bg-[#E0E0E0] text-sm text-[#424242]"
              onClick={() => alert('Navigate to profile')}
            >
              Profile
            </button>
            <button
              className="w-full text-left px-4 py-2 hover:bg-[#E0E0E0] text-sm text-red-500"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}