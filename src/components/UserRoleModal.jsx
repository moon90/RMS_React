import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const UserRoleModal = ({ user, allRoles, onClose, onRolesUpdated }) => {
    const [assignedRoleIds, setAssignedRoleIds] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const initialAssignedIds = allRoles
            .filter(role => user.roles.includes(role.roleName))
            .map(role => role.roleID);
        setAssignedRoleIds(initialAssignedIds);
    }, [user, allRoles]);

    const handleCheckboxChange = (roleId) => {
        setAssignedRoleIds(prev => {
            if (prev.includes(roleId)) {
                return prev.filter(id => id !== roleId);
            } else {
                return [...prev, roleId];
            }
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const currentRoleIds = allRoles
                .filter(role => user.roles.includes(role.roleName))
                .map(role => role.roleID);

            const rolesToAdd = assignedRoleIds.filter(id => !currentRoleIds.includes(id));
            const rolesToRemove = currentRoleIds.filter(id => !assignedRoleIds.includes(id));

            // Pass the updated user and the roles to add/remove back to the parent
            onRolesUpdated(user, rolesToAdd, rolesToRemove);

        } catch (err) {
            toast.error('Failed to prepare role update.');
            console.error('Error preparing roles:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 sm:mx-auto p-6 animate-scale-in relative">
                {/* Modal Header */}
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Manage Roles for {user.fullName}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-500 transition"
                        aria-label="Close modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Content */}
                <div className="max-h-[70vh] overflow-y-auto mb-4">
                    {allRoles.length === 0 ? (
                        <p className="text-gray-600">No roles available.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {allRoles.map(role => (
                                <div key={role.roleID} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`role-${role.roleID}`}
                                        checked={assignedRoleIds.includes(role.roleID)}
                                        onChange={() => handleCheckboxChange(role.roleID)}
                                        disabled={saving}
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor={`role-${role.roleID}`} className="ml-2 text-gray-700 cursor-pointer">
                                        {role.roleName}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserRoleModal;