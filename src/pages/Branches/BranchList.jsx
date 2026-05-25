import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import branchService from '../../services/branchService';
import { toast } from 'react-toastify';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import { hasPermission } from '../../utils/permissionUtils';
import { 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaCheckCircle
} from 'react-icons/fa';

export default function BranchList() {
  const [branches, setBranches] = useState([]);
  const [totalBranches, setTotalBranches] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const canView = hasPermission('BRANCH_VIEW');
  const canManage = hasPermission('ROLE_CREATE'); 

  const fetchBranches = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await branchService.getAllBranches();
      if (response.data && response.data.isSuccess) {
        const data = response.data.data || [];
        const filtered = data.filter(b => 
            b.branchName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (b.branchCode && b.branchCode.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setBranches(filtered);
        setTotalBranches(filtered.length);
      } else {
        toast.error('Failed to synchronize branch network.');
      }
    } catch (error) {
      toast.error('Critical failure: Branch service unreachable.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const debouncedSearch = useCallback(debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300), []);

  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
  };

  const handleDelete = (id) => {
    if (!canManage) return;
    
    toast(({ closeToast }) => (
      <div className="p-1 text-left">
        <p className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-tighter">Purge this branch node permanently?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const response = await branchService.deleteBranch(id);
                if (response.data.isSuccess) {
                  toast.success('Branch purged from network.');
                  fetchBranches();
                } else {
                  toast.error(response.data.message || 'Purge rejected by system.');
                }
              } catch (err) {
                toast.error('Cannot purge: Active system dependencies detected.');
              }
              closeToast();
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95"
          >
            Confirm
          </button>
          <button
            onClick={closeToast}
            className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { autoClose: false, closeOnClick: false, position: "top-right" });
  };

  return (
    <div className="container mx-auto p-6 animate-fade-in max-w-7xl text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 text-left">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tighter text-left">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200">
              <FaBuilding className="text-white" />
            </div>
            Network Topology
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic text-left">Manage and monitor global restaurant nodes and terminal connectivity</p>
        </div>
        
        {canManage && (
          <button
            onClick={() => navigate('/branches/add')}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg shadow-slate-500/20 hover:bg-black hover:-translate-y-1 transition-all active:scale-95 uppercase text-xs tracking-widest"
          >
            <FaPlus /> Initialize Node
          </button>
        )}
      </div>

      {/* SEARCH BAR */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative group flex-1 w-full text-left">
          <input
            type="text"
            placeholder="Search network registry by name or branch code..."
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm group-hover:shadow-md font-bold text-gray-700"
            onChange={handleSearchChange}
          />
          <FaSearch className="absolute top-5 left-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
        </div>
        <div className="px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400">
            {totalBranches} Active Nodes
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-50 overflow-hidden text-left">
        <div className="overflow-x-auto text-left">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Location Detail</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Connectivity</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Sync Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-bold">
              {isLoading ? (
                <tr><td colSpan="4" className="py-24 text-center"><div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div><p className="mt-4 text-xs font-black text-gray-300 uppercase tracking-widest animate-pulse">Syncing Network...</p></td></tr>
              ) : branches.length > 0 ? (
                branches.map((branch) => (
                  <tr key={branch.branchID} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-8 py-6 text-left">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-inner border-2 border-white ring-4 transition-all ${branch.isMainBranch ? 'bg-blue-600 text-white ring-blue-50' : 'bg-slate-100 text-slate-500 ring-gray-50'}`}>
                          <span className="text-xs uppercase">{branch.branchCode || 'BR'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 text-sm tracking-tight uppercase flex items-center gap-2">
                            {branch.branchName}
                            {branch.isMainBranch && <FaCheckCircle className="text-blue-500 text-xs shadow-sm" />}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-widest">
                            <FaMapMarkerAlt size={8} className="text-slate-300" /> {branch.address || 'LOC: GLOBAL'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-left">
                      <div className="flex flex-col gap-1.5">
                         <div className="flex items-center gap-2 text-[11px] font-black text-slate-600 uppercase tracking-tight">
                            <FaPhone className="text-blue-300" size={10} />
                            {branch.phone || 'NO_PHONE'}
                         </div>
                         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 lowercase italic">
                            <FaEnvelope className="text-gray-200" size={10} />
                            {branch.email || 'no-email@registry.com'}
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-left">
                       <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${branch.isMainBranch ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${branch.isMainBranch ? 'bg-blue-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                          {branch.isMainBranch ? 'Central Authority' : 'Edge Node'}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        {canManage && (
                          <>
                            <button onClick={() => navigate(`/branches/edit/${branch.branchID}`)} className="p-3 bg-white border border-gray-100 rounded-xl text-blue-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm" title="Modify Node"><FaEdit /></button>
                            {!branch.isMainBranch && (
                              <button onClick={() => handleDelete(branch.branchID)} className="p-3 bg-white border border-gray-100 rounded-xl text-red-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm" title="Purge Node"><FaTrashAlt /></button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-6 text-slate-200">
                      <FaBuilding size={80} />
                      <p className="text-2xl font-black uppercase tracking-[0.2em] text-slate-300">Registry Empty</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic max-w-xs leading-relaxed text-center">No terminal nodes were identified in the primary network registry.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
