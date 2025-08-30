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
  try {
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions') || '[]');
    const menu = menuPermissions.find(m => m.menuName === menuName);
    return menu ? menu.canView : false;
  } catch (e) {
    console.error("Error parsing menu permissions from localStorage", e);
    return false;
  }
};