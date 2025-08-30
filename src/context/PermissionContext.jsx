import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

const PermissionContext = createContext();

export const usePermissions = () => useContext(PermissionContext);

export const PermissionProvider = ({ children, permissions, menus }) => {
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [initialSelectedPermissions, setInitialSelectedPermissions] = useState(new Set());
  const [openMenus, setOpenMenus] = useState({});

  const isDirty = useMemo(() => 
    !areSetsEqual(initialSelectedPermissions, selectedPermissions), 
    [initialSelectedPermissions, selectedPermissions]
  );

  const menuTree = useMemo(() => {
    const tree = [];
    const map = {};
    menus.sort((a, b) => a.displayOrder - b.displayOrder).forEach(menu => {
      map[menu.menuID] = { ...menu, children: [] };
    });
    menus.sort((a, b) => a.displayOrder - b.displayOrder).forEach(menu => {
      if (menu.parentMenuID && map[menu.parentMenuID]) {
        map[menu.parentMenuID].children.push(map[menu.menuID]);
      } else {
        tree.push(map[menu.menuID]);
      }
    });
    return tree;
  }, [menus]);

  const handlePermissionChange = useCallback((permissionId) => {
    setSelectedPermissions(prev => {
      const newPermissions = new Set(prev);
      if (newPermissions.has(permissionId)) {
        newPermissions.delete(permissionId);
      } else {
        newPermissions.add(permissionId);
      }
      return newPermissions;
    });
  }, []);

  const handleMenuCheckboxChange = useCallback((menu, isChecked) => {
    const getIds = (m) => {
      let ids = permissions.filter(p => p.moduleName === m.moduleName).map(p => p.id);
      if (m.children) {
        m.children.forEach(child => {
          ids = [...ids, ...getIds(child)];
        });
      }
      return ids;
    };
    const permissionIdsToChange = getIds(menu);
    setSelectedPermissions(prev => {
        const newPermissions = new Set(prev);
        if (isChecked) {
            permissionIdsToChange.forEach(id => newPermissions.add(id));
        } else {
            permissionIdsToChange.forEach(id => newPermissions.delete(id));
        }
        return newPermissions;
    });
  }, [permissions]);

  const toggleMenu = useCallback((menuId) => {
    setOpenMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
  }, []);

  const value = {
    permissions,
    menuTree,
    selectedPermissions,
    openMenus,
    isDirty,
    toggleMenu,
    handlePermissionChange,
    handleMenuCheckboxChange,
    setSelectedPermissions,
    setInitialSelectedPermissions
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

const areSetsEqual = (a, b) => {
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
};