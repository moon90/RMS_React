import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { getAllCustomers, deleteCustomer, toggleCustomerStatus } from '../../services/customerService';
import CustomerAdd from './CustomerAdd';
import { toast } from 'react-toastify';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import { hasPermission } from '../../utils/permissionUtils';
import { 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaUserTag,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCar
} from 'react-icons/fa';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50); // Showing "all" rows by default
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('customerName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({
    status: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const canCreate = hasPermission('CUSTOMER_CREATE');
  const canUpdate = hasPermission('CUSTOMER_UPDATE');
  const canDelete = hasPermission('CUSTOMER_DELETE');

  const fetchCustomers = useCallback(async () => {
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
      const response = await getAllCustomers(params);
      if (response.data && response.data.isSuccess) {
        const rawData = response.data.data || {};
        // Unified items extraction
        setCustomers(rawData.items || rawData.Items || (Array.isArray(rawData) ? rawData : []));
        // Unified total records extraction
        const total = rawData.totalRecords || rawData.TotalRecords || rawData.totalCount || rawData.TotalCount || (rawData.items?.length || 0);
        setTotalCustomers(total);
      } else {
        toast.error('Failed to load customers.');
        setCustomers([]);
        setTotalCustomers(0);
      }
    } catch (error) {
      toast.error('Critical failure: Customer list unreachable.');
      setCustomers([]);
      setTotalCustomers(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection, filters.status]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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

  const handleToggleStatus = async (customer) => {
    if (!canUpdate) return;
    try {
      const response = await toggleCustomerStatus(customer.customerID, !customer.status);
      if (response.data.isSuccess) {
        toast.success(`Customer '${customer.customerName}' status updated.`);
        fetchCustomers();
      }
    } catch (error) {
      toast.error('Status synchronization failed.');
    }
  };

  const handleDelete = (id) => {
    if (!canDelete) return;
    
    toast(({ closeToast }) => (
      <div className="p-1 text-left">
        <p className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-tighter">Purge this client permanently?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const response = await deleteCustomer(id);
                if (response.data.isSuccess) {
                  toast.success('Client purged from registry.');
                  fetchCustomers();
                } else {
                  toast.error(response.data.message || 'Deletion protocol rejected.');
                }
              } catch (err) {
                toast.error('Cannot purge: Active transaction history detected.');
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
    <div className="container mx-auto p-6 animate-fade-in max-w-7xl">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <FaUserTag className="text-blue-600" />
            Customer List
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic">Manage your customers</p>
        </div>
        
        {canCreate && (
          <button
            onClick={() => { setSelectedCustomer(null); setIsEditModalOpen(true); }}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95"
          >
            <FaPlus /> Add Customer
          </button>
        )}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative group flex-1">
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm group-hover:shadow-md font-bold text-gray-700"
            onChange={handleSearchChange}
          />
          <FaSearch className="absolute top-5 left-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <FaFilter className="absolute left-4 top-5 text-gray-400 pointer-events-none" />
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
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer" onClick={() => handleSort('customerName')}>Customer Name</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan="4" className="py-20 text-center"><div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div><p className="mt-4 text-xs font-black text-gray-300 uppercase tracking-widest animate-pulse">Loading Customers...</p></td></tr>
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.customerID} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-inner border-2 border-white ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all ${customer.status ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                            <FaUserTag />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${customer.status ? 'bg-green-500' : 'bg-red-400'}`}></div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-gray-800 text-sm tracking-tight uppercase">{customer.customerName}</span>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1"><FaPhone className="text-[8px]"/> {customer.customerPhone}</span>
                            <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">ID: {customer.customerID}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                        <span className="flex items-center gap-2 max-w-[200px] truncate"><FaMapMarkerAlt className="text-gray-300 flex-shrink-0" /> {customer.address}</span>
                        <span className="flex items-center gap-2"><FaCar className="text-gray-300 flex-shrink-0" /> Driver: {customer.driverName || 'N/A'}</span>
                        <span className="flex items-center gap-2 lowercase italic font-medium"><FaEnvelope className="text-gray-300 flex-shrink-0" /> {customer.customerEmail}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => handleToggleStatus(customer)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm ${
                          customer.status ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                        }`}
                      >
                        {customer.status ? <><FaCheckCircle />Active</> : <><FaTimesCircle />Inactive</>}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        {canUpdate && (
                          <button onClick={() => { setSelectedCustomer(customer); setIsEditModalOpen(true); }} className="p-3 bg-white border border-gray-100 rounded-xl text-blue-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm"><FaEdit /></button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDelete(customer.customerID)} className="p-3 bg-white border border-gray-100 rounded-xl text-red-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm"><FaTrashAlt /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-300">
                      <FaUserTag size={60} />
                      <p className="text-xl font-black uppercase tracking-widest text-gray-300">No Customers Found</p>
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
          count={totalCustomers}
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
                  <FaUserTag className="text-blue-600" />
                  {selectedCustomer ? 'Edit Customer' : 'Add Customer'}
                </h3>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                  {selectedCustomer ? `ID: ${selectedCustomer.customerID}` : 'Customer details'}
                </p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-xl text-gray-300 hover:text-red-500 transition-all hover:rotate-90"><FaTimesCircle size={28}/></button>
            </div>
            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
              <CustomerAdd 
                isEdit={!!selectedCustomer} 
                customerData={selectedCustomer} 
                onClose={() => setIsEditModalOpen(false)} 
                onSave={() => { fetchCustomers(); setIsEditModalOpen(false); }}
                showTitle={false}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}