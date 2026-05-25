import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import PermissionAdd from './PermissionAdd';
import { toast } from 'react-toastify';
import { getAllPermissions, deletePermission } from '../../services/permissionService.js';
import { hasPermission } from '../../utils/permissionUtils';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import { 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaShieldAlt,
  FaFilter,
  FaKey,
  FaFingerprint,
  FaCubes,
  FaTimesCircle
} from 'react-icons/fa';

export default function PermissionList() {
  const [permissions, setPermissions] = useState([]);
  const [totalPermissions, setTotalPermissions] = useState(0);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50); // Showing "all" rows by default
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('PermissionName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isLoading, setIsLoading] = useState(false);

  const canCreatePermission = hasPermission('PERMISSION_CREATE');
  const canUpdatePermission = hasPermission('PERMISSION_UPDATE');
  const canDeletePermission = hasPermission('PERMISSION_DELETE');

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchQuery: searchTerm,
        sortColumn: sortField,
        sortDirection: sortDirection,
      };
      const response = await getAllPermissions(params);
      if (response.data && response.data.isSuccess) {
        const rawData = response.data.data || {};
        setPermissions(rawData.items || []);
        const total = rawData.totalRecords || rawData.TotalRecords || rawData.totalCount || rawData.TotalCount || (rawData.items?.length || 0);
        setTotalPermissions(total);
      } else {
        toast.error('Failed to synchronize permission registry.');
        setPermissions([]);
        setTotalPermissions(0);
      }
    } catch (error) {
      toast.error('Critical failure: Permission registry unreachable.');
      setPermissions([]);
      setTotalPermissions(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const debouncedSearch = useCallback(debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300), []);

  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
  };

  const handleSort = (field) => {
    if (isLoading) return;
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (permission) => {
    if (!canUpdatePermission) return;
    setSelectedPermission(permission);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    if (!canDeletePermission) return;
    
    toast(({ closeToast }) => (
      <div className="p-1">
        <p className="text-sm font-bold text-gray-800 mb-3">Purge this security permission permanently?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const response = await deletePermission(id);
                if (response.data && response.data.isSuccess) {
                  toast.success('Security permission purged successfully');
                  fetchPermissions();
                } else {
                  toast.error(response.data?.message || 'Purge rejected by system');
                }
              } catch (err) {
                toast.error('Cannot purge permission: Active dependencies found');
              }
              closeToast();
            }}
            className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-colors"
          >
            Confirm
          </button>
          <button
            onClick={closeToast}
            className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { autoClose: false, closeOnClick: false });
  };

  return (
    <div className="container mx-auto p-6 animate-fade-in max-w-7xl">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <FaShieldAlt className="text-blue-600" />
            Permission List
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic">Manage system access and security settings</p>
        </div>
        
        {canCreatePermission && (
          <button
            onClick={() => { setSelectedPermission(null); setIsEditModalOpen(true); }}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95"
          >
            <FaPlus /> Add Permission
          </button>
        )}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative group flex-1">
          <input
            type="text"
            placeholder="Search permissions..."
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm group-hover:shadow-md font-bold text-gray-700"
            onChange={handleSearchChange}
          />
          <FaSearch className="absolute top-5 left-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer" onClick={() => handleSort('PermissionName')}>Permission Name</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer" onClick={() => handleSort('PermissionKey')}>Permission Key</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan="4" className="py-20 text-center"><div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div><p className="mt-4 text-xs font-black text-gray-300 uppercase tracking-widest animate-pulse">Syncing Registry...</p></td></tr>
              ) : permissions.length > 0 ? (
                permissions.map((permission) => (
                  <tr key={permission.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black shadow-inner border-2 border-white ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all">
                            <FaKey />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-gray-800 text-sm tracking-tight">{permission.permissionName}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Module: {permission.moduleName || 'GLOBAL'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="px-3 py-1 bg-gray-50 text-gray-600 border border-gray-100 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit">
                          {permission.permissionKey}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-600 flex items-center gap-2"><FaFingerprint className="text-gray-300" /> {permission.controllerName}</span>
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-2"><FaCubes className="text-gray-300" /> {permission.actionName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        {canUpdatePermission && (
                          <button onClick={() => handleEdit(permission)} className="p-3 bg-white border border-gray-100 rounded-xl text-blue-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm"><FaEdit /></button>
                        )}
                        {canDeletePermission && (
                          <button onClick={() => handleDelete(permission.id)} className="p-3 bg-white border border-gray-100 rounded-xl text-red-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm"><FaTrashAlt /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-300">
                      <FaShieldAlt size={60} />
                      <p className="text-xl font-black uppercase tracking-widest text-gray-300">No Permissions Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION SECTION */}
      <div className="mt-8">
        <ProfessionalPagination
          count={totalPermissions}
          page={currentPage}
          rowsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* MODAL SYSTEM */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <FaShieldAlt className="text-blue-600" />
                  {selectedPermission ? 'Edit Permission' : 'Add Permission'}
                </h3>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                  {selectedPermission ? `Key: ${selectedPermission.permissionKey}` : 'Permission Management'}
                </p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-xl text-gray-300 hover:text-red-500 transition-all hover:rotate-90"><FaTimesCircle size={28}/></button>
            </div>
            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
              <PermissionAdd 
                isEdit={!!selectedPermission} 
                permissionData={selectedPermission} 
                onSave={() => { fetchPermissions(); setIsEditModalOpen(false); }}
                onClose={() => setIsEditModalOpen(false)}
                showTitle={false}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
