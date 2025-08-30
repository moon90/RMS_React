import React, { createContext, useState, useEffect } from 'react';
import { login as authServiceLogin } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        const storedRolePermissions = localStorage.getItem('rolePermissions');
        const storedMenuPermissions = localStorage.getItem('menuPermissions');

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          const rolePermissions = storedRolePermissions ? JSON.parse(storedRolePermissions) : [];
          const menuPermissions = storedMenuPermissions ? JSON.parse(storedMenuPermissions) : [];
          
          // Combine all permissions into a single array on the user object
          parsedUser.permissions = [...rolePermissions, ...menuPermissions];

          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to load user from local storage", error);
        logout(); // Clear any corrupted data
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authServiceLogin(username, password);
      if (response.data.isSuccess) {
        const userData = response.data.data;
        
        // Combine permissions before setting the user state
        const combinedPermissions = [...(userData.rolePermissions || []), ...(userData.menuPermissions || [])];
        const userWithPermissions = { ...userData.user, permissions: combinedPermissions };

        setUser(userWithPermissions);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData.user));
        localStorage.setItem('token', userData.accessToken); 
        localStorage.setItem('rolePermissions', JSON.stringify(userData.rolePermissions));
        localStorage.setItem('menuPermissions', JSON.stringify(userData.menuPermissions));
        return { success: true };
      } else {
        return { success: false, message: response.data.message || 'Login failed' };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: error.response?.data?.message || 'An error occurred during login' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('rolePermissions');
    localStorage.removeItem('menuPermissions');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);