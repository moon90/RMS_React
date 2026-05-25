import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import stockTransferService from '../../services/stockTransferService';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import { debounce } from 'lodash';
import { 
  FaExchangeAlt, 
  FaPlus, 
  FaCheckCircle, 
  FaTruck, 
  FaClock, 
  FaTimesCircle,
  FaMapMarkerAlt,
  FaArrowRight,
  FaInfoCircle,
  FaSearch
} from 'react-icons/fa';

export default function StockTransferList() {
  const [transfers, setTransfers] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchTransfers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchQuery: searchTerm
      };
      const response = await stockTransferService.getAllTransfers(params);
      if (response.data.isSuccess) {
        const rawData = response.data.data || {};
        setTransfers(rawData.items || []);
        setTotalRecords(rawData.totalRecords || 0);
      }
    } catch (error) {
      toast.error('Failed to load transfers.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const debouncedSearch = useCallback(debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300), []);

  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
  };

  const handleReceive = async (id) => {
    try {
      const response = await stockTransferService.updateStatus(id, 'Received');
      if (response.data.isSuccess) {
        toast.success("Stock received and updated in local inventory.");
        fetchTransfers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Acknowledgement failed.");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Received': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className="container mx-auto p-6 animate-fade-in max-w-7xl text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 text-left">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tighter text-left">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100">
              <FaExchangeAlt className="text-white" />
            </div>
            Stock Logistics Hub
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic text-left">Manage branch-to-branch ingredient transfers</p>
        </div>
        
        <button
          onClick={() => navigate('/stock-transfers/add')}
          className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 uppercase text-xs tracking-widest"
        >
          <FaPlus /> New Transfer
        </button>
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative group flex-1 w-full text-left">
            <input
                type="text"
                placeholder="Search logistics by tracking # or branch..."
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm font-bold text-slate-700"
                onChange={handleSearchChange}
            />
            <FaSearch className="absolute top-5 left-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <div className="px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400">
            {totalRecords} Active Records
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        {/* LOGISTICS FEED */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center"><div className="w-12 h-12 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin mx-auto"></div></div>
          ) : transfers.length > 0 ? (
            <>
            {transfers.map((trf) => (
              <div key={trf.stockTransferID} className="bg-white rounded-[2rem] shadow-xl border border-gray-50 overflow-hidden hover:shadow-2xl transition-all duration-500 group">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            <FaTruck size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{trf.transferNumber}</p>
                            <h3 className="text-lg font-black text-gray-800 tracking-tight text-left">
                                {trf.fromBranchName} <FaArrowRight size={10} className="inline mx-2 text-indigo-300" /> {trf.toBranchName}
                            </h3>
                        </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(trf.status)}`}>
                        {trf.status}
                    </span>
                  </div>

                  <div className="bg-gray-50/50 rounded-2xl p-6 mb-6 border border-gray-50">
                    <ul className="space-y-3 text-left">
                        {trf.details.map((detail, idx) => (
                            <li key={idx} className="flex justify-between items-center text-sm font-bold text-gray-600">
                                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> {detail.ingredientName}</span>
                                <span className="text-indigo-600">{detail.quantity} {detail.unitName}</span>
                            </li>
                        ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400 text-left">
                        <span className="flex items-center gap-1.5"><FaClock /> {new Date(trf.transferDate).toLocaleDateString()}</span>
                        {trf.remarks && <span className="flex items-center gap-1.5"><FaInfoCircle /> {trf.remarks}</span>}
                    </div>
                    
                    {trf.status === 'Shipped' && user?.branchID === trf.toBranchID && (
                        <button 
                            onClick={() => handleReceive(trf.stockTransferID)}
                            className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                        >
                            Acknowledge Receipt
                        </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-4">
                <ProfessionalPagination 
                    count={totalRecords}
                    page={currentPage}
                    rowsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onRowsPerPageChange={setItemsPerPage}
                />
            </div>
            </>
          ) : (
            <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
                <FaExchangeAlt size={48} className="text-gray-100" />
                <p className="text-xl font-black text-gray-300 uppercase tracking-widest">No logistics activity</p>
            </div>
          )}
        </div>

        {/* LOGISTICS INSIGHTS */}
        <div className="space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 relative z-10 text-left">Logistics Pulse</h3>
                <div className="space-y-6 relative z-10 text-left">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-amber-400 border border-white/5">
                            <FaClock />
                        </div>
                        <div>
                            <p className="text-2xl font-black tracking-tight">{transfers.filter(t => t.status === 'Shipped').length}</p>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">In-Transit Shipments</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-emerald-400 border border-white/5">
                            <FaCheckCircle />
                        </div>
                        <div>
                            <p className="text-2xl font-black tracking-tight">{transfers.filter(t => t.status === 'Received').length}</p>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Completed Lifecycle</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
