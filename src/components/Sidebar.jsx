import { useState } from 'react';
import {
  FaBoxOpen, FaChevronDown, FaChevronRight,
  FaClipboardList, FaListUl, FaUtensils
} from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const menu = [
  {
    label: 'Products',
    icon: FaBoxOpen,
    children: [
      {
        label: 'Category',
        icon: FaListUl,
        children: [
          { label: 'Subcategory A', to: '/products/category/a' },
          { label: 'Subcategory B', to: '/products/category/b' },
        ],
      },
      { label: 'All Products', to: '/products/all' },
    ],
  },
  { label: 'Inventory', icon: FaClipboardList, to: '/inventory' },
  { label: 'Kitchen', icon: FaUtensils, to: '/kitchen' },
];

export default function Sidebar({ collapsed }) {
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      className={`h-full text-white transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      } bg-gradient-to-b from-indigo-700 to-purple-700 backdrop-blur-lg shadow-lg`}
    >
      <div className="p-4 font-bold text-xl text-center tracking-wide border-b border-white/10">
        {collapsed ? '🍽️' : 'Restaurant'}
      </div>

      <nav className="p-2 space-y-1">
        {menu.map((item) => (
          <div key={item.label}>
            <div
              onClick={() => item.children && toggleMenu(item.label)}
              className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer hover:bg-white/10 transition duration-200`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="text-lg text-white/90" />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </div>
              {item.children && !collapsed && (
                <span className="text-white/70">
                  {openMenus[item.label] ? <FaChevronDown /> : <FaChevronRight />}
                </span>
              )}
            </div>

            {/* Render children */}
            {item.children && openMenus[item.label] && !collapsed && (
              <div className="ml-6 mt-1 space-y-1 text-sm text-white/80 transition-all">
                {item.children.map((child) => (
                  <div key={child.label}>
                    {!child.children ? (
                      <NavLink
                        to={child.to}
                        className="block px-2 py-1 rounded hover:bg-white/10 transition"
                      >
                        {child.label}
                      </NavLink>
                    ) : (
                      <>
                        <div className="font-semibold text-xs">{child.label}</div>
                        <div className="ml-4 mt-1 space-y-1">
                          {child.children.map((sub) => (
                            <NavLink
                              key={sub.label}
                              to={sub.to}
                              className="block px-2 py-1 rounded hover:bg-white/10"
                            >
                              {sub.label}
                            </NavLink>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
