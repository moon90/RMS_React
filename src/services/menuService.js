import api from '../utils/axios';

export const createMenu = (menuData) => {
  return api.post('/Menus', menuData);
};

export const updateMenu = (menuId, menuData) => {
  return api.put(`/Menus/${menuId}`, menuData);
};

export const getAllMenus = (params) => {
  return api.get('/Menus', { params });
};

export const getMenuById = (menuId) => {
  return api.get(`/Menus/${menuId}`);
};

export const deleteMenu = (menuId) => {
  return api.delete(`/Menus/${menuId}`);
};

export const assignMenuToRole = (roleId, menuId, roleMenuData) => {
  return api.post(`/Menus/${roleId}/menus/${menuId}`, roleMenuData);
};

export const unassignMenuFromRole = (roleId, menuId) => {
  return api.delete(`/Menus/unassign-from-role?roleId=${roleId}&menuId=${menuId}`);
};

export const assignMenusToRoleBulk = (roleId, menuIds) => {
  return api.post(`/Menus/${roleId}/assign-menus`, { roleId, menuIds });
};

export const unassignMenusFromRoleBulk = (roleId, menuIds) => {
  return api.post(`/Menus/${roleId}/unassign-menus`, { roleId, menuIds });
};