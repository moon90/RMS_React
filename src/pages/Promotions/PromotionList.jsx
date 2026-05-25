import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import promotionService from '../../services/promotionService';
import { toast } from 'react-toastify';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import { hasMenuPermission } from '../../utils/permissionUtils';
import PromotionAdd from './PromotionAdd';
import { 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaTag,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaPercentage,
  FaCoins
} from 'react-icons/fa';

export default function PromotionList() {
  const [promotions, setPromotions] = useState([]);
  const [totalPromotions, setTotalPromotions] = useState(0);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50); 
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('CouponCode');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({
    status: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const canCreate = hasMenuPermission('PROMOTION_CREATE');
  const canUpdate = hasMenuPermission('PROMOTION_UPDATE');
  const canDelete = hasMenuPermission('PROMOTION_DELETE');

  const fetchPromotions = useCallback(async () => {
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
      const response = await promotionService.getAllPromotions(params);
      if (response.data && response.data.isSuccess) {
        const pagedData = response.data.data || {};
        setPromotions(pagedData.items || []);
        setTotalPromotions(pagedData.totalRecords || 0);
      } else {
        toast.error('Failed to update promotion list.');
        setPromotions([]);
        setTotalPromotions(0);
      }
    } catch (error) {
      toast.error('Critical failure: Promotion list unreachable.');
      setPromotions([]);
      setTotalPromotions(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection, filters.status]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

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

  const handleDelete = (id) => {
    if (!canDelete) return;
    
    toast(({ closeToast }) => (
      <div className="p-1 text-left">
        <p className="text-sm font-bold text-gray-800 mb-3">Delete this promotion permanently?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const response = await promotionService.deletePromotion(id);
                if (response.data.isSuccess) {
                  toast.success('Promotion deleted successfully');
                  fetchPromotions();
                } else {
                  toast.error(response.data.message || 'Delete failed');
                }
              } catch (err) {
                toast.error('Cannot delete promotion: Active campaign dependencies');
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
            <FaTag className="text-blue-600" />
            Promotions
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic">Manage promotions, coupons, and discounts</p>
        </div>
        
        {canCreate && (
          <button
            onClick={() => { setSelectedPromotion(null); setIsEditModalOpen(true); }}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 uppercase text-xs tracking-widest"
          >
            <FaPlus /> Add Promotion
          </button>
        )}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center text-left">
        <div className="relative group flex-1 w-full text-left">
          <input
            type="text"
            placeholder="Search promotions..."
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm group-hover:shadow-md font-bold text-gray-700 text-left"
            onChange={handleSearchChange}
          />
          <FaSearch className="absolute top-5 left-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <FaFilter className="absolute left-4 top-5 text-gray-400 pointer-events-none" />
            <select 
              name="status" 
              className="w-full pl-10 pr-10 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-black text-[10px] uppercase tracking-widest text-gray-600 cursor-pointer shadow-sm hover:shadow-md transition-all appearance-none"
              onChange={handleFilter}
              value={filters.status}
            >
              <option value="">Status</option>
              <option value="active">Active ONLY</option>
              <option value="inactive">Expired / Disabled</option>
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
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer" onClick={() => handleSort('CouponCode')}>Name</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Discount</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Validity</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan="5" className="py-20 text-center"><div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div><p className="mt-4 text-xs font-black text-gray-300 uppercase tracking-widest animate-pulse">Updating List...</p></td></tr>
              ) : promotions.length > 0 ? (
                promotions.map((promo) => (
                  <tr key={promo.promotionID} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-inner border-2 border-white ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all ${promo.isActive ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                            <FaTag />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-gray-800 text-sm tracking-tight uppercase">{promo.couponCode}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate max-w-[200px]">{promo.description || 'No definition provided.'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                           <FaPercentage className="text-blue-500" />
                           <span className="text-xs font-black text-gray-700">{promo.discountPercentage}% OFF</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <FaCoins className="text-amber-500" />
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Flat: {promo.discountAmount}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-500">
                          <FaCalendarAlt className="text-gray-300" size={10} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">From: {new Date(promo.validFrom).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <FaCalendarAlt className="text-gray-300" size={10} />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">To: {new Date(promo.validTo).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm ${
                        promo.isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {promo.isActive ? <><FaCheckCircle /> Active</> : <><FaTimesCircle /> Inactive</>}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        {canUpdate && (
                          <button onClick={() => { setSelectedPromotion(promo); setIsEditModalOpen(true); }} className="p-3 bg-white border border-gray-100 rounded-xl text-blue-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm"><FaEdit /></button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDelete(promo.promotionID)} className="p-3 bg-white border border-gray-100 rounded-xl text-red-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm"><FaTrashAlt /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-300">
                      <FaTag size={60} />
                      <p className="text-xl font-black uppercase tracking-widest text-gray-300">No Promotions Found</p>
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
          count={totalPromotions}
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
                  <FaTag className="text-blue-600" />
                  {selectedPromotion ? 'Edit Promotion' : 'Add Promotion'}
                </h3>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest text-left">
                  {selectedPromotion ? `ID: ${selectedPromotion.promotionID}` : 'Promotion List'}
                </p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-xl text-gray-300 hover:text-red-500 transition-all hover:rotate-90"><FaTimesCircle size={28}/></button>
            </div>
            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
              <PromotionAdd 
                isEdit={!!selectedPromotion} 
                promotionData={selectedPromotion} 
                onClose={() => setIsEditModalOpen(false)} 
                onSave={() => { fetchPromotions(); setIsEditModalOpen(false); }}
                showTitle={false}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}