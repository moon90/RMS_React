import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { getAllInventory, deleteInventory, toggleInventoryStatus } from '../../services/inventoryService';
import { getAllCategories } from '../../services/categoryService';
import { toast } from 'react-toastify';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import { hasPermission } from '../../utils/permissionUtils';
import InventoryAdd from './InventoryAdd';
import useSignalR from '../../useSignalR';
import config from '../../config';
import { 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaBoxes,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaWarehouse,
  FaCalendarAlt,
  FaChartLine
} from 'react-icons/fa';

export default function InventoryList() {
  const [inventories, setInventories] = useState([]);
  const [totalInventories, setTotalInventories] = useState(0);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50); 
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('ProductName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({
    status: '',
    categoryID: ''
  });
  const [dependencies, setDependencies] = useState({
    categories: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const { connection, isConnected } = useSignalR(config.SIGNALR_HUB_URL);

  useEffect(() => {
    if (isConnected && connection) {
      connection.on("InventoryUpdate", (data) => {
        console.log("InventoryList: Received Real-time Update:", data);
        const productId = data.productId || data.ProductId;
        const newQuantity = data.newQuantity !== undefined ? data.newQuantity : data.NewQuantity;
        
        if (productId !== undefined && newQuantity !== undefined) {
          setInventories(prev => prev.map(inv => {
            if (Number(inv.productID) === Number(productId)) {
              return { ...inv, currentStock: Number(newQuantity), lastUpdated: new Date().toISOString() };
            }
            return inv;
          }));
        }
      });

      return () => {
        connection.off("InventoryUpdate");
      };
    }
  }, [isConnected, connection]);

  const canCreate = hasPermission('INVENTORY_CREATE');
  const canUpdate = hasPermission('INVENTORY_UPDATE');
  const canDelete = hasPermission('INVENTORY_DELETE');

  const fetchDependencies = useCallback(async () => {
    try {
      const response = await getAllCategories({ pageNumber: 1, pageSize: 1000, status: true });
      if (response.data && response.data.isSuccess) {
        const items = response.data.data?.items || response.data.data || [];
        setDependencies({
          categories: items.map(c => ({
            id: c.categoryID || c.id,
            name: c.categoryName || c.name
          }))
        });
      }
    } catch (error) {
      console.error('Dependency sync failure:', error);
    }
  }, []);

  const fetchInventories = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchQuery: searchTerm,
        sortColumn: sortField,
        sortDirection: sortDirection,
        status: filters.status === 'active' ? true : filters.status === 'inactive' ? false : null,
        categoryId: filters.categoryID || null,
      };
      console.log("InventoryList: Fetching with params:", params);
      const response = await getAllInventory(params);
      console.log("InventoryList: API Response:", response.data);
      if (response.data && response.data.isSuccess) {
        const rawData = response.data.data || {};
        // Unified items extraction
        const items = rawData.items || rawData.Items || (Array.isArray(rawData) ? rawData : []);
        console.log("InventoryList: Extracted items:", items);
        setInventories(items);
        // Unified total records extraction
        const total = rawData.totalRecords || rawData.TotalRecords || rawData.totalCount || rawData.TotalCount || (rawData.items?.length || 0);
        setTotalInventories(total);
      } else {
        toast.error('Failed to load inventory.');
        setInventories([]);
        setTotalInventories(0);
      }
    } catch (error) {
      toast.error('Inventory list unreachable.');
      setInventories([]);
      setTotalInventories(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection, filters.status, filters.categoryID]);

  useEffect(() => {
    fetchDependencies();
    fetchInventories();
  }, [fetchInventories, fetchDependencies]);

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

  const renderSortIndicator = (field) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };

  const handleToggleStatus = async (inventory) => {
    if (!canUpdate) return;
    try {
      const response = await toggleInventoryStatus(inventory.inventoryID, !inventory.status);
      if (response.data.isSuccess) {
        toast.success(`Stock for '${inventory.productName}' updated.`);
        fetchInventories();
      }
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = (id) => {
    if (!canDelete) return;
    
    toast(({ closeToast }) => (
      <div className="p-1 text-left">
        <p className="text-sm font-bold text-gray-800 mb-3">Delete this stock entry?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const response = await deleteInventory(id);
                if (response.data.isSuccess) {
                  toast.success('Stock deleted');
                  fetchInventories();
                } else {
                  toast.error(response.data.message || 'Delete failed');
                }
              } catch (err) {
                toast.error('Cannot delete: Active dependencies');
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
    <div className="container mx-auto p-6 animate-fade-in max-w-7xl text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 uppercase">
            <FaWarehouse className="text-blue-600" />
            Inventory List
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic text-left">Manage product stock levels</p>
        </div>
        
        {canCreate && (
          <button
            onClick={() => { setSelectedInventory(null); setIsEditModalOpen(true); }}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 uppercase text-xs tracking-widest"
          >
            <FaPlus /> Add Stock
          </button>
        )}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center text-left">
        <div className="relative group flex-1 w-full text-left">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm group-hover:shadow-md font-bold text-gray-700 text-left"
            onChange={handleSearchChange}
          />
          <FaSearch className="absolute top-5 left-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <FaFilter className="absolute left-4 top-5 text-gray-400 pointer-events-none" />
            <select 
              name="categoryID" 
              className="w-full pl-10 pr-10 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-black text-[10px] uppercase tracking-widest text-gray-600 cursor-pointer shadow-sm hover:shadow-md transition-all appearance-none min-w-[160px]"
              onChange={handleFilter}
              value={filters.categoryID}
            >
              <option value="">Category: ALL</option>
              {dependencies.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="relative flex-1 md:flex-none">
            <FaCheckCircle className="absolute left-4 top-5 text-gray-400 pointer-events-none" />
            <select 
              name="status" 
              className="w-full pl-10 pr-10 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-black text-[10px] uppercase tracking-widest text-gray-600 cursor-pointer shadow-sm hover:shadow-md transition-all appearance-none"
              onChange={handleFilter}
              value={filters.status}
            >
              <option value="">Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors select-none" onClick={() => handleSort('ProductName')}>
                  Product{renderSortIndicator('ProductName')}
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors select-none" onClick={() => handleSort('CurrentStock')}>
                  Stock Levels{renderSortIndicator('CurrentStock')}
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors select-none" onClick={() => handleSort('LastUpdated')}>
                  Last Updated{renderSortIndicator('LastUpdated')}
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors select-none" onClick={() => handleSort('Status')}>
                  Status{renderSortIndicator('Status')}
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right select-none">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan="5" className="py-20 text-center"><div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div><p className="mt-4 text-xs font-black text-gray-300 uppercase tracking-widest animate-pulse">Loading...</p></td></tr>
              ) : inventories.length > 0 ? (
                inventories.map((inventory) => (
                  <tr key={inventory.inventoryID} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-inner border-2 border-white ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all ${inventory.status ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                            <FaBoxes />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-gray-800 text-sm tracking-tight uppercase">{inventory.productName}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {inventory.inventoryID}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                           <FaChartLine className={`${inventory.currentStock <= inventory.minStockLevel ? 'text-red-500' : 'text-blue-500'}`} />
                           <span className={`text-xs font-black ${inventory.currentStock <= inventory.minStockLevel ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
                             {inventory.currentStock} Units
                           </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Min Level: {inventory.minStockLevel} | Initial: {inventory.initialStock}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-gray-500">
                        <FaCalendarAlt className="text-gray-300" size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest tracking-tighter">Updated: {new Date(inventory.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => handleToggleStatus(inventory)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm ${
                          inventory.status ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                        }`}
                      >
                        {inventory.status ? <><FaCheckCircle /> Active</> : <><FaTimesCircle /> Inactive</>}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        {canUpdate && (
                          <button onClick={() => { setSelectedInventory(inventory); setIsEditModalOpen(true); }} className="p-3 bg-white border border-gray-100 rounded-xl text-blue-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm"><FaEdit /></button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDelete(inventory.inventoryID)} className="p-3 bg-white border border-gray-100 rounded-xl text-red-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm"><FaTrashAlt /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-300">
                      <FaWarehouse size={60} />
                      <p className="text-xl font-black uppercase tracking-widest text-gray-300">No items found</p>
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
          count={totalInventories}
          page={currentPage}
          rowsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* MODAL SYSTEM */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-left">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in text-left">
            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <FaWarehouse className="text-blue-600" />
                  {selectedInventory ? 'Edit Stock' : 'Add Stock'}
                </h3>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest text-left">
                  {selectedInventory ? `ID: ${selectedInventory.inventoryID}` : 'Stock details'}
                </p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-xl text-gray-300 hover:text-red-500 transition-all hover:rotate-90"><FaTimesCircle size={28}/></button>
            </div>
            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
              <InventoryAdd 
                isEdit={!!selectedInventory} 
                inventoryData={selectedInventory} 
                onClose={() => setIsEditModalOpen(false)} 
                onSave={() => { fetchInventories(); setIsEditModalOpen(false); }}
                showTitle={false}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}