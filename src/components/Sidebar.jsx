import React, { useState, useEffect } from 'react';
import {
  FaBoxOpen, FaChevronDown, FaChevronRight,
  FaClipboardList, FaListUl, FaUtensils, FaHome, FaUsers, FaCog, FaPlus, FaEdit, FaTrash, FaFileAlt, FaUserShield,
  FaTruck, FaIndustry, FaUserFriends, FaUserTie, FaExchangeAlt, FaLeaf, FaBlender, FaCashRegister, FaTable, FaShoppingCart, FaTags // Add new icons
} from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { hasMenuPermission } from '../utils/permissionUtils';
import logoNew from '../assets/images/logo_new.png';

const menu = [ // Re-add the hardcoded menu array
  {
    label: 'Dashboard',
    icon: FaHome,
    to: '/dashboard',
    permissionKey: 'DASHBOARD_VIEW'
  },
  {
    label: 'User Management',
    icon: FaUsers,
    children: [
      {
        label: 'Users',
        icon: FaUsers,
        children: [
          { label: 'User List', to: '/users/list', permissionKey: 'USER_VIEW' },
          { label: 'User Add', to: '/users/add', permissionKey: 'USER_CREATE' },
        ],
      },
      {
        label: 'Roles',
        icon: FaUserShield,
        children: [
          { label: 'Role List', to: '/roles/list', permissionKey: 'ROLE_VIEW' },
          { label: 'Role Add', to: '/roles/add', permissionKey: 'ROLE_CREATE' },
          { label: 'User Access Role', to: '/roles/access_role', permissionKey: 'USER_ACCESS_ROLE_VIEW' },
          { label: 'Permission Setup', to: '/roles/permission_setup', permissionKey: 'PERMISSION_SETUP_VIEW' },
          { label: 'Role Permissions', to: '/roles/role_permissions', permissionKey: 'ROLE_PERMISSION_VIEW' },
          { label: 'Menu Assignments', to: '/roles/menu_assignments', permissionKey: 'MENU_ASSIGNMENT_VIEW' },
          { label: 'Menu Setup', to: '/roles/menu_setup', permissionKey: 'MENU_SETUP_VIEW' },
        ],
      },
      {
        label: 'Permissions',
        icon: FaCog,
        children: [
          { label: 'Permission List', to: '/permissions/list', permissionKey: 'PERMISSION_VIEW' },
          { label: 'Permission Add', to: '/permissions/add', permissionKey: 'PERMISSION_CREATE' },
        ],
      },
    ],
  },
  {
    label: 'Menu Management',
    icon: FaClipboardList,
    children: [
      { label: 'Menu List', to: '/menus/list', permissionKey: 'MENU_VIEW' },
      { label: 'Menu Add', to: '/menus/add', permissionKey: 'MENU_CREATE' },
    ],
  },
  {
    label: 'Category Management',
    icon: FaClipboardList,
    children: [
      { label: 'Category List', to: '/categories/list', permissionKey: 'CATEGORY_VIEW' },
      { label: 'Category Add', to: '/categories/add', permissionKey: 'CATEGORY_CREATE' },
    ],
  },
  {
    label: 'Unit Management',
    icon: FaListUl,
    children: [
      { label: 'Unit List', to: '/units/list', permissionKey: 'UNIT_VIEW' },
      { label: 'Unit Add', to: '/units/add', permissionKey: 'UNIT_CREATE' },
    ],
  },
  {
    label: 'Supplier Management',
    icon: FaTruck,
    children: [
      { label: 'Supplier List', to: '/suppliers/list', permissionKey: 'SUPPLIER_VIEW' },
      { label: 'Supplier Add', to: '/suppliers/add', permissionKey: 'SUPPLIER_CREATE' },
    ],
  },
  {
    label: 'Manufacturer Management',
    icon: FaIndustry,
    children: [
      { label: 'Manufacturer List', to: '/manufacturers/list', permissionKey: 'MANUFACTURER_VIEW' },
      { label: 'Manufacturer Add', to: '/manufacturers/add', permissionKey: 'MANUFACTURER_CREATE' },
    ],
  },
  {
    label: 'Product Management',
    icon: FaBoxOpen,
    children: [
      { label: 'Product List', to: '/products/list', permissionKey: 'PRODUCT_VIEW' },
      { label: 'Product Add', to: '/products/add', permissionKey: 'PRODUCT_CREATE' },
    ],
  },
  {
    label: 'Order Management',
    icon: FaShoppingCart,
    children: [
      { label: 'Order List', to: '/orders/list', permissionKey: 'ORDER_VIEW' },
      { label: 'Order Add', to: '/orders/add', permissionKey: 'ORDER_CREATE' },
    ],
  },
  {
    label: 'Table Management',
    icon: FaTable,
    children: [
      { label: 'Table List', to: '/dining-tables/list', permissionKey: 'DINING_TABLE_VIEW' },
      { label: 'Table Add', to: '/dining-tables/add', permissionKey: 'DINING_TABLE_CREATE' },
    ],
  },
  // New Customer Management
  {
    label: 'Customer Management',
    icon: FaUserFriends,
    children: [
      { label: 'Customer List', to: '/customers/list', permissionKey: 'CUSTOMER_VIEW' },
      { label: 'Customer Add', to: '/customers/add', permissionKey: 'CUSTOMER_CREATE' },
    ],
  },
  // New Staff Management
  {
    label: 'Staff Management',
    icon: FaUserTie,
    children: [
      { label: 'Staff List', to: '/staff/list', permissionKey: 'STAFF_VIEW' },
      { label: 'Staff Add', to: '/staff/add', permissionKey: 'STAFF_CREATE' },
    ],
  },
  // New Inventory Management
  {
    label: 'Inventory Management',
    icon: FaBoxOpen,
    children: [
      { label: 'Inventory Dashboard', to: '/inventory', permissionKey: 'INVENTORY_DASHBOARD_VIEW' },
      { label: 'Inventory List', to: '/inventory/list', permissionKey: 'INVENTORY_VIEW' },
      { label: 'Inventory Add', to: '/inventory/add', permissionKey: 'INVENTORY_CREATE' },
      { label: 'Low Stock', to: '/low-stock', permissionKey: 'LOW_STOCK_VIEW' },
      { label: 'Purchases', to: '/purchases/list', permissionKey: 'PURCHASE_VIEW' },
    ],
  },
  // New Stock Transaction Management
  {
    label: 'Stock Transaction Management',
    icon: FaExchangeAlt,
    children: [
      { label: 'Stock Transaction List', to: '/stock-transactions/list', permissionKey: 'STOCK_TRANSACTION_VIEW' },
      { label: 'Stock Transaction Add', to: '/stock-transactions/add', permissionKey: 'STOCK_TRANSACTION_CREATE' },
    ],
  },
  // New Ingredient Management
  {
    label: 'Ingredient Management',
    icon: FaLeaf,
    children: [
      { label: 'Ingredient List', to: '/ingredients/list', permissionKey: 'INGREDIENT_VIEW' },
      { label: 'Ingredient Add', to: '/ingredients/add', permissionKey: 'INGREDIENT_CREATE' },
    ],
  },
  // New Product Ingredient Management
  {
    label: 'Product Ingredient Management',
    icon: FaBlender,
    children: [
      { label: 'Product Ingredient List', to: '/product-ingredients/list', permissionKey: 'PRODUCT_INGREDIENT_VIEW' },
      { label: 'Product Ingredient Add', to: '/product-ingredients/add', permissionKey: 'PRODUCT_INGREDIENT_CREATE' },
    ],
  },
  {
    label: 'Audit Logs',
    icon: FaFileAlt,
    to: '/audit-logs',
    permissionKey: 'AUDIT_LOGS_VIEW'
  },

  {
    label: 'Kitchen',
    icon: FaUtensils,
    to: '/kitchen',
    permissionKey: 'KITCHEN_VIEW'
  },
  {
    label: 'POS',
    icon: FaCashRegister,
    to: '/pos',
    permissionKey: 'POS_VIEW'
  },
  // New Promotions Management
  {
    label: 'Promotions Management',
    icon: FaTags,
    children: [
      { label: 'Promotion List', to: '/promotions/list', permissionKey: 'PROMOTION_VIEW' },
      { label: 'Promotion Add', to: '/promotions/add', permissionKey: 'PROMOTION_CREATE' },
    ],
  },
  // New Sales Management
  {
    label: 'Sales Management',
    icon: FaShoppingCart,
    children: [
      { label: 'Sales List', to: '/sales/list', permissionKey: 'SALES_VIEW' },
    ],
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
                <SubIconComponent className="text-md text-white" />
                {!collapsed && <span>{subItem.label}</span>}
              </div>
              {subItem.children && !collapsed && (
                <span className="text-white">
                  {openMenus[subItem.label] ? <FaChevronDown /> : <FaChevronRight />}
                </span>
              )}
            </div>

            {openMenus[subItem.label] && !collapsed && (
              <div className="ml-4 mt-1 space-y-1 text-white">
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
              `block px-3 py-2 rounded-xl transition-all duration-200 ${isActive
                ? 'bg-[#DA291C] text-white shadow-lg shadow-red-500/20 font-bold sidebar-active'
                : 'text-gray-500 hover:bg-gray-50 hover:text-[#DA291C]'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <SubIconComponent className="text-md" />
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
            className="flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer hover:bg-gray-50 text-gray-600 hover:text-[#DA291C] transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <IconComponent className="text-xl text-gray-400 group-hover:text-red-500" />
              {!collapsed && <span className="font-bold">{item.label}</span>}
            </div>
            {item.children && !collapsed && (
              <span className="opacity-40">
                {openMenus[item.label] ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
              </span>
            )}
          </div>

          {openMenus[item.label] && !collapsed && (
            <div className="ml-4 mt-1 border-l-2 border-[#FFC72C]/30 pl-2 space-y-1">
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
            `block px-3 py-3 rounded-xl transition-all duration-200 ${isActive
              ? 'bg-[#DA291C] text-white shadow-lg shadow-red-500/20 font-bold sidebar-active'
              : 'text-gray-600 hover:bg-gray-50 hover:text-[#DA291C]'
            }`
          }
        >
          <div className="flex items-center gap-3">
            <IconComponent className="text-xl" />
            {!collapsed && <span className="font-bold">{item.label}</span>}
          </div>
        </NavLink>
      );
    }
    return null;
  };

  return (
    <aside
      className={`h-full overflow-y-auto bg-white text-gray-700 transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'} border-r border-gray-100 shadow-xl`}
    >
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md p-6 mb-4 border-b border-gray-50 flex justify-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full p-1 bg-white shadow-md border-2 border-[#FFC72C] flex items-center justify-center overflow-hidden">
            <img src={logoNew} alt="Logo" className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-black text-[#DA291C] text-xl leading-none tracking-tighter">BRNO</span>
              <span className="text-[10px] text-yellow-600 font-bold uppercase tracking-widest mt-1">Management</span>
            </div>
          )}
        </div>
      </div>

      <nav className="px-4 pb-8 space-y-1">
        {filteredMenu.map(renderMenuItem)}
      </nav>
    </aside>
  );
}