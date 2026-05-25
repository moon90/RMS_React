import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { getLowStockProducts, adjustStock } from '../../services/low-stock.service';
import { deleteInventory, toggleInventoryStatus } from '../../services/inventoryService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaExclamationTriangle, FaSearch, FaFilter, FaBoxes, FaHistory, FaCheckCircle, FaTimesCircle, FaUndo } from 'react-icons/fa';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import { toast } from 'react-toastify';

const LowStockPage = () => {
  const [inventories, setInventories] = useState([]);
  const [totalInventories, setTotalInventories] = useState(0);
  const [summary, setSummary] = useState({ critical: 0, warning: 0, investment: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('ProductName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adjustment, setAdjustment] = useState({ transactionType: 'IN', quantity: 0, remarks: '' });

  const { user, selectedBranch } = useAuth();
  const navigate = useNavigate();

  const canView = user?.permissions?.includes('INVENTORY_VIEW');
  const canEdit = user?.permissions?.includes('INVENTORY_UPDATE');
  const canDelete = user?.permissions?.includes('INVENTORY_DELETE');

  const fetchInventories = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchQuery: searchTerm,
        sortColumn: sortField,
        sortDirection: sortDirection,
        status: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : null,
      };
      const response = await getLowStockProducts(params);
      if (response.data && response.data.isSuccess) {
        const rawData = response.data.data || {};
        const pagedData = rawData.pagedData || {};
        setInventories(pagedData.items || []);
        setTotalInventories(pagedData.totalRecords || 0);
        setSummary({
            critical: rawData.criticalItemsCount || 0,
            warning: rawData.warningItemsCount || 0,
            investment: rawData.totalRestockInvestment || 0
        });
      } else {
        toast.error('Failed to load stock alerts.');
        setInventories([]);
      }
    } catch (error) {
      toast.error('Inventory server unreachable.');
      setInventories([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection, statusFilter]);

  useEffect(() => {
    if (!canView) {
      navigate('/access-denied');
      return;
    }
    fetchInventories();
  }, [canView, navigate, fetchInventories]);

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

  const renderSortIndicator = (field) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };

  const handleDelete = (id) => {
    if (!canDelete) return;
    
    toast(({ closeToast }) => (
      <div className="p-1 text-left">
        <p className="text-sm font-bold text-gray-800 mb-3">Delete this inventory item?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const response = await deleteInventory(id);
                if (response.data.isSuccess) {
                  toast.success('Deleted successfully');
                  fetchInventories();
                } else {
                  toast.error(response.data.message || 'Delete failed');
                }
              } catch (error) {
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

  const handleToggleStatus = async (inventory) => {
    if (!canEdit) return;
    try {
      const response = await toggleInventoryStatus(inventory.inventoryID, !inventory.status);
      if (response.data.isSuccess) {
        toast.success(`Status updated for '${inventory.productName}'`);
        fetchInventories();
      }
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
    setAdjustment({ transactionType: 'IN', quantity: 0, remarks: '' });
  };

  const handleAdjustmentChange = (e) => {
    const { name, value } = e.target;
    setAdjustment((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdjustStock = async () => {
    if (!selectedProduct) return;

    const transaction = {
      productID: selectedProduct.productID,
      ...adjustment,
    };

    try {
      const response = await adjustStock(transaction);
      if (response.data && response.data.isSuccess) {
        toast.success('Stock adjusted');
        handleCloseModal();
        fetchInventories();
      } else {
        toast.error(response.data?.message || 'Adjustment failed');
      }
    } catch {
      toast.error('Failed to adjust stock');
    }
  };

  return (
    <div className="container mx-auto p-6 animate-fade-in max-w-7xl text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 text-left">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 uppercase text-left">
            <FaExclamationTriangle className="text-red-500" />
            Supply Chain Control
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic text-left">Active monitoring of inventory depletion thresholds</p>
        </div>
      </div>

      {/* STAT CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-1">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Critical Shortage</span>
             <h2 className="text-4xl font-black text-red-600 tracking-tighter">{summary.critical} <span className="text-xs uppercase text-slate-300">Items Out</span></h2>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-1">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Warning</span>
             <h2 className="text-4xl font-black text-amber-500 tracking-tighter">{summary.warning} <span className="text-xs uppercase text-slate-300">Below Limit</span></h2>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-1">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Restock Cost</span>
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedBranch?.currencyCode || 'USD' }).format(summary.investment)}
             </h2>
          </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center text-left">
        <div className="relative group flex-1 w-full text-left">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm group-hover:shadow-md font-bold text-gray-700"
            onChange={handleSearchChange}
          />
          <FaSearch className="absolute top-5 left-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
        </div>
        
        <div className="relative w-full md:w-auto">
          <FaFilter className="absolute left-4 top-5 text-gray-400 pointer-events-none" />
          <select 
            name="status" 
            className="w-full pl-10 pr-10 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-black text-[10px] uppercase tracking-widest text-gray-600 cursor-pointer shadow-sm hover:shadow-md transition-all appearance-none min-w-[140px]"
            onChange={(e) => setStatusFilter(e.target.value)}
            value={statusFilter}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-50 overflow-hidden text-left">
        <div className="overflow-x-auto text-left">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors select-none" onClick={() => handleSort('ProductName')}>
                  Product{renderSortIndicator('ProductName')}
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors select-none" onClick={() => handleSort('CurrentStock')}>
                  Stock Status{renderSortIndicator('CurrentStock')}
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors select-none" onClick={() => handleSort('MinStockLevel')}>
                  Min Level{renderSortIndicator('MinStockLevel')}
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors select-none" onClick={() => handleSort('Status')}>
                  Status{renderSortIndicator('Status')}
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right select-none">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan="5" className="py-20 text-center"><div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div><p className="mt-4 text-xs font-black text-gray-300 uppercase tracking-widest animate-pulse">Loading Alerts...</p></td></tr>
              ) : inventories.length > 0 ? (
                inventories.map((inventory) => (
                  <tr key={inventory.inventoryID} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 rounded-xl">
                          <FaBoxes className="text-red-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-gray-800 text-sm tracking-tight uppercase">{inventory.productName}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {inventory.inventoryID}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                         <div className="px-3 py-1 bg-red-50 border border-red-100 rounded-lg">
                           <span className="text-xs font-black text-red-600 animate-pulse">{inventory.currentStock} Units Left</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-sm font-black text-gray-700">{inventory.minStockLevel} Units</span>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => handleToggleStatus(inventory)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm ${
                          inventory.status ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                        }`}
                      >
                        {inventory.status ? <FaCheckCircle /> : <FaTimesCircle />}
                        {inventory.status ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        {canEdit && (
                          <button onClick={() => handleOpenModal(inventory)} className="p-3 bg-white border border-gray-100 rounded-xl text-blue-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm" title="Adjust Stock"><FaEdit /></button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDelete(inventory.inventoryID)} className="p-3 bg-white border border-gray-100 rounded-xl text-red-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm"><FaTrash /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-300">
                      <FaCheckCircle size={60} className="text-green-100" />
                      <p className="text-xl font-black uppercase tracking-widest text-gray-300">All stock levels healthy</p>
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
          onRowsPerPageChange={(r) => { setItemsPerPage(r); setCurrentPage(1); }}
        />
      </div>

      {/* ADJUSTMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-left">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 text-left">
              <div>
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <FaHistory className="text-blue-600" /> Adjust Stock
                </h3>
                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{selectedProduct?.productName}</p>
              </div>
              <button onClick={handleCloseModal} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg text-gray-300 hover:text-red-500 transition-all"><FaTimesCircle size={20}/></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Adjustment Type</label>
                <div className="flex gap-4">
                   <button onClick={() => setAdjustment({...adjustment, transactionType: 'IN'})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${adjustment.transactionType === 'IN' ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-gray-50 text-gray-400'}`}>Stock In</button>
                   <button onClick={() => setAdjustment({...adjustment, transactionType: 'OUT'})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${adjustment.transactionType === 'OUT' ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-gray-50 text-gray-400'}`}>Stock Out</button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Quantity</label>
                <input type="number" name="quantity" value={adjustment.quantity} onChange={handleAdjustmentChange} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700" placeholder="0" />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Remarks / Notes</label>
                <textarea name="remarks" value={adjustment.remarks} onChange={handleAdjustmentChange} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700 min-h-[100px]" placeholder="Reason for adjustment..." />
              </div>

              <button onClick={handleAdjustStock} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">Commit Adjustment</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LowStockPage;
