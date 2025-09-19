import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllOrders, deleteOrder, updateOrder } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import { FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('OrderID');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const canView = user?.permissions?.includes('ORDER_VIEW');
  const canCreate = user?.permissions?.includes('ORDER_CREATE');
  const canEdit = user?.permissions?.includes('ORDER_UPDATE');
  const canDelete = user?.permissions?.includes('ORDER_DELETE');

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchQuery: searchTerm,
        sortColumn: sortField,
        sortDirection: sortDirection,
        status: statusFilter === '' ? null : statusFilter === 'true'
      };
      const response = await getAllOrders(params);
      if (response.data.isSuccess) {
        setOrders(response.data.data.data.items);
        setTotalOrders(response.data.data.data.totalRecords || 0);
      } else {
        toast.error(response.data.message || 'Failed to fetch orders');
        setOrders([]);
        setTotalOrders(0);
      }
    } catch (error) {
      toast.error('An error occurred while fetching orders.');
      console.error(error);
      setOrders([]);
      setTotalOrders(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection, statusFilter]);

  useEffect(() => {
    console.log('OrderList useEffect triggered. canView:', canView);
    if (!canView) {
      navigate('/access-denied');
      return;
    }
    // Only fetch orders if canView is true
    if (canView) {
      fetchOrders();
    }
  }, [canView, navigate, currentPage, itemsPerPage, searchTerm, sortField, sortDirection, statusFilter, fetchOrders]);

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

  const handleToggleStatus = async (id, currentStatus) => {
    if (!canEdit) {
      toast.error('You do not have permission to edit orders.');
      return;
    }

    // Determine the new status based on currentStatus
    // Assuming currentStatus is true for 'Completed' or 'Paid', false otherwise
    const newStatusValue = currentStatus ? "Pending" : "Completed"; // Toggle logic
    const actionText = newStatusValue === "Completed" ? 'complete' : 'pend';

    toast(
      ({ closeToast }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800 mb-2">
            Are you sure you want to {actionText} this order?
          </span>
          <div className="flex justify-end gap-2">
            <button
              onClick={async () => {
                try {
                  const response = await updateOrder(id, { orderStatus: newStatusValue });
                  if (response.data.isSuccess) {
                    toast.success(`Order ${actionText}d successfully`);
                    fetchOrders();
                  } else {
                    toast.error(response.data.message || `Failed to ${actionText} order`);
                  }
                } catch (error) {
                  if (error.response && error.response.data && error.response.data.message) {
                    toast.error(error.response.data.message);
                  } else {
                    toast.error(`An error occurred while trying to ${actionText} the order.`);
                  }
                  console.error(error);
                } finally {
                  closeToast();
                }
              }}
              className={`px-3 py-1 text-sm text-white rounded ${
                newStatusValue === "Completed" ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {newStatusValue === "Completed" ? 'Complete' : 'Pend'}
            </button>
            <button
              onClick={closeToast}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const handleDelete = (id) => {
    if (!canDelete) {
      toast.error('You do not have permission to delete orders.');
      return;
    }
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800 mb-2">Are you sure you want to delete this order?</span>
          <div className="flex justify-end gap-2">
            <button
              onClick={async () => {
                try {
                  const response = await deleteOrder(id);
                  if (response.data.isSuccess) {
                    toast.success('Order deleted successfully');
                  } else {
                    toast.error(response.data.message || 'Failed to delete order');
                  }
                } catch (error) {
                  if (error.response && error.response.data && error.response.data.message) {
                    toast.error(error.response.data.message);
                  } else {
                    toast.error('An error occurred while deleting the order.');
                  }
                  console.error(error);
                } finally {
                  fetchOrders();
                  closeToast();
                }
              }}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={closeToast}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false
      }
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
        <h2 className="text-2xl font-semibold">Order List</h2>
        {canCreate && (
          <button
            onClick={() => navigate('/orders/add')}
            className="mt-4 md:mt-0 px-4 py-2 bg-[#E65100] text-white rounded-md hover:bg-[#D84315] transition"
          >
            Add New Order
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E65100] focus:border-[#E65100]"
            onChange={handleSearchChange}
            disabled={isLoading}
          />
          <svg className="w-5 h-5 absolute left-2 top-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <div className="relative">
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E65100] focus:border-[#E65100]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={isLoading}
          >
            <option value="">All Statuses</option>
            <option value="true">Completed</option>
            <option value="false">Pending</option>
          </select>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#F5F5F5]">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-[#424242]">#</th>
              <th
                className={`px-4 py-3 text-left text-sm font-semibold text-[#424242] ${!isLoading && 'cursor-pointer'}`}
                onClick={() => handleSort('OrderID')}
              >
                <div className="flex items-center">
                  Order ID
                  {sortField === 'orderID' && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th
                className={`px-4 py-3 text-left text-sm font-semibold text-[#424242] ${!isLoading && 'cursor-pointer'}`}
                onClick={() => handleSort('orderDate')}
              >
                <div className="flex items-center">
                  Date
                  {sortField === 'orderDate' && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th
                className={`px-4 py-3 text-left text-sm font-semibold text-[#424242] ${!isLoading && 'cursor-pointer'}`}
                onClick={() => handleSort('orderTime')}
              >
                <div className="flex items-center">
                  Time
                  {sortField === 'orderTime' && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th
                className={`px-4 py-3 text-left text-sm font-semibold text-[#424242] ${!isLoading && 'cursor-pointer'}`}
                onClick={() => handleSort('orderStatus')}
              >
                <div className="flex items-center">
                  Status
                  {sortField === 'orderStatus' && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th
                className={`px-4 py-3 text-left text-sm font-semibold text-[#424242] ${!isLoading && 'cursor-pointer'}`}
                onClick={() => handleSort('total')}
              >
                <div className="flex items-center">
                  Total
                  {sortField === 'total' && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-[#424242]">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-[#424242]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">Loading...</td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((order, idx) => (
                <tr key={order.orderID} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-[#424242]">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="px-4 py-4 text-sm text-[#424242]">{order.orderID}</td>
                  <td className="px-4 py-4 text-sm text-[#424242]">{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td className="px-4 py-4 text-sm text-[#424242]">{order.orderTime}</td>
                  <td className="px-4 py-4 text-sm text-[#424242]">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.orderStatus === 'Completed' || order.orderStatus === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : order.orderStatus === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#424242]">{order.total.toFixed(2)}</td>
                  <td className="px-4 py-4 text-sm text-[#424242]">{order.customer ? order.customer.customerName : 'N/A'}</td>
                  <td className="px-4 py-4 text-sm text-[#424242]">
                    <div className="flex space-x-2">
                      {canEdit && (
                        <button 
                          onClick={() => navigate(`/orders/edit/${order.orderID}`)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                          aria-label="Edit order"
                        >
                          <svg className="w-4 h-4 text-[#E65100]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5h-2m-2 0V7a2 2 0 00-2-2H11a2 2 0 00-2 2v5a2 2 0 002 2h5M9 12h1m-1 4h1" />
                          </svg>
                        </button>
                      )}
                      {canEdit && (
                        <button 
                          onClick={() => handleToggleStatus(order.orderID, order.orderStatus === 'Completed' || order.orderStatus === 'Paid')}
                          className="p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                          aria-label="Toggle order status"
                        >
                          {(order.orderStatus === 'Completed' || order.orderStatus === 'Paid') ? ( // Change icon based on order status
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                      )}
                      {canDelete && (
                        <button 
                          onClick={() => handleDelete(order.orderID)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-red-100 transition-colors"
                          aria-label="Delete order"
                        >
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                      <Link 
                        to={`/orders/detail/${order.orderID}`}
                        className="p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                        aria-label="View order details"
                      >
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <span className="text-sm text-[#424242]">
            Showing <span className="font-medium">{totalOrders === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">
              {totalOrders === 0 ? 0 : Math.min(currentPage * itemsPerPage, totalOrders)}
            </span> of <span className="font-medium">{totalOrders}</span> entries
          </span>
        </div>
        
        <div className="flex items-center">
          <label className="mr-2 text-sm text-[#424242]">Items per page:</label>
          <select
            className="p-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            disabled={isLoading}
          >
            {[5, 10, 25, 50].map(number => (
              <option key={number} value={number}>{number}</option>
            ))}
          </select>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isLoading}
            className="px-3 py-1 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="mx-2 flex items-center">
            {Array.from({ length: Math.ceil(totalOrders / itemsPerPage) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`mx-1 px-3 py-1 text-sm rounded-md ${
                  currentPage === i + 1
                    ? 'bg-[#E65100] text-white'
                    : 'border border-gray-300 text-[#424242] hover:bg-gray-100'
                }`}
                disabled={isLoading}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalOrders / itemsPerPage)))}
            disabled={currentPage === Math.ceil(totalOrders / itemsPerPage) || isLoading}
            className="px-3 py-1 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderList;