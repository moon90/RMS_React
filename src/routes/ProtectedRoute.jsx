
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // POS Page should not be wrapped in MainLayout (Sidebar/Header)
  if (location.pathname === '/pos') {
    return children;
  }

  return <MainLayout>{children}</MainLayout>;
};

export default ProtectedRoute;
