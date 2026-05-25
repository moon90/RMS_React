import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { salesService } from '../../services/salesService';
import SalesAdd from './SalesAdd.jsx';
import { toast } from 'react-toastify';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import { hasPermission } from '../../utils/permissionUtils';
import { 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaChartBar, 
  FaFilter, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaEye, 
  FaUserCircle,
  FaTimes,
  FaShieldAlt
} from 'react-icons/fa';

export default function SalesList() {
  const [sales, setSales] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50); 
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('SaleDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const canCreate = hasPermission('SALE_CREATE');
  const canUpdate = hasPermission('SALE_UPDATE');
  const canDelete = hasPermission('SALE_DELETE');

  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchQuery: searchTerm,
        sortColumn: sortField,
        sortDirection: sortDirection,
      };
      const response = await salesService.getAllSales(params);
      if (response.data && response.data.isSuccess) {
        const rawData = response.data.data || {};
        setSales(rawData.items || []);
        setTotalSales(rawData.totalRecords || 0);
      } else {
        toast.error('Failed to synchronize sales registry.');
        setSales([]);
        setTotalSales(0);
      }
    } catch (error) {
      toast.error('Critical failure: Sales registry unreachable.');
      setSales([]);
      setTotalSales(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

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
        <p className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-tighter">Purge this sale record permanently?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const response = await salesService.deleteSale(id);
                if (response.data.isSuccess) {
                  toast.success('Sale record purged from registry.');
                  fetchSales();
                } else {
                  toast.error(response.data.message || 'Deletion protocol rejected.');
                }
              } catch (err) {
                toast.error('Cannot purge: Protocol interruption.');
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

  const openModal = (sale = null) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto p-6 animate-fade-in max-w-7xl text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 text-left">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tighter text-left">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200">
              <FaChartBar className="text-white" />
            </div>
            Sales Registry
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic text-left">Historical transaction monitoring and financial audit log</p>
        </div>
        
        {canCreate && (
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg shadow-slate-500/20 hover:bg-black hover:-translate-y-1 transition-all active:scale-95 uppercase text-xs tracking-widest"
          >
            <FaPlus /> Initialize Record
          </button>
        )}
      </div>

      {/* SEARCH BAR */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative group flex-1 w-full text-left">
          <input
            type="text"
            placeholder="Search sales log by ID, customer or payment node..."
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm group-hover:shadow-md font-bold text-gray-700 text-left"
            onChange={handleSearchChange}
          />
          <FaSearch className="absolute top-5 left-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
        </div>
        <div className="px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400">
            {totalSales} Transactions Found
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide text-left">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer" onClick={() => handleSort('SaleID')}>Transaction ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Identity</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Settlement Value</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-bold">
              {isLoading ? (
                <tr><td colSpan="5" className="py-24 text-center"><div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div><p className="mt-4 text-xs font-black text-gray-300 uppercase tracking-widest animate-pulse">Syncing Registry...</p></td></tr>
              ) : sales.length > 0 ? (
                sales.map((sale) => (
                  <tr key={sale.saleID} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-8 py-6 text-left">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-inner border-2 border-white ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all bg-blue-50 text-blue-600">
                          #{sale.saleID}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-gray-800 text-sm tracking-tight uppercase">{sale.categoryName || 'General Sale'}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Revenue Node</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-left">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white transition-colors">
                           <FaUserCircle className="text-slate-300 group-hover:text-blue-500" />
                         </div>
                         <div className="flex flex-col">
                           <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{sale.customerName || `UID: ${sale.customerID || 'Guest'}`}</span>
                           <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Entity Info</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                           <FaMoneyBillWave className="text-emerald-400" />
                           <span className="text-base font-black text-slate-900 tracking-tighter tabular-nums">৳{sale.finalAmount.toLocaleString()}</span>
                        </div>
                        <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2.5 py-0.5 rounded-lg uppercase tracking-widest border border-emerald-100">{sale.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-left">
                      <div className="flex flex-col gap-1 text-slate-500 pl-1">
                        <span className="text-sm font-black text-slate-700">{new Date(sale.saleDate).toLocaleDateString()}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(sale.saleDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <button onClick={() => navigate(`/sales/${sale.saleID}`)} className="p-3 bg-white border border-slate-100 rounded-xl text-blue-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm" title="Inspect Record"><FaEye /></button>
                        {canUpdate && (
                          <button onClick={() => openModal(sale)} className="p-3 bg-white border border-slate-100 rounded-xl text-amber-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm" title="Modify Node"><FaEdit /></button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDelete(sale.saleID)} className="p-3 bg-white border border-slate-100 rounded-xl text-red-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm" title="Purge Log"><FaTrashAlt /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-6 text-slate-200">
                      <FaChartBar size={80} />
                      <p className="text-2xl font-black uppercase tracking-[0.2em] text-slate-300">Registry Nominal</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic max-w-xs leading-relaxed text-center">No transaction records were identified in the primary sales registry.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <ProfessionalPagination
          count={totalSales}
          page={currentPage}
          rowsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* MODAL SYSTEM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in text-left">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in border border-white/20">
            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200">
                  <FaChartBar className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">
                    {selectedSale ? 'Update Record' : 'Initialize Record'}
                  </h3>
                  <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">
                    {selectedSale ? `Reference: #${selectedSale.saleID}` : 'Global Sales Registry'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-xl text-gray-300 hover:text-red-500 transition-all hover:rotate-90"><FaTimesCircle size={28}/></button>
            </div>
            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar bg-white">
              <SalesAdd 
                isEdit={!!selectedSale} 
                data={selectedSale} 
                onSave={() => { setIsModalOpen(false); fetchSales(); }} 
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