// src/layouts/MainLayout.jsx
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';

import { useState } from 'react';

export default function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 'w-20' : 'w-64';
  const contentPadding = collapsed ? 'pl-20' : 'pl-64';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar fixed to the left */}
      <div className={`fixed top-0 left-0 h-screen bg-[#1f2937] text-white transition-all duration-300 ${sidebarWidth} z-40`}>
        <Sidebar collapsed={collapsed} />
      </div>

      {/* Content wrapper */}
      <div className={`transition-all duration-300 ${contentPadding}`}>
        <Header onToggle={() => setCollapsed(!collapsed)} />
        <main className="p-6 pt-20">{children}</main>
        <Footer />
      </div>
    </div>
  );
}