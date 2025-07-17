import { useState } from 'react';
import {
  FaBoxOpen, FaChevronDown, FaChevronRight,
  FaClipboardList, FaListUl, FaUtensils
} from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const menu = [
  {
    label: 'User Management',
    icon: FaBoxOpen,
    children: [
      {
        label: 'Users',
        icon: FaListUl,
        children: [
          { label: 'User Add', to: '/users/add' },
          { label: 'User List', to: '/users/list' },
        ],
      },
      { 
        label: 'Role Permissions', 
        icon: FaListUl,
        children: [
          { label: 'Role Add', to: '/roles/add' },
          { label: 'Role List', to: '/roles/list' },
          { label: 'User Access Role', to: '/roles/access_role' },
          { label: 'Permission Setup', to: '/roles/permission_setup' },
          { label: 'Menu Setup', to: '/roles/menu_setup' },
        ],        
       },
       { 
        label: 'Permissions', 
        icon: FaListUl,
        children: [
          { label: 'Permission Add', to: '/permissions/add' },
          { label: 'Permission List', to: '/permissions/list' },
        ],        
       },
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
  className={`h-full overflow-y-auto text-white transition-all duration-300 ${
    collapsed ? 'w-20' : 'w-64'
  } bg-gradient-to-b from-indigo-700 to-purple-700 backdrop-blur-lg shadow-lg`}
>
  <div className="p-4 font-bold text-xl text-center tracking-wide border-b border-white/10">
    {collapsed ? '🍽️' : 'Restaurant'}
  </div>

  <nav className="p-2 space-y-1 text-sm">
    {menu.map((item) => (
      <div key={item.label}>
        <div
          onClick={() => item.children && toggleMenu(item.label)}
          className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer hover:bg-white/10 transition"
        >
          <div className="flex items-center gap-3">
            <item.icon className="text-lg text-white/90" />
            {!collapsed && <span>{item.label}</span>}
          </div>
          {item.children && !collapsed && (
            <span className="text-white/70">
              {openMenus[item.label] ? <FaChevronDown /> : <FaChevronRight />}
            </span>
          )}
        </div>

        {item.children && openMenus[item.label] && !collapsed && (
          <div className="ml-6 mt-1 space-y-1 text-white/80">
            {item.children.map((child) => (
              <div key={child.label}>
                {!child.children ? (
                  <NavLink
                    to={child.to}
                    className={({ isActive }) =>
                      `block px-2 py-1 rounded transition ${
                        isActive ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
                      }`
                    }
                  >
                    {child.label}
                  </NavLink>
                ) : (
                  <>
                    <div className="font-semibold text-xs uppercase text-white/60 mt-3 mb-1">
                      {child.label}
                    </div>
                    <div className="ml-4 space-y-1">
                      {child.children.map((sub) => (
                        <NavLink
                          key={sub.label}
                          to={sub.to}
                          className={({ isActive }) =>
                            `block px-2 py-1 rounded transition ${
                              isActive ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
                            }`
                          }
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
