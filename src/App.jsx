import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UserAdd from './pages/Users/UserAdd';
import UserList from './pages/Users/UserList';
import UserAccessRole from './pages/Roles/UserAccessRole'; // Corrected import path
import RoleAdd from './pages/Roles/RoleAdd';
import RoleList from './pages/Roles/RoleList';
import PermissionAdd from './pages/Permissions/PermissionAdd';
import PermissionList from './pages/Permissions/PermissionList';
import MenuAdd from './pages/Menus/MenuAdd';
import MenuList from './pages/Menus/MenuList';

import CategoryList from './pages/Categories/CategoryList';
import CategoryAdd from './pages/Categories/CategoryAdd';
import CategoryEdit from './pages/Categories/CategoryEdit';

import UnitList from './pages/Units/UnitList';
import UnitAdd from './pages/Units/UnitAdd';
import UnitEdit from './pages/Units/UnitEdit';

import SupplierList from './pages/Suppliers/SupplierList';
import SupplierAdd from './pages/Suppliers/SupplierAdd';
import SupplierEdit from './pages/Suppliers/SupplierEdit';

import ManufacturerList from './pages/Manufacturers/ManufacturerList';
import ManufacturerAdd from './pages/Manufacturers/ManufacturerAdd';
import ManufacturerEdit from './pages/Manufacturers/ManufacturerEdit';

import ProductList from './pages/Products/ProductList';
import ProductAdd from './pages/Products/ProductAdd';
import ProductEdit from './pages/Products/ProductEdit';

import MenuSetup from './pages/Roles/MenuSetup'; // New import
import AuditLogs from './pages/AuditLogs'; // New import
import Inventory from './pages/Inventory'; // New import
import Kitchen from './pages/Kitchen'; // New import
import ProtectedRoute from './routes/ProtectedRoute';
import RoleMenus from './pages/Roles/RoleMenus';
import PermissionSetup from './pages/Roles/PermissionSetup';
import RolePermission from './pages/Roles/RolePermission';
import AccessDenied from './pages/AccessDenied';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/users/add" element={<ProtectedRoute><UserAdd /></ProtectedRoute>} />
      <Route path="/users/list" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
      <Route path="/roles/access_role" element={<ProtectedRoute><UserAccessRole /></ProtectedRoute>} />
      <Route path="/roles/add" element={<ProtectedRoute><RoleAdd /></ProtectedRoute>} />
      <Route path="/roles/list" element={<ProtectedRoute><RoleList /></ProtectedRoute>} />
      
      <Route path="/roles/menu_setup" element={<ProtectedRoute><MenuSetup /></ProtectedRoute>} />
      <Route path="/roles/permission_setup" element={<ProtectedRoute><PermissionSetup /></ProtectedRoute>} />
      <Route path="/roles/role_permissions" element={<ProtectedRoute><RolePermission /></ProtectedRoute>} />
      <Route path="/roles/menu_assignments" element={<ProtectedRoute><RoleMenus /></ProtectedRoute>} />
      <Route path="/permissions/add" element={<ProtectedRoute><PermissionAdd /></ProtectedRoute>} />
      <Route path="/permissions/list" element={<ProtectedRoute><PermissionList /></ProtectedRoute>} />
      <Route path="/menus/add" element={<ProtectedRoute><MenuAdd /></ProtectedRoute>} />
      <Route path="/menus/list" element={<ProtectedRoute><MenuList /></ProtectedRoute>} />
      <Route path="/categories/list" element={<ProtectedRoute><CategoryList /></ProtectedRoute>} />
      <Route path="/categories/add" element={<ProtectedRoute><CategoryAdd /></ProtectedRoute>} />
      <Route path="/categories/edit/:id" element={<ProtectedRoute><CategoryEdit /></ProtectedRoute>} />
      <Route path="/units/list" element={<ProtectedRoute><UnitList /></ProtectedRoute>} />
      <Route path="/units/add" element={<ProtectedRoute><UnitAdd /></ProtectedRoute>} />
      <Route path="/units/edit/:id" element={<ProtectedRoute><UnitEdit /></ProtectedRoute>} />
      <Route path="/suppliers/list" element={<ProtectedRoute><SupplierList /></ProtectedRoute>} />
      <Route path="/suppliers/add" element={<ProtectedRoute><SupplierAdd /></ProtectedRoute>} />
      <Route path="/suppliers/edit/:id" element={<ProtectedRoute><SupplierEdit /></ProtectedRoute>} />
      <Route path="/manufacturers/list" element={<ProtectedRoute><ManufacturerList /></ProtectedRoute>} />
      <Route path="/manufacturers/add" element={<ProtectedRoute><ManufacturerAdd /></ProtectedRoute>} />
      <Route path="/manufacturers/edit/:id" element={<ProtectedRoute><ManufacturerEdit /></ProtectedRoute>} />
      <Route path="/products/list" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
      <Route path="/products/add" element={<ProtectedRoute><ProductAdd /></ProtectedRoute>} />
      <Route path="/products/edit/:id" element={<ProtectedRoute><ProductEdit /></ProtectedRoute>} />
      <Route path="/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
      <Route path="/kitchen" element={<ProtectedRoute><Kitchen /></ProtectedRoute>} />
      <Route path="/access-denied" element={<AccessDenied />} />
    </Routes>
    </AuthProvider>
  );
}

export default App;