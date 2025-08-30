import React, { useState, useEffect } from 'react';
import {
  FaBoxOpen, FaChevronDown, FaChevronRight,
  FaClipboardList, FaListUl, FaUtensils, FaHome, FaUsers, FaCog, FaPlus, FaEdit, FaTrash, FaFileAlt, FaUserShield,
  FaTruck, FaIndustry
} from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { hasMenuPermission } from '../utils/permissionUtils';

const menu = [
  {
    label: 'Dashboard',
    icon: FaHome,
    to: '/dashboard',
    permissionKey: 'Dashboard'
  },
  {
    label: 'User Management',
    icon: FaUsers,
    children: [
      {
        label: 'Users',
        icon: FaUsers,
        children: [
          { label: 'User List', to: '/users/list', permissionKey: 'User List' },
          { label: 'User Add', to: '/users/add', permissionKey: 'User Add' },
        ],
      },
      {
        label: 'Roles',
        icon: FaUserShield,
        children: [
          { label: 'Role List', to: '/roles/list', permissionKey: 'Role List' },
          { label: 'Role Add', to: '/roles/add', permissionKey: 'Role Add' },
          { label: 'User Access Role', to: '/roles/access_role', permissionKey: 'User Access Role' },
          { label: 'Permission Setup', to: '/roles/permission_setup', permissionKey: 'Permission Setup' },
          { label: 'Role Permissions', to: '/roles/role_permissions', permissionKey: 'Role Permissions' },
          { label: 'Menu Assignments', to: '/roles/menu_assignments', permissionKey: 'Menu Assignments' },
          { label: 'Menu Setup', to: '/roles/menu_setup', permissionKey: 'Menu Setup' },
        ],
      },
      {
        label: 'Permissions',
        icon: FaCog,
        children: [
          { label: 'Permission List', to: '/permissions/list', permissionKey: 'Permission List' },
          { label: 'Permission Add', to: '/permissions/add', permissionKey: 'Permission Add' },
        ],
      },
    ],
  },
  {
    label: 'Menu Management',
    icon: FaClipboardList,
    children: [
      { label: 'Menu List', to: '/menus/list', permissionKey: 'Menu List' },
      { label: 'Menu Add', to: '/menus/add', permissionKey: 'Menu Add' },
    ],
  },
  {
    label: 'Category Management',
    icon: FaClipboardList,
    children: [
      { label: 'Category List', to: '/categories/list', permissionKey: 'Category List' },
      { label: 'Category Add', to: '/categories/add', permissionKey: 'Category Add' },
    ],
  },
  {
    label: 'Unit Management',
    icon: FaListUl,
    children: [
      { label: 'Unit List', to: '/units/list', permissionKey: 'Unit List' },
      { label: 'Unit Add', to: '/units/add', permissionKey: 'Unit Add' },
    ],
  },
  {
    label: 'Supplier Management',
    icon: FaTruck,
    children: [
      { label: 'Supplier List', to: '/suppliers/list', permissionKey: 'Supplier List' },
      { label: 'Supplier Add', to: '/suppliers/add', permissionKey: 'Supplier Add' },
    ],
  },
  {
    label: 'Manufacturer Management',
    icon: FaIndustry,
    children: [
      { label: 'Manufacturer List', to: '/manufacturers/list', permissionKey: 'Manufacturer List' },
      { label: 'Manufacturer Add', to: '/manufacturers/add', permissionKey: 'Manufacturer Add' },
    ],
  },
  {
    label: 'Product Management',
    icon: FaBoxOpen,
    children: [
      { label: 'Product List', to: '/products/list', permissionKey: 'Product List' },
      { label: 'Product Add', to: '/products/add', permissionKey: 'Product Add' },
    ],
  },
  {
    label: 'Audit Logs',
    icon: FaFileAlt,
    to: '/audit-logs',
    permissionKey: 'Audit Logs'
  },
  {
    label: 'Inventory',
    icon: FaBoxOpen,
    to: '/inventory',
    permissionKey: 'Inventory'
  },
  {
    label: 'Kitchen',
    icon: FaUtensils,
    to: '/kitchen',
    permissionKey: 'Kitchen'
  },
];

export default function Sidebar({ collapsed }) {
  const [openMenus, setOpenMenus] = useState({});
  const [filteredMenu, setFilteredMenu] = useState([]);

  useEffect(() => {
    const filterMenuItems = (items) => {
      return items.filter(item => {
        if (item.children) {
          const filteredChildren = filterMenuItems(item.children);
          if (filteredChildren.length > 0) {
            item.children = filteredChildren;
            return true;
          }
          return false;
        } else if (item.permissionKey) {
          return hasMenuPermission(item.permissionKey);
        }
        return false;
      });
    };
    setFilteredMenu(filterMenuItems(menu));
  }, []);

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const renderMenuItem = (item) => {
    const IconComponent = item.icon;

    const renderSubMenu = (subItem) => {
      const SubIconComponent = subItem.icon || FaListUl;

      if (subItem.children && subItem.children.length > 0) {
        return (
          <div key={subItem.label}>
            <div
              onClick={() => toggleMenu(subItem.label)}
              className="flex items-center justify-between px-2 py-1 rounded-md cursor-pointer hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-3">
                <SubIconComponent className="text-md text-white/80" />
                {!collapsed && <span>{subItem.label}</span>}
              </div>
              {subItem.children && !collapsed && (
                <span className="text-white/70">
                  {openMenus[subItem.label] ? <FaChevronDown /> : <FaChevronRight />}
                </span>
              )}
            </div>

            {openMenus[subItem.label] && !collapsed && (
              <div className="ml-4 mt-1 space-y-1 text-white/70">
                {subItem.children.map(renderSubMenu)}
              </div>
            )}
          </div>
        );
      } else if (subItem.to) {
        return (
          <NavLink
            key={subItem.label}
            to={subItem.to}
            className={({ isActive }) =>
              `block px-2 py-1 rounded transition ${
                isActive ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <SubIconComponent className="text-md text-white/80" />
              {!collapsed && <span>{subItem.label}</span>}
            </div>
          </NavLink>
        );
      }
      return null;
    };

    if (item.children && item.children.length > 0) {
      return (
        <div key={item.label}>
          <div
            onClick={() => toggleMenu(item.label)}
            className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer hover:bg-white/10 transition"
          >
            <div className="flex items-center gap-3">
              <IconComponent className="text-lg text-white/90" />
              {!collapsed && <span>{item.label}</span>}
            </div>
            {item.children && !collapsed && (
              <span className="text-white/70">
                {openMenus[item.label] ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            )}
          </div>

          {openMenus[item.label] && !collapsed && (
            <div className="ml-6 mt-1 space-y-1 text-white/80">
              {item.children.map(renderSubMenu)}
            </div>
          )}
        </div>
      );
    } else if (item.to) {
      return (
        <NavLink
          key={item.label}
          to={item.to}
          className={({ isActive }) =>
            `block px-3 py-2 rounded transition ${
              isActive ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
            }`
          }
        >
          <div className="flex items-center gap-3">
            <IconComponent className="text-lg text-white/90" />
            {!collapsed && <span>{item.label}</span>}
          </div>
        </NavLink>
      );
    }
    return null;
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
        {filteredMenu.map(renderMenuItem)}
      </nav>
    </aside>
  );
}