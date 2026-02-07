// src/layouts/MainLayout.jsx
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';

import React, { useEffect } from 'react';

import { useLayout } from '../context/LayoutContext';

export default function MainLayout({ children }) {
  const { collapsed, setCollapsed } = useLayout();
  const sidebarWidth = collapsed ? 'w-20' : 'w-64';
  const contentPadding = collapsed ? 'pl-20' : 'pl-64';
  // eslint-disable-next-line no-unused-vars
  const user = JSON.parse(localStorage.getItem('user'));
  // eslint-disable-next-line no-unused-vars
  const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'));

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen transition-all duration-300 z-40 ${sidebarWidth}`}>
        <Sidebar collapsed={collapsed} />
      </div>

      {/* Main Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${contentPadding}`}>
        {/* Fixed Header */}
        <div className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/60">
          <Header onToggle={() => setCollapsed(!collapsed)} />
        </div>

        {/* Main Content */}
        <main className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto w-full flex-1">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>

        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
}