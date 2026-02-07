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
        const storedToken = localStorage.getItem('accessToken');
        const storedRolePermissions = localStorage.getItem('rolePermissions');
        const storedMenuPermissions = localStorage.getItem('menuPermissions');

        if (storedToken) {
          const parsedUser = storedUser ? JSON.parse(storedUser) : {};
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
      const userData = response.data?.data ?? response.data;
      const hasToken =
        Boolean(userData?.accessToken) ||
        Boolean(userData?.access_token) ||
        Boolean(userData?.token) ||
        Boolean(response.data?.accessToken) ||
        Boolean(response.data?.access_token) ||
        Boolean(response.data?.token);

      if (response.data?.isSuccess || hasToken) {
        const userInfo = userData?.user ?? userData;
        const accessToken =
          userData?.accessToken ??
          userData?.access_token ??
          userData?.token ??
          response.data.accessToken ??
          response.data.access_token ??
          response.data.token;
        const refreshToken =
          userData?.refreshToken ??
          userData?.refresh_token ??
          response.data.refreshToken ??
          response.data.refresh_token;
        
        // Combine permissions before setting the user state
        const combinedPermissions = [...(userData?.rolePermissions || []), ...(userData?.menuPermissions || [])];
        const userWithPermissions = { ...(userInfo || {}), permissions: combinedPermissions };

        if (!accessToken) {
          return { success: false, message: 'Login response missing access token.' };
        }

        setUser(userWithPermissions);
        setIsAuthenticated(true);
        if (userInfo) {
          localStorage.setItem('user', JSON.stringify(userInfo));
        }
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        }
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('rolePermissions', JSON.stringify(userData?.rolePermissions || []));
        localStorage.setItem('menuPermissions', JSON.stringify(userData?.menuPermissions || []));
        return { success: true, data: userData };
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
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
