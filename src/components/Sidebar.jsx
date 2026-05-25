import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FaBoxOpen, FaChevronDown, FaChevronRight,
  FaClipboardList, FaListUl, FaUtensils, FaHome, FaUsers, FaCog, FaPlus, FaEdit, FaTrash, FaFileAlt, FaUserShield,
  FaTruck, FaIndustry, FaUserFriends, FaUserTie, FaExchangeAlt, FaLeaf, FaBlender, FaCashRegister, FaTable, FaShoppingCart, FaTags, FaBuilding, FaChartLine, FaRobot, FaShieldAlt
} from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { hasMenuPermission, hasPermission } from '../utils/permissionUtils';
import logoNew from '../assets/images/logo_new.png';
import { systemSettingService } from '../services/systemSettingService';

const menu = [
  {
    label: 'Daily Operations',
    translationKey: 'sidebar.daily_operations',
    isHeader: true
  },
  {
    label: 'Dashboard',
    translationKey: 'sidebar.dashboard',
    icon: FaHome,
    to: '/dashboard',
    permissionKey: 'DASHBOARD_VIEW'
  },
  {
    label: 'POS Terminal',
    translationKey: 'sidebar.pos_terminal',
    icon: FaCashRegister,
    to: '/pos',
    permissionKey: 'POS_VIEW'
  },
  {
    label: 'Front of House',
    translationKey: 'sidebar.pos',
    icon: FaTable,
    children: [
      { label: 'Active Orders', translationKey: 'sidebar.orders', to: '/orders/list', permissionKey: 'ORDER_VIEW' },
      { label: 'Kitchen Live', translationKey: 'sidebar.kitchen', to: '/kitchen', permissionKey: 'KITCHEN_VIEW' },
      { label: 'Table Layout', translationKey: 'sidebar.tables', to: '/dining-tables/list', permissionKey: 'DINING_TABLE_VIEW' },
    ],
  },
  {
    label: 'Production & Product Engineering',
    translationKey: 'sidebar.production_engineering',
    isHeader: true
  },
  {
    label: 'Menu & Production',
    translationKey: 'sidebar.products',
    icon: FaUtensils,
    children: [
      { label: 'Finished Products', translationKey: 'sidebar.product_list', to: '/products/list', permissionKey: 'PRODUCT_VIEW' },
      { label: 'Menu Categories', translationKey: 'sidebar.categories', to: '/categories/list', permissionKey: 'CATEGORY_VIEW' },
      { label: 'Product Recipes', translationKey: 'sidebar.product_ingredients', to: '/product-ingredients/list', permissionKey: 'PRODUCT_INGREDIENT_VIEW' },
      { label: 'Measurement Units', translationKey: 'sidebar.units', to: '/units/list', permissionKey: 'UNIT_VIEW' },
    ],
  },
  {
    label: 'Supply Chain Management',
    translationKey: 'sidebar.supply_chain',
    isHeader: true
  },
  {
    label: 'Inventory Control',
    translationKey: 'sidebar.inventory',
    icon: FaBoxOpen,
    children: [
      { label: 'Warehouse Nodes', translationKey: 'sidebar.warehouse', to: '/inventory/list', permissionKey: 'INVENTORY_VIEW' },
      { label: 'Raw Materials', translationKey: 'sidebar.ingredient_list', to: '/ingredients/list', permissionKey: 'INGREDIENT_VIEW' },
      { label: 'Procurement', translationKey: 'sidebar.purchases', to: '/purchases/list', permissionKey: 'PURCHASE_VIEW' },
      { 
        label: 'Movement', 
        translationKey: 'sidebar.movement',
        icon: FaExchangeAlt,
        children: [
           { label: 'Transactions', translationKey: 'sidebar.logistics', to: '/stock-transactions/list', permissionKey: 'STOCK_TRANSACTION_VIEW' },
           { label: 'Transfers', translationKey: 'sidebar.transfer_list', to: '/stock-transfers/list', permissionKey: 'STOCK_TRANSFER_VIEW' },
        ]
      },
      { 
        label: 'System Intelligence', 
        translationKey: 'sidebar.intelligence',
        icon: FaRobot,
        children: [
           { label: 'Low Stock Alerts', translationKey: 'sidebar.low_stock', to: '/low-stock-alerts', permissionKey: 'INVENTORY_LOW_STOCK_VIEW' },
           { label: 'Variance Audits', translationKey: 'sidebar.variance_ai', to: '/inventory-audits/list', permissionKey: 'INVENTORY_VIEW' },
        ]
      },
    ],
  },
  {
    label: 'CRM & Finance',
    translationKey: 'sidebar.crm_finance',
    isHeader: true
  },
  {
    label: 'Finance & Sales',
    translationKey: 'sidebar.sales',
    icon: FaChartLine,
    children: [
      { label: 'Sales Records', translationKey: 'sidebar.sales_list', to: '/sales/list', permissionKey: 'SALE_VIEW' },
      { label: 'Promotions', translationKey: 'sidebar.promotions', to: '/promotions/list', permissionKey: 'PROMOTION_VIEW' },
    ],
  },
  {
    label: 'Partners & CRM',
    translationKey: 'sidebar.customers',
    icon: FaUserFriends,
    children: [
      { label: 'Customer Base', translationKey: 'sidebar.customer_list', to: '/customers/list', permissionKey: 'CUSTOMER_VIEW' },
      { label: 'Supply Partners', translationKey: 'sidebar.suppliers', to: '/suppliers/list', permissionKey: 'SUPPLIER_VIEW' },
      { label: 'Manufacturers', translationKey: 'sidebar.manufacturers', to: '/manufacturers/list', permissionKey: 'MANUFACTURER_VIEW' },
    ],
  },
  {
    label: 'Security & HR',
    translationKey: 'sidebar.security_hr',
    isHeader: true
  },
  {
    label: 'Team & Security',
    translationKey: 'sidebar.user_management',
    icon: FaUsers,
    children: [
      { label: 'Employee Roster', translationKey: 'sidebar.staff', to: '/staff/list', permissionKey: 'STAFF_VIEW' },
      { label: 'Payroll AI', translationKey: 'sidebar.payroll', to: '/payroll', permissionKey: 'PAYROLL_VIEW' },
      { label: 'Identity Registry', translationKey: 'sidebar.users', to: '/users/list', permissionKey: 'USER_VIEW' },
      { label: 'User Access Role', translationKey: 'sidebar.user_access_role', to: '/roles/access_role', permissionKey: 'ROLE_VIEW' },
      { label: 'Access Roles', translationKey: 'sidebar.roles', to: '/roles/list', permissionKey: 'ROLE_VIEW' },
      { label: 'Role Permissions', translationKey: 'sidebar.role_permissions', to: '/roles/role_permissions', permissionKey: 'PERMISSION_VIEW' },
      { label: 'Menu Assignments', translationKey: 'sidebar.menu_assignments', to: '/roles/menu_assignments', permissionKey: 'MENU_VIEW' },
      { label: 'Audit Logs', translationKey: 'sidebar.audit_logs', to: '/audit-logs', permissionKey: 'AUDIT_LOG_VIEW' },
    ],
  },
  {
    label: 'System Network',
    translationKey: 'sidebar.system_network',
    isHeader: true
  },
  {
    label: 'Settings & Network',
    translationKey: 'sidebar.settings',
    icon: FaCog,
    children: [
      { label: 'System Config', translationKey: 'sidebar.settings', to: '/settings', permissionKey: 'SYSTEM_SETTING_VIEW' },
      { label: 'Branch Network', translationKey: 'sidebar.branches', to: '/branches/list', permissionKey: 'BRANCH_VIEW' },
      { label: 'Navigation Setup', translationKey: 'sidebar.menus', to: '/menus/list', permissionKey: 'MENU_VIEW' },
    ],
  },
];

export default function Sidebar({ collapsed }) {
  const { t } = useTranslation();
  const [openMenus, setOpenMenus] = useState({});
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [dbLogo, setDbLogo] = useState(null);
  const [restaurantName, setRestaurantName] = useState('BRNO');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [restaurantPhone, setRestaurantPhone] = useState('');

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const data = await systemSettingService.getAllSettings();
        if (data && (data.isSuccess || data.IsSuccess)) {
          const settings = data.data || data.Data || [];
          
          const logoSetting = settings.find(s => (s.settingKey || s.SettingKey) === 'RestaurantLogo');
          const logoValue = logoSetting?.settingValue || logoSetting?.SettingValue;
          if (logoValue) setDbLogo(logoValue);

          const nameSetting = settings.find(s => (s.settingKey || s.SettingKey) === 'RestaurantName');
          const nameValue = nameSetting?.settingValue || nameSetting?.SettingValue;
          if (nameValue) setRestaurantName(nameValue);

          const addressSetting = settings.find(s => (s.settingKey || s.SettingKey) === 'RestaurantAddress');
          const addressValue = addressSetting?.settingValue || addressSetting?.SettingValue;
          if (addressValue) setRestaurantAddress(addressValue);

          const phoneSetting = settings.find(s => (s.settingKey || s.SettingKey) === 'RestaurantPhone');
          const phoneValue = phoneSetting?.settingValue || phoneSetting?.SettingValue;
          if (phoneValue) setRestaurantPhone(phoneValue);
        }
      } catch (error) {
        console.error("Failed to fetch sidebar branding:", error);
      }
    };
    fetchBranding();
  }, []);

  useEffect(() => {
    const filterMenuItems = (items) => {
      return items.reduce((acc, item) => {
        if (item.isHeader) {
          acc.push({ ...item });
          return acc;
        }
        if (item.children) {
          const filteredChildren = filterMenuItems(item.children);
          if (filteredChildren.length > 0) {
            acc.push({ ...item, children: filteredChildren });
          }
        } else if (item.to) {
          if (hasMenuPermission(item.to) || (item.permissionKey && hasPermission(item.permissionKey))) {
            acc.push({ ...item });
          }
        }
        return acc;
      }, []).filter((item, idx, self) => {
        // Remove headers that have no items until the next header
        if (item.isHeader) {
          let hasActualItems = false;
          for (let i = idx + 1; i < self.length; i++) {
            if (self[i].isHeader) break;
            hasActualItems = true;
            break;
          }
          return hasActualItems;
        }
        return true;
      });
    };
    
    const updateMenu = () => {
      setFilteredMenu(filterMenuItems(menu));
    };

    updateMenu();
    window.addEventListener('permissionsUpdated', updateMenu);
    
    return () => window.removeEventListener('permissionsUpdated', updateMenu);
  }, []);

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const renderMenuItem = (item, level = 0) => {
    if (item.isHeader) {
      if (collapsed) return <div key={item.label} className="h-px bg-gray-100 my-4 mx-4" />;
      return (
        <div key={item.label} className="px-6 pt-6 pb-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t(item.translationKey) || item.label}</p>
        </div>
      );
    }

    const IconComponent = item.icon;
    const isOpen = openMenus[item.label];

    const renderSubMenu = (subItem, subLevel) => {
      const SubIconComponent = subItem.icon || FaListUl;
      const isSubOpen = openMenus[subItem.label];

      if (subItem.children && subItem.children.length > 0) {
        return (
          <div key={subItem.label} className="mt-1">
            <div
              onClick={() => toggleMenu(subItem.label)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                isSubOpen ? 'bg-red-50 text-[#DA291C] font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-[#DA291C]'
              }`}
            >
              <div className="flex items-center gap-3">
                <SubIconComponent className={`text-md ${isSubOpen ? 'text-[#DA291C]' : 'text-gray-400'}`} />
                {!collapsed && <span className="truncate text-xs font-bold uppercase tracking-tight">{t(subItem.translationKey) || subItem.label}</span>}
              </div>
              {subItem.children && !collapsed && (
                <span className={isSubOpen ? 'text-[#DA291C]' : 'text-gray-400'}>
                  {isSubOpen ? <FaChevronDown className="text-[10px]" /> : <FaChevronRight className="text-[10px]" />}
                </span>
              )}
            </div>

            {isSubOpen && !collapsed && (
              <div className="ml-5 mt-1 border-l-2 border-red-100 pl-3 space-y-1">
                {subItem.children.map(child => renderSubMenu(child, subLevel + 1))}
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
              `block px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive
                ? 'bg-gradient-to-r from-[#DA291C] to-red-500 text-white shadow-md shadow-red-500/20 font-bold sidebar-active'
                : 'text-gray-500 hover:bg-gray-50 hover:text-[#DA291C]'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <SubIconComponent className="text-sm" />
              {!collapsed && <span className="truncate text-[11px] font-bold uppercase tracking-widest">{t(subItem.translationKey) || subItem.label}</span>}
            </div>
          </NavLink>
        );
      }
      return null;
    };

    if (item.children && item.children.length > 0) {
      return (
        <div key={item.label} className="mb-1">
          <div
            onClick={() => toggleMenu(item.label)}
            className={`flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${
              isOpen ? 'bg-red-50/80 text-[#DA291C]' : 'text-gray-600 hover:bg-gray-50 hover:text-[#DA291C]'
            }`}
          >
            <div className="flex items-center gap-3">
              <IconComponent className={`text-xl transition-colors ${isOpen ? 'text-[#DA291C]' : 'text-gray-400 group-hover:text-red-500'}`} />
              {!collapsed && <span className={`font-black text-xs uppercase tracking-tight ${isOpen ? 'text-[#DA291C]' : ''}`}>{t(item.translationKey) || item.label}</span>}
            </div>
            {item.children && !collapsed && (
              <span className={`transition-transform duration-200 ${isOpen ? 'text-[#DA291C]' : 'text-gray-400 opacity-50'}`}>
                {isOpen ? <FaChevronDown className="text-[10px]" /> : <FaChevronRight className="text-[10px]" />}
              </span>
            )}
          </div>

          {isOpen && !collapsed && (
            <div className="ml-5 mt-1 border-l-2 border-[#FFC72C]/40 pl-3 space-y-1 py-1">
              {item.children.map(child => renderSubMenu(child, level + 1))}
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
            `block px-3 py-3 mb-1 rounded-xl transition-all duration-200 ${isActive
              ? 'bg-gradient-to-r from-[#DA291C] to-red-500 text-white shadow-md shadow-red-500/20 font-bold sidebar-active'
              : 'text-gray-600 hover:bg-gray-50 hover:text-[#DA291C]'
            }`
          }
        >
          <div className="flex items-center gap-3">
            <IconComponent className="text-xl" />
            {!collapsed && <span className="font-black text-xs uppercase tracking-tight">{t(item.translationKey) || item.label}</span>}
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
            <img id="app-logo" src={dbLogo || logoNew} alt="Logo" className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span id="app-name" className="font-black text-[#DA291C] text-xl leading-tight tracking-tighter truncate w-44">
                {restaurantName}
              </span>
              <span className="text-[10px] text-yellow-600 font-bold uppercase tracking-widest mt-0.5">
                Management
              </span>
            </div>
          )}
        </div>
      </div>

      <nav className="px-4 pb-8 space-y-1 flex-1">
        {filteredMenu.map(renderMenuItem)}
      </nav>

      {/* Sidebar Footer Info */}
      {!collapsed && (restaurantAddress || restaurantPhone) && (
        <div className="mt-auto p-6 bg-gray-50 border-t border-gray-100">
          <div className="space-y-3">
            {restaurantAddress && (
              <div className="flex gap-2">
                <FaHome className="text-gray-400 mt-1 flex-shrink-0 text-xs" />
                <p className="text-[11px] text-gray-500 leading-tight">{restaurantAddress}</p>
              </div>
            )}
            {restaurantPhone && (
              <div className="flex items-center gap-2">
                <FaUserFriends className="text-gray-400 flex-shrink-0 text-xs" />
                <p className="text-[11px] text-gray-500 font-bold">{restaurantPhone}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}