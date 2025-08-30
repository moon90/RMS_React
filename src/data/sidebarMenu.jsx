import {
  FaThLarge, FaInfoCircle, FaChartLine, FaUsers, FaLock, FaList
} from 'react-icons/fa';

export const sidebarMenu = [
  { label: 'Dashboard', icon: <FaThLarge />, path: '/' },
  { label: 'Roles', icon: <FaUsers />, children: [
    { label: 'Role List', path: '/roles' },
    { label: 'Add Role', path: '/roles/add' },
    { label: 'Role Permissions', path: '/roles/permissions' },
    { label: 'Menu Assignments', path: '/roles/menu_assignments' }
  ]},
  { label: 'Permissions', icon: <FaLock />, children: [] },
  { label: 'Menus', icon: <FaList />, children: [] }
];
