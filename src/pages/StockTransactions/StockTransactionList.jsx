import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import StockTransactionAdd from './StockTransactionAdd.jsx';
import { toast } from 'react-toastify';
import { getAllStockTransactions, deleteStockTransaction, toggleStockTransactionStatus } from '../../services/stockTransactionService';
import { hasPermission } from '../../utils/permissionUtils';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import CustomConfirmAlert from '../../components/CustomConfirmAlert';
import { 
  FaExchangeAlt, 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaBoxOpen, 
  FaTruck, 
  FaHistory,
  FaFilter,
  FaArrowRight,
  FaCalendarAlt,
  FaLeaf
} from 'react-icons/fa';

export default function StockTransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('TransactionDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filters, setFilters] = useState({
    status: '',
    type: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const canCreate = hasPermission('STOCK_TRANSACTION_CREATE');
  const canUpdate = hasPermission('STOCK_TRANSACTION_UPDATE');
  const canDelete = hasPermission('STOCK_TRANSACTION_DELETE');

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchQuery: searchTerm,
        sortColumn: sortField,
        sortDirection: sortDirection,
        status: filters.status === 'active' ? true : filters.status === 'inactive' ? false : null,
        type: filters.type || null,
      };
      const response = await getAllStockTransactions(params);
      if (response.data && response.data.isSuccess) {
        const rawData = response.data.data || {};
        // Unified items extraction
        setTransactions(rawData.items || rawData.Items || (Array.isArray(rawData) ? rawData : []));
        // Unified total records extraction
        const total = rawData.totalRecords || rawData.TotalRecords || rawData.totalCount || rawData.TotalCount || (rawData.items?.length || 0);
        setTotalRecords(total);
      } else {
        toast.error('Failed to load movements.');
        setTransactions([]);
        setTotalRecords(0);
      }
    } catch (error) {
      toast.error('Movement log unreachable.');
      setTransactions([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection, filters.status, filters.type]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

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

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleDelete = (id) => {
    if (!canDelete) return;
    
    CustomConfirmAlert({
      title: 'Purge Transaction',
      message: 'Are you sure you want to remove this movement record permanently? This action cannot be reversed.',
      onConfirm: async () => {
        try {
          const response = await deleteStockTransaction(id);
          if (response.data.isSuccess) {
            toast.success('Transaction purged from registry.');
            fetchTransactions();
          } else {
            toast.error(response.data.message || 'Purge failed');
          }
        } catch (error) {
          toast.error('Critical failure: Protocol interruption.');
        }
      }
    });
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (!canUpdate) return;
    try {
      const response = await toggleStockTransactionStatus(id, !currentStatus);
      if (response.data && response.data.isSuccess) {
        toast.success(`Status updated to ${!currentStatus ? 'Active' : 'Inactive'}`);
        fetchTransactions();
      }
    } catch (error) {
      toast.error('An error occurred while toggling status.');
    }
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto p-6 animate-fade-in max-w-7xl">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <FaExchangeAlt className="text-blue-600" />
            Stock Movements
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic">Monitor and manage all inventory movements and adjustments</p>
        </div>
        
        {canCreate && (
          <button
            onClick={() => { setSelectedTransaction(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95"
          >
            <FaPlus /> Add Movement
          </button>
        )}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center text-left">
        <div className="relative group flex-1">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm group-hover:shadow-md font-bold text-gray-700"
            onChange={handleSearchChange}
          />
          <FaSearch className="absolute top-5 left-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <FaFilter className="absolute left-4 top-5 text-gray-400 pointer-events-none" />
            <select 
              name="type" 
              className="pl-10 pr-10 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-black text-[10px] uppercase tracking-widest text-gray-600 cursor-pointer shadow-sm hover:shadow-md transition-all appearance-none"
              onChange={handleFilter}
              value={filters.type}
            >
              <option value="">All Types</option>
              <option value="IN">Stock In</option>
              <option value="OUT">Stock Out</option>
              <option value="ADJUSTMENT">Adjustments</option>
            </select>
          </div>

          <div className="relative">
            <FaCheckCircle className="absolute left-4 top-5 text-gray-400 pointer-events-none" />
            <select 
              name="status" 
              className="pl-10 pr-10 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-black text-[10px] uppercase tracking-widest text-gray-600 cursor-pointer shadow-sm hover:shadow-md transition-all appearance-none"
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
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-50 overflow-hidden text-left">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer" onClick={() => handleSort('ProductName')}>Product & Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer" onClick={() => handleSort('TransactionType')}>Movement Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer" onClick={() => handleSort('Quantity')}>Quantity</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Source</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan="6" className="py-20 text-center"><div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div><p className="mt-4 text-xs font-black text-gray-300 uppercase tracking-widest animate-pulse">Loading...</p></td></tr>
              ) : transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr key={t.transactionID} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl transition-colors ${t.ingredientName ? 'bg-orange-50 text-orange-400 group-hover:text-orange-500' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                          {t.ingredientName ? <FaLeaf /> : <FaBoxOpen />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 text-sm tracking-tight">{t.productName || t.ingredientName || 'Unknown Material'}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                            <FaCalendarAlt size={8} /> {new Date(t.transactionDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider w-fit border ${
                          t.transactionType === 'IN' ? 'bg-green-50 text-green-600 border-green-100' : 
                          t.transactionType === 'OUT' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                          'bg-purple-50 text-purple-600 border-purple-100'
                        }`}>
                          {t.transactionType}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 truncate max-w-[150px]">{t.remarks || 'No remarks provided'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <FaHistory className="text-gray-300" />
                        <span className="text-sm font-black text-gray-700">{t.quantity}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-600 flex items-center gap-2"><FaTruck className="text-gray-300" /> {t.supplierName || 'System Generated'}</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t.transactionSource || 'Internal Node'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => handleToggleStatus(t.transactionID, t.status)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm ${
                          t.status ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                        }`}
                      >
                        {t.status ? <FaCheckCircle /> : <FaTimesCircle />}
                        {t.status ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        {canUpdate && (
                          <button onClick={() => handleEdit(t)} className="p-3 bg-white border border-gray-100 rounded-xl text-blue-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm"><FaEdit /></button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDelete(t.transactionID)} className="p-3 bg-white border border-gray-100 rounded-xl text-red-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm"><FaTrashAlt /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-300">
                      <FaExchangeAlt size={60} />
                      <p className="text-xl font-black uppercase tracking-widest">No items found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-8 bg-gray-50/30 border-t border-gray-100">
          <ProfessionalPagination
            count={totalRecords}
            page={currentPage}
            rowsPerPage={itemsPerPage}
            onPageChange={(p) => setCurrentPage(p)}
            onRowsPerPageChange={(r) => { setItemsPerPage(r); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* MODAL SECTION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3 text-left">
                  <FaExchangeAlt className="text-blue-600" />
                  {selectedTransaction ? 'Edit Movement' : 'Add Movement'}
                </h3>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest text-left">
                  {selectedTransaction ? `ID: ${selectedTransaction.transactionID}` : 'Movement details'}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-xl text-gray-300 hover:text-red-500 transition-all hover:rotate-90"><FaTimesCircle size={28}/></button>
            </div>
            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
              <StockTransactionAdd 
                isEdit={!!selectedTransaction} 
                transactionData={selectedTransaction} 
                onSave={() => { setIsModalOpen(false); fetchTransactions(); }} 
                onClose={() => setIsModalOpen(false)} 
                showTitle={false} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}