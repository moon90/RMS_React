import api from '../utils/axios';

// User-related API calls
export const fetchUsers = async (pageNumber = 1, pageSize = 10, searchQuery = '', sortColumn = 'userName', sortDirection = 'asc') => {
    return await api.get(`/Users`, {
        params: { pageNumber, pageSize, searchQuery, sortColumn, sortDirection }
    });
};

export const assignRolesToUser = async (userId, roleIds) => {
    return await api.post(`/Users/${userId}/assign-roles`, roleIds);
};

export const unassignRolesFromUser = async (userId, roleIds) => {
    return await api.post(`/Users/${userId}/unassign-roles`, roleIds);
};

// Role-related API calls
export const fetchRoles = async (pageNumber = 1, pageSize = 1000, searchQuery = '', sortColumn = 'RoleName', sortDirection = 'asc') => {
    return await api.get(`/Roles`, {
        params: { pageNumber, pageSize, searchQuery, sortColumn, sortDirection }
    });
};

export const getAllRoles = async (params) => {
    return await api.get('/Roles', { params });
};

export const createRole = async (roleData) => {
    return await api.post('/Roles', roleData);
};

export const updateRole = async (roleId, roleData) => {
    return await api.put(`/Roles/${roleId}`, roleData);
};

export const deleteRole = async (roleId) => {
    return await api.delete(`/Roles/${roleId}`);
};

export const toggleRoleStatus = async (id, newStatus) => {
    return await api.put(`/Roles/${id}/status`, { status: newStatus });
};

// Permission Mapping Calls
export const fetchAllPermissions = async () => {
    return await api.get('/Permission', { params: { pageSize: 1000 } });
};

export const getRolePermissions = async (roleId) => {
    return await api.get(`/Roles/${roleId}/permissions`);
};

export const assignPermissionsToRole = async (roleId, permissionIds) => {
    return await api.post(`/Roles/${roleId}/assign-permissions`, permissionIds);
};

export const unassignPermissionsFromRole = async (roleId, permissionIds) => {
    return await api.post(`/Roles/${roleId}/unassign-permissions`, permissionIds);
};
