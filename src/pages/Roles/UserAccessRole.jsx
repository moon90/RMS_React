import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { toast } from 'react-toastify';
import { fetchUsers, fetchRoles, assignRolesToUser, unassignRolesFromUser } from '../../services/userRoleManagementService';
import UserRoleModal from '../../components/UserRoleModal';

const UserAccessRole = () => {
    const [users, setUsers] = useState([]);
    const [allRoles, setAllRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination and Search states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('UserName');
    const [sortDirection, setSortDirection] = useState('asc');
    const [totalUsers, setTotalUsers] = useState(0);

    const fetchUserData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const usersResponse = await fetchUsers(currentPage, itemsPerPage, searchTerm, sortField, sortDirection);
            console.log('Fetched users:', usersResponse); // Debug log
            setUsers(usersResponse.data.data.items || []);
            setTotalUsers(usersResponse.data.data.totalRecords || 0);
        } catch (err) {
            setError('Failed to load user data. Please check your network and permissions.');
            console.error('Error fetching users:', err);
            toast.error('Failed to load user data.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection]);

    const fetchAllRoles = useCallback(async () => {
        try {
            const rolesResponse = await fetchRoles(1, 1000); // Fetch all roles for the modal
            console.log('Fetched roles:', rolesResponse); // Debug log
            setAllRoles(rolesResponse.data.data.items || []);
        } catch (err) {
            console.error('Error fetching all roles:', err);
            toast.error('Failed to load available roles.');
        }
    }, []);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    useEffect(() => {
        fetchAllRoles();
    }, [fetchAllRoles]);

    const debouncedSearch = useCallback(
        debounce((value) => {
            setSearchTerm(value);
            setCurrentPage(1); // Reset to first page on new search
        }, 300),
        []
    );

    const handleSearchChange = (e) => {
        debouncedSearch(e.target.value);
    };

    const handleSort = (field) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1); // Reset to first page on new sort
    };

    const handleEditRoles = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleRolesUpdated = async (updatedUser, assignedRoleIds, unassignedRoleIds) => {
        try {
            // Call API to assign roles
            if (assignedRoleIds.length > 0) {
                await assignRolesToUser(updatedUser.userID, assignedRoleIds);
            }
            // Call API to unassign roles
            if (unassignedRoleIds.length > 0) {
                await unassignRolesFromUser(updatedUser.userID, unassignedRoleIds);
            }
            toast.success('User roles updated successfully!');
            fetchUserData(); // Refresh user list after update
        } catch (err) {
            toast.error('Failed to update user roles.');
            console.error('Error updating roles:', err);
        } finally {
            handleCloseModal();
        }
    };

    const totalPages = Math.ceil(totalUsers / itemsPerPage);

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold mb-6">User Access Roles</h1>

            {/* Search and Pagination Controls */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onChange={handleSearchChange}
                        disabled={loading}
                    />
                    <svg className="w-5 h-5 absolute left-2 top-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <label className="text-sm text-gray-700">Items per page:</label>
                    <select
                        className="p-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        disabled={loading}
                    >
                        {[5, 10, 25, 50].map(number => (
                            <option key={number} value={number}>{number}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* User Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">#</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('Id')}>
                                <div className="flex items-center">User ID {sortField === 'Id' && (sortDirection === 'asc' ? '▲' : '▼')}</div>
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('UserName')}>
                                <div className="flex items-center">Username {sortField === 'UserName' && (sortDirection === 'asc' ? '▲' : '▼')}</div>
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('FullName')}>
                                <div className="flex items-center">Full Name {sortField === 'FullName' && (sortDirection === 'asc' ? '▲' : '▼')}</div>
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('Email')}>
                                <div className="flex items-center">Email {sortField === 'Email' && (sortDirection === 'asc' ? '▲' : '▼')}</div>
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Roles</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4">Loading users...</td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-red-500">{error}</td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4">No users found.</td>
                            </tr>
                        ) : (
                            users.map((user, index) => (
                                <tr key={user.userID} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4 text-sm text-gray-700">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="px-4 py-4 text-sm text-gray-700">{user.userID}</td>
                                    <td className="px-4 py-4 text-sm text-gray-700">{user.userName}</td>
                                    <td className="px-4 py-4 text-sm text-gray-700">{user.fullName}</td>
                                    <td className="px-4 py-4 text-sm text-gray-700">{user.email}</td>
                                    <td className="px-4 py-4 text-sm text-gray-700">{user.roles.join(', ')}</td>
                                    <td className="px-4 py-4 text-sm text-gray-700">
                                        <button
                                            onClick={() => handleEditRoles(user)}
                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                        >
                                            Edit Roles
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0 text-sm text-gray-700">
                    Showing <span className="font-medium">{totalUsers === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalUsers)}</span> of{' '}
                    <span className="font-medium">{totalUsers}</span> entries
                </div>
                <div className="flex items-center">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1 || loading}
                        className="px-3 py-1 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <div className="mx-2 flex items-center">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`mx-1 px-3 py-1 text-sm rounded-md ${
                                    currentPage === i + 1
                                        ? 'bg-blue-500 text-white'
                                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                                }`}
                                disabled={loading}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || loading}
                        className="px-3 py-1 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>

            {isModalOpen && selectedUser && (
                <UserRoleModal
                    user={selectedUser}
                    allRoles={allRoles}
                    onClose={handleCloseModal}
                    onRolesUpdated={handleRolesUpdated}
                />
            )}
        </div>
    );
};

export default UserAccessRole;
