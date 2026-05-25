export const hasPermission = (permissionKey) => {
  try {
    const rolePermissions = JSON.parse(localStorage.getItem('rolePermissions') || '[]');
    return rolePermissions.includes(permissionKey);
  } catch (e) {
    console.error("Error parsing role permissions from localStorage", e);
    return false;
  }
};

export const hasMenuPermission = (menuPath) => {
  try {
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions') || '[]');
    // Check if the user has this menu assigned with canView privilege
    return menuPermissions.some(m => 
      (m.menuPath === menuPath || (m.menuPath && menuPath && m.menuPath.toLowerCase() === menuPath.toLowerCase())) 
      && m.canView
    );
  } catch (e) {
    console.error("Error parsing menu permissions from localStorage", e);
    return false;
  }
};