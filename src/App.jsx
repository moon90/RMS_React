import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UserAdd from './pages/Users/UserAdd';
import UserList from './pages/Users/UserList';
import UserAssignRole from './pages/Users/UserAssignRole';
import RoleAdd from './pages/Roles/RoleAdd';
import RoleList from './pages/Roles/RoleList';
import PermissionAdd from './pages/Permissions/PermissionAdd';
import PermissionList from './pages/Permissions/PermissionList';
import MenuAdd from './pages/Menus/MenuAdd';
import MenuList from './pages/Menus/MenuList';
import RolePermission from './pages/Roles/RolePermission';
import RoleMenus from './pages/Roles/RoleMenus';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/users/add" element={<ProtectedRoute><UserAdd /></ProtectedRoute>} />
      <Route path="/users/list" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
      <Route path="/users/assign-role" element={<ProtectedRoute><UserAssignRole /></ProtectedRoute>} />
      <Route path="/roles/add" element={<ProtectedRoute><RoleAdd /></ProtectedRoute>} />
      <Route path="/roles/list" element={<ProtectedRoute><RoleList /></ProtectedRoute>} />
      <Route path="/roles/permissions" element={<ProtectedRoute><RolePermission /></ProtectedRoute>} />
      <Route path="/roles/menus" element={<ProtectedRoute><RoleMenus /></ProtectedRoute>} />
      <Route path="/permissions/add" element={<ProtectedRoute><PermissionAdd /></ProtectedRoute>} />
      <Route path="/permissions/list" element={<ProtectedRoute><PermissionList /></ProtectedRoute>} />
      <Route path="/menus/add" element={<ProtectedRoute><MenuAdd /></ProtectedRoute>} />
      <Route path="/menus/list" element={<ProtectedRoute><MenuList /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;