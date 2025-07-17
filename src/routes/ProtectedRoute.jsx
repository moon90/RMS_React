
import React from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

const ProtectedRoute = ({ children }) => {
  const loggedIn = !!localStorage.getItem('accessToken');

  if (!loggedIn) {
    return <Navigate to="/login" />;
  }

  return <MainLayout>{children}</MainLayout>;
};

export default ProtectedRoute;
