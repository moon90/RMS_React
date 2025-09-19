export const hasPermission = (permissionKey) => {
  try {
    const rolePermissions = JSON.parse(localStorage.getItem('rolePermissions') || '[]');
    return rolePermissions.includes(permissionKey);
  } catch (e) {
    console.error("Error parsing role permissions from localStorage", e);
    return false;
  }
};

export const hasMenuPermission = (menuName) => {
  // Temporarily return true to make all menus visible
  return true;
};