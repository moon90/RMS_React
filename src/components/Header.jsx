import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoNew from '../assets/images/logo_new.png';

export default function Header({ onToggle }) {

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

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
    logout();
    navigate('/login');
  };


  return (
    <header className="h-20 flex items-center justify-between px-8 z-30">
      <div className="flex items-center gap-6">
        <button
          onClick={onToggle}
          className="p-2.5 rounded-xl bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-red-50 hover:text-[#DA291C] transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="relative group hidden md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-[#DA291C] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search catalog..."
            className="pl-11 pr-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm w-80 focus:outline-none focus:ring-4 focus:ring-[#FFC72C]/10 focus:border-[#FFC72C]/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-5 relative" ref={dropdownRef}>
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl border border-red-100">
          <div className="w-2 h-2 rounded-full bg-[#DA291C] animate-pulse"></div>
          <span className="text-sm font-black text-[#DA291C] uppercase tracking-tighter">Kitchen Live</span>
        </div>

        <div className="h-10 w-px bg-gray-100 mx-1 hidden sm:block"></div>

        <button
          className="flex items-center gap-3 p-1 pr-4 rounded-2xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-100"
          onClick={() => setOpen(!open)}
        >
          <div className="relative">
            <img
              src="https://i.pravatar.cc/100?img=12"
              className="w-10 h-10 rounded-xl object-cover shadow-md border-2 border-[#FFC72C]"
              alt="profile"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="hidden sm:flex flex-col items-start text-left">
            <span className="text-sm font-black text-gray-800 leading-none tracking-tight">Admin Master</span>
            <span className="text-xs font-bold text-[#DA291C] mt-0.5 uppercase tracking-widest text-[9px]">Brno Station</span>
          </div>
          <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {open && (
          <div className="absolute right-0 top-16 w-56 bg-white shadow-2xl rounded-2xl border border-gray-50 py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right overflow-hidden">
            <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-50 mb-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee Profile</p>
              <p className="text-sm font-bold text-gray-700 mt-1">Ashiqur Rahman</p>
            </div>
            <button
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 hover:text-[#DA291C] text-sm font-bold text-gray-600 transition-colors"
              onClick={() => { setOpen(false); alert('Profile clicked'); }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Dashboard
            </button>
            <button
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 hover:text-[#DA291C] text-sm font-bold text-gray-600 transition-colors"
              onClick={() => { setOpen(false); alert('Settings clicked'); }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Adjust Settings
            </button>
            <div className="h-px bg-gray-50 my-2"></div>
            <button
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-600 hover:text-white text-sm font-black text-red-600 transition-all uppercase tracking-widest"
              onClick={handleLogout}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}