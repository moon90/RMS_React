// src/layouts/MainLayout.jsx
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';

import React, { useEffect, useState } from 'react';

export default function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
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
  <div className="min-h-screen bg-gray-100">
    {/* Sidebar */}
    <div className={`fixed top-0 left-0 h-screen bg-[#1f2937] text-white transition-all duration-300 ${sidebarWidth} z-40`}>
      <Sidebar collapsed={collapsed} />
    </div>

    {/* Fixed Header */}
    <div className={`fixed top-0 left-0 w-full transition-all duration-300 z-30 ${contentPadding}`}>
      <Header onToggle={() => setCollapsed(!collapsed)} />
    </div>

    {/* Main Content (below header) */}
    <div className={`transition-all duration-300 ${contentPadding} pt-20`}>
      <main className="p-6">{children}</main>
      <Footer />
    </div>
  </div>
  );
}