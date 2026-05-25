import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { getAllCategories, deleteCategory, toggleCategoryStatus, exportCategories, importCategories } from '../../services/categoryService';
import CategoryAdd from './CategoryAdd';
import { toast } from 'react-toastify';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import { hasPermission } from '../../utils/permissionUtils';
import CustomConfirmAlert from '../../components/CustomConfirmAlert';
import { 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaTags,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaLayerGroup,
  FaFileExport,
  FaFileImport
} from 'react-icons/fa';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50); 
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('CategoryName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({
    status: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const canCreate = hasPermission('CATEGORY_CREATE');
  const canUpdate = hasPermission('CATEGORY_UPDATE');
  const canDelete = hasPermission('CATEGORY_DELETE');
  const canImport = hasPermission('CATEGORY_IMPORT');
  const canExport = hasPermission('CATEGORY_EXPORT');

  const fetchCategories = useCallback(async () => {
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
      const response = await getAllCategories(params);
      if (response.data && response.data.isSuccess) {
        const rawData = response.data.data || {};
        setCategories(rawData.items || []);
        const total = rawData.totalRecords || rawData.TotalRecords || rawData.totalCount || rawData.TotalCount || (rawData.items?.length || 0);
        setTotalCategories(total);
      } else {
        toast.error('Failed to update category registry.');
        setCategories([]);
        setTotalCategories(0);
      }
    } catch (error) {
      toast.error('Critical failure: Category server unreachable.');
      setCategories([]);
      setTotalCategories(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection, filters.status]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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

  const handleExport = async () => {
    try {
      toast.info('Exporting categories...');
      await exportCategories();
      toast.success('Categories exported successfully.');
    } catch (error) {
      toast.error('Failed to export categories.');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      toast.info('Importing categories...');
      const response = await importCategories(file);
      if (response.data.isSuccess) {
        toast.success(response.data.message || 'Import successful.');
        fetchCategories();
      } else {
        toast.error(response.data.message || 'Import failed.');
      }
    } catch (error) {
      toast.error('Critical failure during import process.');
    } finally {
      e.target.value = null; // Clear input
    }
  };

  const handleToggleStatus = async (category) => {
    if (!canUpdate) return;
    try {
      const response = await toggleCategoryStatus(category.categoryID, !category.status);
      if (response.data.isSuccess) {
        toast.success(`Category '${category.categoryName}' status synchronized.`);
        fetchCategories();
      }
    } catch (error) {
      toast.error('Status Update failed.');
    }
  };

  const handleDelete = (id) => {
    if (!canDelete) return;
    
    toast(({ closeToast }) => (
      <div className="p-1 text-left">
        <p className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-tighter">Purge this category permanently?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const response = await deleteCategory(id);
                if (response.data.isSuccess) {
                  toast.success('Category purged from registry.');
                  fetchCategories();
                } else {
                  toast.error(response.data.message || 'Deletion protocol rejected.');
                }
              } catch (err) {
                toast.error('Cannot delete: Active product dependencies detected.');
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
              <FaTags className="text-white" />
            </div>
            Category Architect
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic text-left">Organize product hierarchy and classification nodes</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {canExport && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-6 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black shadow-sm hover:bg-slate-50 transition-all active:scale-95 uppercase text-[10px] tracking-widest"
              title="Export to CSV"
            >
              <FaFileExport /> Export
            </button>
          )}
          
          {canImport && (
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
                id="import-csv"
              />
              <label
                htmlFor="import-csv"
                className="flex items-center gap-2 px-6 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black shadow-sm hover:bg-slate-50 transition-all active:scale-95 uppercase text-[10px] tracking-widest cursor-pointer"
                title="Import from CSV"
              >
                <FaFileImport /> Import
              </label>
            </div>
          )}

          {canCreate && (
            <button
              onClick={() => { setSelectedCategory(null); setIsEditModalOpen(true); }}
              className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg shadow-slate-500/20 hover:bg-black hover:-translate-y-1 transition-all active:scale-95 uppercase text-xs tracking-widest"
            >
              <FaPlus /> New Category
            </button>
          )}
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative group flex-1 w-full text-left">
          <input
            type="text"
            placeholder="Search catalog by category name..."
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm group-hover:shadow-md font-bold text-slate-700"
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
            {totalCategories} Records
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer" onClick={() => handleSort('CategoryName')}>Classification Detail</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Operational</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-bold">
              {isLoading ? (
                <tr><td colSpan="3" className="py-20 text-center"><div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div><p className="mt-4 text-xs font-black text-gray-300 uppercase tracking-widest animate-pulse">Syncing Hub...</p></td></tr>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.categoryID} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-inner border-2 border-white ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all ${category.status ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                            <FaLayerGroup />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${category.status ? 'bg-green-500' : 'bg-red-400'}`}></div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 text-sm tracking-tight uppercase">{category.categoryName}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ref: #{category.categoryID}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => handleToggleStatus(category)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm ${
                          category.status ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                        }`}
                      >
                        {category.status ? <><FaCheckCircle /> Online</> : <><FaTimesCircle /> Offline</>}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        {canUpdate && (
                          <button onClick={() => { setSelectedCategory(category); setIsEditModalOpen(true); }} className="p-3 bg-white border border-gray-100 rounded-xl text-blue-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm" title="Modify"><FaEdit /></button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDelete(category.categoryID)} className="p-3 bg-white border border-gray-100 rounded-xl text-red-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm" title="Purge"><FaTrashAlt /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-6 text-slate-200">
                      <FaTags size={80} />
                      <p className="text-2xl font-black uppercase tracking-[0.2em] text-slate-300">Registry Empty</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic max-w-xs leading-relaxed text-center">No classifications were identified in the primary category registry.</p>
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
          count={totalCategories}
          page={currentPage}
          rowsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* MODAL SYSTEM */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in text-left">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in border border-white/20">
            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200">
                  <FaTags className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">
                    {selectedCategory ? 'Update Class' : 'Initialize Class'}
                  </h3>
                  <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">
                    {selectedCategory ? `Reference: #${selectedCategory.categoryID}` : 'Global Category Registry'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-xl text-gray-300 hover:text-red-500 transition-all hover:rotate-90"><FaTimesCircle size={28}/></button>
            </div>
            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar bg-white">
              <CategoryAdd 
                isEdit={!!selectedCategory} 
                categoryData={selectedCategory} 
                onClose={() => setIsEditModalOpen(false)} 
                onSave={() => { fetchCategories(); setIsEditModalOpen(false); }}
                showTitle={false}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}