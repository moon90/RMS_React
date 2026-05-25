import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { purchaseService } from '../../services/purchaseService';
import { toast } from 'react-toastify';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import { hasPermission } from '../../utils/permissionUtils';
import { 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaShoppingBag,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaEye,
  FaTruck,
  FaRobot
} from 'react-icons/fa';

export default function PurchaseList() {
  const [purchases, setPurchases] = useState([]);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50); 
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('PurchaseDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const canCreate = hasPermission('PURCHASE_CREATE');
  const canUpdate = hasPermission('PURCHASE_UPDATE');
  const canDelete = hasPermission('PURCHASE_DELETE');

  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchQuery: searchTerm,
        sortColumn: sortField,
        sortDirection: sortDirection,
      };
      const response = await purchaseService.getAllPurchases(params);
      if (response.data && response.data.isSuccess) {
        const rawData = response.data.data || {};
        // Unified items extraction
        setPurchases(rawData.items || rawData.Items || (Array.isArray(rawData) ? rawData : []));
        // Unified total records extraction
        const total = rawData.totalRecords || rawData.TotalRecords || rawData.totalCount || rawData.TotalCount || (rawData.items?.length || 0);
        setTotalPurchases(total);
      } else {
        toast.error('Failed to load purchases.');
        setPurchases([]);
        setTotalPurchases(0);
      }
    } catch (error) {
      toast.error('Purchase log unreachable.');
      setPurchases([]);
      setTotalPurchases(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

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

  const handleDelete = (id) => {
    if (!canDelete) return;
    
    toast(({ closeToast }) => (
      <div className="p-1 text-left">
        <p className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-tighter">Purge this purchase permanently?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const response = await purchaseService.deletePurchase(id);
                if (response.data.isSuccess) {
                  toast.success('Purchase record purged from registry.');
                  fetchPurchases();
                } else {
                  toast.error(response.data.message || 'Deletion protocol rejected.');
                }
              } catch (err) {
                toast.error('Cannot purge: Active dependency nodes detected.');
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
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 uppercase">
            <FaShoppingBag className="text-blue-600" />
            Purchase List
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic text-left">Manage supplier purchases and inventory replenishment</p>
        </div>
        
        {canCreate && (
          <button
            onClick={() => navigate('/purchases/create')}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 uppercase text-xs tracking-widest"
          >
            <FaPlus /> Add Purchase
          </button>
        )}
      </div>

      {/* SEARCH BAR */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative group flex-1 w-full text-left">
          <input
            type="text"
            placeholder="Search purchases..."
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm group-hover:shadow-md font-bold text-gray-700 text-left"
            onChange={handleSearchChange}
          />
          <FaSearch className="absolute top-5 left-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-50 overflow-hidden text-left">
        <div className="overflow-x-auto text-left">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer" onClick={() => handleSort('PurchaseID')}>Purchase ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Supplier</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Financial Summary</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-left">
              {isLoading ? (
                <tr><td colSpan="5" className="py-20 text-center"><div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div><p className="mt-4 text-xs font-black text-gray-300 uppercase tracking-widest animate-pulse">Loading List...</p></td></tr>
              ) : purchases.length > 0 ? (
                purchases.map((purchase) => (
                  <tr key={purchase.purchaseID} className={`hover:bg-gray-50/50 transition-all group ${purchase.createdBy === 'AI_COPILOT' ? 'bg-indigo-50/30' : ''}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-inner border-2 border-white ring-4 ${purchase.createdBy === 'AI_COPILOT' ? 'ring-indigo-100 bg-indigo-50 text-indigo-600' : 'ring-gray-50 bg-blue-50 text-blue-600'} transition-all`}>
                          #{purchase.purchaseID}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-gray-800 text-sm tracking-tight uppercase">{purchase.categoryName || 'General Stock'}</span>
                          {purchase.createdBy === 'AI_COPILOT' && (
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                              <FaRobot size={8} /> AI Generated
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                           <FaTruck className="text-gray-300" />
                           <span className="text-xs font-bold text-gray-700">{purchase.supplierName || `Supplier ID: ${purchase.supplierID}`}</span>
                        </div>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border w-fit ${
                          purchase.purchaseStatus === 'Draft' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          purchase.purchaseStatus === 'Ordered' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          purchase.purchaseStatus === 'Received' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                          {purchase.purchaseStatus || 'Draft'}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                           <FaMoneyBillWave className="text-green-500" />
                           <span className="text-xs font-black text-gray-800">${purchase.totalAmount}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{purchase.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-gray-500">
                        <FaCalendarAlt className="text-gray-300" size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{new Date(purchase.purchaseDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <button onClick={() => navigate(`/purchases/${purchase.purchaseID}`)} className="p-3 bg-white border border-gray-100 rounded-xl text-blue-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm"><FaEye /></button>
                        {canUpdate && (
                          <button onClick={() => navigate(`/purchases/edit/${purchase.purchaseID}`)} className="p-3 bg-white border border-gray-100 rounded-xl text-amber-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm"><FaEdit /></button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDelete(purchase.purchaseID)} className="p-3 bg-white border border-gray-100 rounded-xl text-red-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm"><FaTrashAlt /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-300">
                      <FaShoppingBag size={60} />
                      <p className="text-xl font-black uppercase tracking-widest text-gray-300">No Purchases Found</p>
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
          count={totalPurchases}
          page={currentPage}
          rowsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setItemsPerPage}
        />
      </div>

    </div>
  );
}