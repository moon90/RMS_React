import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { getAllUnits, deleteUnit, toggleUnitStatus } from '../../services/unitService';
import UnitAdd from './UnitAdd';
import { toast } from 'react-toastify';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import { hasPermission } from '../../utils/permissionUtils';
import { 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaWeightHanging,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaBalanceScale
} from 'react-icons/fa';

export default function UnitList() {
  const [units, setUnits] = useState([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50); // Showing "all" rows by default
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('Name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({
    status: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const canCreate = hasPermission('UNIT_CREATE');
  const canUpdate = hasPermission('UNIT_UPDATE');
  const canDelete = hasPermission('UNIT_DELETE');

  const fetchUnits = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchQuery: searchTerm,
        sortColumn: sortField,
        sortDirection: sortDirection,
        status: filters.status === 'active' ? true : filters.status === 'inactive' ? false : null,
      };
      const response = await getAllUnits(params);
      if (response.data && response.data.isSuccess) {
        const rawData = response.data.data || {};
        setUnits(rawData.items || []);
        const total = rawData.totalRecords || rawData.TotalRecords || rawData.totalCount || rawData.TotalCount || (rawData.items?.length || 0);
        setTotalUnits(total);
      } else {
        toast.error('Failed to load units.');
        setUnits([]);
        setTotalUnits(0);
      }
    } catch (error) {
      toast.error('Failed to reach unit server.');
      setUnits([]);
      setTotalUnits(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection, filters.status]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const debouncedSearch = useCallback(debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300), []);

  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
  };

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
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

  const handleToggleStatus = async (unit) => {
    if (!canUpdate) return;
    try {
      const response = await toggleUnitStatus(unit.id, !unit.status);
      if (response.data.isSuccess) {
        toast.success(`Unit configuration synchronized.`);
        fetchUnits();
      }
    } catch (error) {
      toast.error('Status Update failed.');
    }
  };

  const handleDelete = (id) => {
    if (!canDelete) return;
    
    toast(({ closeToast }) => (
      <div className="p-1 text-left">
        <p className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-tighter">Purge this unit permanently?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const response = await deleteUnit(id);
                if (response.data.isSuccess) {
                  toast.success('Measurement unit purged.');
                  fetchUnits();
                } else {
                  toast.error(response.data.message || 'Purge rejected.');
                }
              } catch (err) {
                toast.error('Cannot delete: Active material dependencies detected.');
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
              <FaBalanceScale className="text-white" />
            </div>
            Metrics Engine
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic text-left">Standardize measurement units across global inventory nodes</p>
        </div>
        
        {canCreate && (
          <button
            onClick={() => { setSelectedUnit(null); setIsEditModalOpen(true); }}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg shadow-slate-500/20 hover:bg-black hover:-translate-y-1 transition-all active:scale-95 uppercase text-xs tracking-widest"
          >
            <FaPlus /> New Metric
          </button>
        )}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative group flex-1 w-full text-left">
          <input
            type="text"
            placeholder="Search metrics by name or code..."
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm group-hover:shadow-md font-bold text-gray-700"
            onChange={handleSearchChange}
          />
          <FaSearch className="absolute top-5 left-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <FaFilter className="absolute left-4 top-5 text-gray-400 pointer-events-none" />
            <select 
              name="status" 
              className="w-full pl-10 pr-10 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-black text-[10px] uppercase tracking-widest text-slate-600 cursor-pointer shadow-sm hover:shadow-md transition-all appearance-none min-w-[160px]"
              onChange={handleFilter}
              value={filters.status}
            >
              <option value="">System Status</option>
              <option value="active" className="text-gray-900 bg-white">Active Only</option>
              <option value="inactive" className="text-gray-900 bg-white">Archived</option>
            </select>
          </div>
          <div className="hidden md:flex items-center px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400">
            {totalUnits} Records
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer" onClick={() => handleSort('Name')}>Metric Identity</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Symbol</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Operational</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-bold">
              {isLoading ? (
                <tr><td colSpan="4" className="py-24 text-center"><div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div><p className="mt-4 text-xs font-black text-gray-300 uppercase tracking-widest animate-pulse">Syncing Engine...</p></td></tr>
              ) : units.length > 0 ? (
                units.map((unit) => (
                  <tr key={unit.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-inner border-2 border-white ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all ${unit.status ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                            <FaBalanceScale />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${unit.status ? 'bg-green-500' : 'bg-red-400'}`}></div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 text-sm tracking-tight uppercase">{unit.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ref: #{unit.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-left">
                      <span className="px-4 py-1.5 bg-slate-50 text-slate-600 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest w-fit">
                        {unit.shortCode}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => handleToggleStatus(unit)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm ${
                          unit.status ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                        }`}
                      >
                        {unit.status ? <><FaCheckCircle /> Online</> : <><FaTimesCircle /> Offline</>}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        {canUpdate && (
                          <button onClick={() => { setSelectedUnit(unit); setIsEditModalOpen(true); }} className="p-3 bg-white border border-slate-100 rounded-xl text-blue-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm" title="Modify"><FaEdit /></button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDelete(unit.id)} className="p-3 bg-white border border-slate-100 rounded-xl text-red-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm" title="Purge"><FaTrashAlt /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-6 text-slate-200">
                      <FaWeightHanging size={80} />
                      <p className="text-2xl font-black uppercase tracking-[0.2em] text-slate-300">Registry Empty</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic max-w-xs leading-relaxed text-center">No measurement metrics were identified in the primary registry.</p>
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
          count={totalUnits}
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
                  <FaWeightHanging className="text-blue-600" />
                  {selectedUnit ? 'Edit Unit' : 'Add Unit'}
                </h3>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                  {selectedUnit ? `ID: ${selectedUnit.id}` : 'Unit Management'}
                </p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-xl text-gray-300 hover:text-red-500 transition-all hover:rotate-90"><FaTimesCircle size={28}/></button>
            </div>
            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
              <UnitAdd 
                isEdit={!!selectedUnit} 
                unitData={selectedUnit} 
                onClose={() => setIsEditModalOpen(false)} 
                onSave={() => { fetchUnits(); setIsEditModalOpen(false); }}
                showTitle={false}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
