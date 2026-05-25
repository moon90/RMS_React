import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { toast } from 'react-toastify';
import { fetchUsers, fetchRoles, assignRolesToUser, unassignRolesFromUser } from '../../services/userRoleManagementService';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import UserRoleModal from '../../components/UserRoleModal';
import { FaUserTag, FaSearch, FaUserCircle, FaEnvelope, FaShieldAlt, FaEdit, FaFingerprint } from 'react-icons/fa';

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
            setUsers(usersResponse.data.data.items || []);
            setTotalUsers(usersResponse.data.data.totalRecords || 0);
        } catch (err) {
            setError('Failed to load user data.');
            toast.error('Failed to load user data.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection]);

    const fetchAllRolesData = useCallback(async () => {
        try {
            const rolesResponse = await fetchRoles(1, 1000);
            setAllRoles(rolesResponse.data.data.items || []);
        } catch (err) {
            toast.error('Failed to load available roles.');
        }
    }, []);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    useEffect(() => {
        fetchAllRolesData();
    }, [fetchAllRolesData]);

    const debouncedSearch = useCallback(
        debounce((value) => {
            setSearchTerm(value);
            setCurrentPage(1);
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
        setCurrentPage(1);
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
            if (assignedRoleIds.length > 0) {
                await assignRolesToUser(updatedUser.userID, assignedRoleIds);
            }
            if (unassignedRoleIds.length > 0) {
                await unassignRolesFromUser(updatedUser.userID, unassignedRoleIds);
            }
            toast.success('Access privileges synchronized!');
            fetchUserData();
        } catch (err) {
            toast.error('Failed to update access roles.');
        } finally {
            handleCloseModal();
        }
    };

    return (
        <div className="container mx-auto p-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <FaUserTag className="text-indigo-600" />
                        User Access Roles
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">Map system roles and security profiles to staff members</p>
                </div>
            </div>

            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative group flex-1 w-full">
                    <input
                        type="text"
                        placeholder="Search by username, full name or email..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm group-hover:shadow-md"
                        onChange={handleSearchChange}
                        disabled={loading}
                    />
                    <FaSearch className="absolute top-4 left-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Identiy</th>
                                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer" onClick={() => handleSort('FullName')}>Personal Details</th>
                                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Contact</th>
                                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Active Roles</th>
                                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="py-20 text-center"><div className="w-10 h-10 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin mx-auto"></div></td></tr>
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.userID} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <FaFingerprint className="text-xs" />
                                                <span className="font-mono text-[10px] font-bold">UID-{user.userID}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                                                    <FaUserCircle size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 leading-none mb-1">{user.fullName}</p>
                                                    <p className="text-xs text-gray-400 font-medium italic">@{user.userName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                <FaEnvelope className="text-gray-300" />
                                                <span>{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles && user.roles.length > 0 ? (
                                                    user.roles.map((role, rIdx) => (
                                                        <span key={rIdx} className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                                                            {role}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-300 italic">No roles assigned</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button 
                                                onClick={() => handleEditRoles(user)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-indigo-600 font-bold text-xs hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm hover:shadow-indigo-200"
                                            >
                                                <FaShieldAlt /> Configure Access
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="py-20 text-center text-gray-400 font-bold">No security profiles found matching your search.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-6 bg-gray-50/30 border-t border-gray-100">
                    <ProfessionalPagination
                        count={totalUsers}
                        page={currentPage}
                        rowsPerPage={itemsPerPage}
                        onPageChange={(p) => setCurrentPage(p)}
                        onRowsPerPageChange={(r) => { setItemsPerPage(r); setCurrentPage(1); }}
                    />
                </div>
            </div>

            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl animate-scale-in">
                        <UserRoleModal
                            user={selectedUser}
                            allRoles={allRoles}
                            onClose={handleCloseModal}
                            onRolesUpdated={handleRolesUpdated}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserAccessRole;
