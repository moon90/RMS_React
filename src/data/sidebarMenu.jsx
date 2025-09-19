import {
  FaThLarge, FaInfoCircle, FaChartLine, FaUsers, FaLock, FaList, FaUserFriends, FaUserTie, FaShoppingCart, FaTags
} from 'react-icons/fa';

export const sidebarMenu = [
  { label: 'Dashboard', icon: <FaThLarge />, path: '/dashboard' }, // Corrected path
  { label: 'Roles', icon: <FaUsers />, children: [
    { label: 'Role List', path: '/roles/list' }, // Corrected path
    { label: 'Add Role', path: '/roles/add' },
    { label: 'Role Permissions', path: '/roles/role_permissions' }, // Corrected path
    { label: 'Menu Assignments', path: '/roles/menu_assignments' }
  ]},
  { label: 'Permissions', icon: <FaLock />, children: [
    { label: 'Permission List', path: '/permissions/list' },
    { label: 'Add Permission', path: '/permissions/add' }
  ]},
  { label: 'Menus', icon: <FaList />, children: [
    { label: 'Menu List', path: '/menus/list' },
    { label: 'Add Menu', path: '/menus/add' }
  ]},
  { label: 'Customers', icon: <FaUserFriends />, children: [
    { label: 'Customer List', path: '/customers/list' },
    { label: 'Add Customer', path: '/customers/add' }
  ]},
  { label: 'Staff', icon: <FaUserTie />, children: [
    { label: 'Staff List', path: '/staff/list' },
    { label: 'Add Staff', path: '/staff/add' }
  ]},
  { label: 'Promotions', icon: <FaTags />, children: [
    { label: 'Promotion List', path: '/promotions/list' },
    { label: 'Add Promotion', path: '/promotions/add' }
  ]},
  { label: 'Purchases', icon: <FaShoppingCart />, children: [
    { label: 'Purchase List', path: '/purchases/list' },
    { label: 'Add Purchase', path: '/purchases/create' }
  ]},
  { label: 'Sales', icon: <FaChartLine />, children: [
    { label: 'Sales List', path: '/sales/list' },
    { label: 'Add Sale', path: '/sales/add' }
  ]}
];
