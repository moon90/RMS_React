import api from '../utils/axios';

const menuService = {
  createMenu: (menuData) => {
    return api.post('/Menus', menuData);
  },

  updateMenu: (menuId, menuData) => {
    return api.put(`/Menus/${menuId}`, menuData);
  },

  getAllMenus: (params) => {
    return api.get('/Menus', { params });
  },

  getMenuById: (menuId) => {
    return api.get(`/Menus/${menuId}`);
  },

  deleteMenu: (menuId) => {
    return api.delete(`/Menus/${menuId}`);
  },

  assignMenuToRole: (roleId, menuId, roleMenuData) => {
    return api.post(`/Menus/${roleId}/menus/${menuId}`, roleMenuData);
  },

  unassignMenuFromRole: (roleId, menuId) => {
    return api.delete(`/Menus/unassign-from-role?roleId=${roleId}&menuId=${menuId}`);
  },

  assignMenusToRoleBulk: (roleId, menuIds) => {
    // Standardize to PascalCase for backend DTO compatibility
    return api.post(`/Menus/${roleId}/assign-menus`, {
      RoleId: Number(roleId),
      MenuIds: menuIds.map(id => Number(id)),
      CanView: true, // Default to true so they appear in the matrix
      CanAdd: false,
      CanEdit: false,
      CanDelete: false
    });
  },

  unassignMenusFromRoleBulk: (roleId, menuIds) => {
    return api.post(`/Menus/${roleId}/unassign-menus`, {
      RoleId: Number(roleId),
      MenuIds: menuIds.map(id => Number(id))
    });
  },

  getRoleMenus: (roleId) => {
    return api.get(`/Menus/role/${roleId}`);
  }
};

export default menuService;