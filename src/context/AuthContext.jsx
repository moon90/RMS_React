import React, { createContext, useState, useEffect } from 'react';
import { login as authServiceLogin } from '../services/authService';
import { getUserMenuPermissions } from '../services/userService';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('accessToken');
        const storedRolePermissions = localStorage.getItem('rolePermissions');
        const storedMenuPermissions = localStorage.getItem('menuPermissions');
        const storedBranch = localStorage.getItem('selectedBranch');

        if (storedToken) {
          const parsedUser = storedUser ? JSON.parse(storedUser) : {};
          const rolePermissions = storedRolePermissions ? JSON.parse(storedRolePermissions) : [];
          const menuPermissions = storedMenuPermissions ? JSON.parse(storedMenuPermissions) : [];
          
          parsedUser.permissions = [...rolePermissions, ...menuPermissions];

          setUser(parsedUser);
          setIsAuthenticated(true);
          
          if (storedBranch) {
            setSelectedBranch(JSON.parse(storedBranch));
          }
        }
      } catch (error) {
        console.error("Failed to load user from local storage", error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authServiceLogin(username, password);
      
      if (response.data?.isSuccess) {
        const { accessToken, refreshToken, user, rolePermissions, menuPermissions } = response.data.data;
        
        if (!accessToken) {
          return { success: false, message: 'Identity node failed to issue access credentials.' };
        }

        const combinedPermissions = [...(rolePermissions || []), ...(menuPermissions || [])];
        const userWithPermissions = { ...user, permissions: combinedPermissions };

        setUser(userWithPermissions);
        setIsAuthenticated(true);
        
        // Auto-set selected branch if user is tied to one
        if (user.branchID) {
          const branchObj = { branchID: user.branchID, branchName: 'Assigned Node' };
          setSelectedBranch(branchObj);
          localStorage.setItem('selectedBranch', JSON.stringify(branchObj));
        }
        
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('rolePermissions', JSON.stringify(rolePermissions || []));
        localStorage.setItem('menuPermissions', JSON.stringify(menuPermissions || []));
        
        return { success: true, data: response.data.data };
      } else {
        return { success: false, message: response.data?.message || 'Authentication failed' };
      }
    } catch (error) {
      console.error("Critical Auth Error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'An unexpected error occurred during authentication' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setSelectedBranch(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('rolePermissions');
    localStorage.removeItem('menuPermissions');
    localStorage.removeItem('selectedBranch');
  };

  const switchBranch = (branch) => {
    // Security: Don't allow switching if user is tied to a specific branch
    if (user?.branchID) {
        toast.warn("Access Restricted: You are locked to your assigned node.");
        return;
    }

    setSelectedBranch(branch);
    if (branch) {
      localStorage.setItem('selectedBranch', JSON.stringify(branch));
    } else {
      localStorage.removeItem('selectedBranch');
    }
  };

  const refreshPermissions = async () => {
    if (user && (user.userID || user.id)) {
      try {
        const userId = user.userID || user.id;
        
        // Dynamic import to avoid circular dependencies if any
        const { getUserMenuPermissions, getUserRolePermissions } = await import('../services/userService');
        
        const [menuRes, roleRes] = await Promise.all([
           getUserMenuPermissions(userId).catch(() => ({ data: { isSuccess: false } })),
           getUserRolePermissions(userId).catch(() => ({ data: { isSuccess: false } }))
        ]);
        
        let newMenuPermissions = [];
        let newRolePermissions = [];

        if (menuRes.data?.isSuccess) {
          newMenuPermissions = menuRes.data.data || [];
          localStorage.setItem('menuPermissions', JSON.stringify(newMenuPermissions));
        }

        if (roleRes.data?.isSuccess) {
          newRolePermissions = roleRes.data.data || [];
          localStorage.setItem('rolePermissions', JSON.stringify(newRolePermissions));
        }
          
        setUser(prev => {
          if (!prev) return prev;
          const updatedUser = { ...prev };
          
          const finalRolePerms = roleRes.data?.isSuccess ? newRolePermissions : JSON.parse(localStorage.getItem('rolePermissions') || '[]');
          const finalMenuPerms = menuRes.data?.isSuccess ? newMenuPermissions : JSON.parse(localStorage.getItem('menuPermissions') || '[]');
          
          updatedUser.permissions = [...finalRolePerms, ...finalMenuPerms];
          return updatedUser;
        });
        
        window.dispatchEvent(new Event('permissionsUpdated'));
      } catch (err) {
        console.error('Failed to refresh permissions', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, loading, login, logout, selectedBranch, switchBranch, refreshPermissions }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
