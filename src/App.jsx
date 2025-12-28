import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy-loaded page components
const LoginPage = lazy(() => import('./pages/Login/LoginPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserAdd = lazy(() => import('./pages/Users/UserAdd'));
const UserList = lazy(() => import('./pages/Users/UserList'));
const UserAccessRole = lazy(() => import('./pages/Roles/UserAccessRole'));
const RoleAdd = lazy(() => import('./pages/Roles/RoleAdd'));
const RoleList = lazy(() => import('./pages/Roles/RoleList'));
const PermissionAdd = lazy(() => import('./pages/Permissions/PermissionAdd'));
const PermissionList = lazy(() => import('./pages/Permissions/PermissionList'));
const MenuAdd = lazy(() => import('./pages/Menus/MenuAdd'));
const MenuList = lazy(() => import('./pages/Menus/MenuList'));
const CategoryList = lazy(() => import('./pages/Categories/CategoryList'));
const CategoryAdd = lazy(() => import('./pages/Categories/CategoryAdd'));
const CategoryEdit = lazy(() => import('./pages/Categories/CategoryEdit'));
const UnitList = lazy(() => import('./pages/Units/UnitList'));
const UnitAdd = lazy(() => import('./pages/Units/UnitAdd'));
const UnitEdit = lazy(() => import('./pages/Units/UnitEdit'));
const SupplierList = lazy(() => import('./pages/Suppliers/SupplierList'));
const SupplierAdd = lazy(() => import('./pages/Suppliers/SupplierAdd'));
const SupplierEdit = lazy(() => import('./pages/Suppliers/SupplierEdit'));
const ManufacturerList = lazy(() => import('./pages/Manufacturers/ManufacturerList'));
const ManufacturerAdd = lazy(() => import('./pages/Manufacturers/ManufacturerAdd'));
const ManufacturerEdit = lazy(() => import('./pages/Manufacturers/ManufacturerEdit'));
const ProductList = lazy(() => import('./pages/Products/ProductList'));
const ProductAdd = lazy(() => import('./pages/Products/ProductAdd'));
const ProductEdit = lazy(() => import('./pages/Products/ProductEdit'));
const CustomerList = lazy(() => import('./pages/Customers/CustomerList'));
const CustomerAdd = lazy(() => import('./pages/Customers/CustomerAdd'));
const CustomerEdit = lazy(() => import('./pages/Customers/CustomerEdit'));
const StaffList = lazy(() => import('./pages/Staff/StaffList'));
const StaffAdd = lazy(() => import('./pages/Staff/StaffAdd'));
const StaffEdit = lazy(() => import('./pages/Staff/StaffEdit'));
const MenuSetup = lazy(() => import('./pages/Roles/MenuSetup'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const InventoryDashboard = lazy(() => import('./pages/InventoryDashboard'));
const InventoryList = lazy(() => import('./pages/Inventory/InventoryList'));
const InventoryAdd = lazy(() => import('./pages/Inventory/InventoryAdd'));
const InventoryEdit = lazy(() => import('./pages/Inventory/InventoryEdit'));
const LowStockPage = lazy(() => import('./pages/LowStock/LowStockPage'));
const Kitchen = lazy(() => import('./pages/Kitchen'));
const StockTransactionList = lazy(() => import('./pages/StockTransactions/StockTransactionList'));
const StockTransactionAdd = lazy(() => import('./pages/StockTransactions/StockTransactionAdd'));
const StockTransactionEdit = lazy(() => import('./pages/StockTransactions/StockTransactionEdit'));
const IngredientList = lazy(() => import('./pages/Ingredients/IngredientList'));
const IngredientAdd = lazy(() => import('./pages/Ingredients/IngredientAdd'));
const IngredientEdit = lazy(() => import('./pages/Ingredients/IngredientEdit'));
const ProductIngredientList = lazy(() => import('./pages/ProductIngredients/ProductIngredientList'));
const ProductIngredientAdd = lazy(() => import('./pages/ProductIngredients/ProductIngredientAdd'));
const ProductIngredientEdit = lazy(() => import('./pages/ProductIngredients/ProductIngredientEdit'));
const POSPage = lazy(() => import('./pages/POS/POSPage'));
const DiningTableList = lazy(() => import('./pages/DiningTables/DiningTableList'));
const DiningTableAdd = lazy(() => import('./pages/DiningTables/DiningTableAdd'));
const DiningTableEdit = lazy(() => import('./pages/DiningTables/DiningTableEdit'));
const OrderList = lazy(() => import('./pages/Orders/OrderList'));
const OrderAdd = lazy(() => import('./pages/Orders/OrderAdd'));
const OrderEdit = lazy(() => import('./pages/Orders/OrderEdit'));
const OrderDetail = lazy(() => import('./pages/Orders/OrderDetail'));
const PromotionList = lazy(() => import('./pages/Promotions/PromotionList'));
const PromotionAdd = lazy(() => import('./pages/Promotions/PromotionAdd'));
const PromotionEdit = lazy(() => import('./pages/Promotions/PromotionEdit'));
const PurchaseList = lazy(() => import('./pages/Purchases/PurchaseList'));
const CreatePurchase = lazy(() => import('./pages/Purchases/CreatePurchase'));
const PurchaseEdit = lazy(() => import('./pages/Purchases/PurchaseEdit'));
const PurchaseDetail = lazy(() => import('./pages/Purchases/PurchaseDetail'));
const SalesAdd = lazy(() => import('./pages/Sales/SalesAdd'));
const SalesEdit = lazy(() => import('./pages/Sales/SalesEdit'));
const SaleDetail = lazy(() => import('./pages/Sales/SaleDetail'));
const SalesList = lazy(() => import('./pages/Sales/SalesList'));
const LowStockAlerts = lazy(() => import('./pages/LowStockAlerts/LowStockAlerts'));
const ProtectedRoute = lazy(() => import('./routes/ProtectedRoute'));
const RoleMenus = lazy(() => import('./pages/Roles/RoleMenus'));
const PermissionSetup = lazy(() => import('./pages/Roles/PermissionSetup'));
const RolePermission = lazy(() => import('./pages/Roles/RolePermission'));
const AccessDenied = lazy(() => import('./pages/AccessDenied'));

import { AuthProvider } from './context/AuthContext';
import { LayoutProvider } from './context/LayoutContext';
import ErrorBoundary from './components/ErrorBoundary'; // Import the ErrorBoundary

function App() {
  return (
    <AuthProvider>
      <LayoutProvider>
        <ErrorBoundary>
          <Suspense fallback={<div>Loading application...</div>}>
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

            <Route path="/customers/list" element={<ProtectedRoute><CustomerList /></ProtectedRoute>} />
            <Route path="/customers/add" element={<ProtectedRoute><CustomerAdd /></ProtectedRoute>} />
            <Route path="/customers/edit/:id" element={<ProtectedRoute><CustomerEdit /></ProtectedRoute>} />

            <Route path="/staff/list" element={<ProtectedRoute><StaffList /></ProtectedRoute>} />
            <Route path="/staff/add" element={<ProtectedRoute><StaffAdd /></ProtectedRoute>} />
            <Route path="/staff/edit/:id" element={<ProtectedRoute><StaffEdit /></ProtectedRoute>} />
            <Route path="/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><InventoryDashboard /></ProtectedRoute>} />
            <Route path="/inventory/list" element={<ProtectedRoute><InventoryList /></ProtectedRoute>} />
            <Route path="/inventory/add" element={<ProtectedRoute><InventoryAdd /></ProtectedRoute>} />
            <Route path="/inventory/edit/:id" element={<ProtectedRoute><InventoryEdit /></ProtectedRoute>} />
            <Route path="/low-stock" element={<ProtectedRoute><LowStockPage /></ProtectedRoute>} />
            <Route path="/stock-transactions/list" element={<ProtectedRoute><StockTransactionList /></ProtectedRoute>} />
            <Route path="/stock-transactions/add" element={<ProtectedRoute><StockTransactionAdd /></ProtectedRoute>} />
            <Route path="/stock-transactions/edit/:id" element={<ProtectedRoute><StockTransactionEdit /></ProtectedRoute>} />
            <Route path="/ingredients/list" element={<ProtectedRoute><IngredientList /></ProtectedRoute>} />
            <Route path="/ingredients/add" element={<ProtectedRoute><IngredientAdd /></ProtectedRoute>} />
            <Route path="/ingredients/edit/:id" element={<ProtectedRoute><IngredientEdit /></ProtectedRoute>} />
            <Route path="/product-ingredients/list" element={<ProtectedRoute><ProductIngredientList /></ProtectedRoute>} />

            <Route path="/product-ingredients/add" element={<ProtectedRoute><ProductIngredientAdd /></ProtectedRoute>} />
            <Route path="/product-ingredients/edit/:id" element={<ProtectedRoute><ProductIngredientEdit /></ProtectedRoute>} />
            <Route path="/orders/list" element={<ProtectedRoute><OrderList /></ProtectedRoute>} />
            <Route path="/orders/add" element={<ProtectedRoute><OrderAdd /></ProtectedRoute>} />
            <Route path="/orders/edit/:id" element={<ProtectedRoute><OrderEdit /></ProtectedRoute>} />
            <Route path="/orders/detail/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
            <Route path="/dining-tables/list" element={<ProtectedRoute><DiningTableList /></ProtectedRoute>} />
            <Route path="/dining-tables/add" element={<ProtectedRoute><DiningTableAdd /></ProtectedRoute>} />
            <Route path="/dining-tables/edit/:id" element={<ProtectedRoute><DiningTableEdit /></ProtectedRoute>} />
            <Route path="/promotions/list" element={<ProtectedRoute><PromotionList /></ProtectedRoute>} />
            <Route path="/promotions/add" element={<ProtectedRoute><PromotionAdd /></ProtectedRoute>} />
            <Route path="/promotions/edit/:id" element={<ProtectedRoute><PromotionEdit /></ProtectedRoute>} />
            <Route path="/purchases/list" element={<ProtectedRoute><PurchaseList /></ProtectedRoute>} />
            <Route path="/purchases/create" element={<ProtectedRoute><CreatePurchase /></ProtectedRoute>} />
            <Route path="/purchases/edit/:id" element={<ProtectedRoute><PurchaseEdit /></ProtectedRoute>} />
            <Route path="/purchases/:id" element={<ProtectedRoute><PurchaseDetail /></ProtectedRoute>} />
            <Route path="/sales/list" element={<ProtectedRoute><SalesList /></ProtectedRoute>} />
            <Route path="/sales/add" element={<ProtectedRoute><SalesAdd /></ProtectedRoute>} />
            <Route path="/sales/edit/:id" element={<ProtectedRoute><SalesEdit /></ProtectedRoute>} />
            <Route path="/sales/:id" element={<ProtectedRoute><SaleDetail /></ProtectedRoute>} />
            <Route path="/low-stock-alerts" element={<ProtectedRoute><LowStockAlerts /></ProtectedRoute>} />
            <Route path="/pos" element={<ProtectedRoute><POSPage /></ProtectedRoute>} />
            <Route path="/kitchen" element={<ProtectedRoute><Kitchen /></ProtectedRoute>} />
            <Route path="/access-denied" element={<AccessDenied />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </LayoutProvider>
    </AuthProvider>
  );
}

export default App;