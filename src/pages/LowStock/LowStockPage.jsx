import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { getLowStockProducts, adjustStock } from '../../services/low-stock.service';
import { deleteInventory, toggleInventoryStatus } from '../../services/inventoryService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const LowStockPage = () => {
  const [inventories, setInventories] = useState([]);
  const [totalInventories, setTotalInventories] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('productName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adjustment, setAdjustment] = useState({ transactionType: 'IN', quantity: 0, remarks: '' });

  const { user } = useAuth();
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
        status: statusFilter,
      };
      const response = await getLowStockProducts(params);
      if (response.data.isSuccess) {
        setInventories(response.data.data.items);
        setTotalInventories(response.data.data.totalRecords || 0);
      } else {
        toast.error(response.message || 'Failed to fetch inventories');
        setInventories([]);
        setTotalInventories(0);
      }
    } catch (error) {
      toast.error('An error occurred while fetching inventories.');
      console.error(error);
      setInventories([]);
      setTotalInventories(0);
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

  const handleDelete = (id) => {
    if (!canDelete) {
      toast.error('You do not have permission to delete inventory.');
      return;
    }
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800 mb-2">Are you sure you want to delete this inventory item?</span>
          <div className="flex justify-end gap-2">
            <button
              onClick={async () => {
                try {
                  const response = await deleteInventory(id);
                  if (response.data.isSuccess) {
                    toast.success('Inventory item deleted successfully');
                  } else {
                    toast.error(response.data.message || 'Failed to delete inventory item');
                  }
                } catch (error) {
                  if (error.response && error.response.data && error.response.data.message) {
                    toast.error(error.response.data.message);
                  } else {
                    toast.error('An error occurred while deleting the inventory item.');
                  }
                  console.error(error);
                } finally {
                  fetchInventories();
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

  const handleToggleStatus = async (id, currentStatus) => {
    if (!canEdit) {
      toast.error('You do not have permission to change the status of an inventory item.');
      return;
    }

    const newStatus = !currentStatus;
    const actionText = newStatus ? 'activate' : 'deactivate';

    toast(
      ({ closeToast }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800 mb-2">
            Are you sure you want to {actionText} this inventory item?
          </span>
          <div className="flex justify-end gap-2">
            <button
              onClick={async () => {
                try {
                  const response = await toggleInventoryStatus(id, newStatus);
                  if (response.data.isSuccess) {
                    toast.success(`Inventory item ${actionText}d successfully`);
                    fetchInventories();
                  } else {
                    toast.error(response.data.message || `Failed to ${actionText} inventory item`);
                  }
                } catch (error) {
                  if (error.response && error.response.data && error.response.data.message) {
                    toast.error(error.response.data.message);
                  } else {
                    toast.error(`An error occurred while trying to ${actionText} the inventory item.`);
                  }
                  console.error(error);
                } finally {
                  closeToast();
                }
              }}
              className={`px-3 py-1 text-sm text-white rounded ${
                newStatus ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {newStatus ? 'Activate' : 'Deactivate'}
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
      await adjustStock(transaction);
      handleCloseModal();
      fetchInventories();
      toast.success('Stock adjusted successfully');
    } catch {
      toast.error('Failed to adjust stock');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
        <h2 className="text-2xl font-semibold">Low Stock List</h2>
        
      </div>

      {/* Search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search inventory..."
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={handleSearchChange}
            disabled={isLoading}
          />
          <svg className="w-5 h-5 absolute left-2 top-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <div className="relative">
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={isLoading}
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">#</th>
              <th
                className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!isLoading && 'cursor-pointer'}`}
                onClick={() => handleSort('productName')}
              >
                <div className="flex items-center">
                  Product Name
                  {sortField === 'productName' && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th
                className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!isLoading && 'cursor-pointer'}`}
                onClick={() => handleSort('currentStock')}
              >
                <div className="flex items-center">
                  Current Stock
                  {sortField === 'currentStock' && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th
                className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!isLoading && 'cursor-pointer'}`}
                onClick={() => handleSort('reorderLevel')}
              >
                <div className="flex items-center">
                  Min Stock Level
                  {sortField === 'minStockLevel' && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th
                className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!isLoading && 'cursor-pointer'}`}
                onClick={() => handleSort('initialStock')}
              >
                <div className="flex items-center">
                  Initial Stock
                  {sortField === 'initialStock' && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th
                className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!isLoading && 'cursor-pointer'}`}
                onClick={() => handleSort('lastUpdated')}
              >
                <div className="flex items-center">
                  Last Updated
                  {sortField === 'lastUpdated' && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="8" className="text-center py-4">Loading...</td>
              </tr>
            ) : inventories.length > 0 ? (
              inventories.map((inventory, idx) => (
                <tr key={inventory.inventoryID} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-700">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{inventory.productName}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{inventory.currentStock}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{inventory.minStockLevel}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{inventory.initialStock}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{new Date(inventory.lastUpdated).toLocaleDateString()}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        inventory.status
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {inventory.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="flex space-x-2">
                      {canEdit && (
                        <button 
                          onClick={() => handleOpenModal(inventory)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                          aria-label="Adjust Stock"
                        >
                          <FaEdit className="w-4 h-4 text-blue-600" />
                        </button>
                      )}
                      {canEdit && (
                        <button 
                          onClick={() => handleToggleStatus(inventory.inventoryID, inventory.status)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                          aria-label="Toggle status"
                        >
                          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      )}
                      {canDelete && (
                        <button 
                          onClick={() => handleDelete(inventory.inventoryID)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-red-100 transition-colors"
                          aria-label="Delete inventory"
                        >
                          <FaTrash className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4">No inventory found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <span className="text-sm text-gray-700">
            Showing <span className="font-medium">{totalInventories === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">
              {totalInventories === 0 ? 0 : Math.min(currentPage * itemsPerPage, totalInventories)}
            </span> of <span className="font-medium">{totalInventories}</span> entries
          </span>
        </div>
        
        <div className="flex items-center">
          <label className="mr-2 text-sm text-gray-700">Items per page:</label>
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
            {Array.from({ length: Math.ceil(totalInventories / itemsPerPage) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`mx-1 px-3 py-1 text-sm rounded-md ${
                  currentPage === i + 1
                    ? 'bg-blue-500 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
                disabled={isLoading}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalInventories / itemsPerPage)))}
            disabled={currentPage === Math.ceil(totalInventories / itemsPerPage) || isLoading}
            className="px-3 py-1 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Adjust Stock for {selectedProduct?.productName}</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                <select
                  id="transactionType"
                  name="transactionType"
                  value={adjustment.transactionType}
                  onChange={handleAdjustmentChange}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                >
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                </select>
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={adjustment.quantity}
                  onChange={handleAdjustmentChange}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                />
              </div>
              <div>
                <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <input
                  type="text"
                  id="remarks"
                  name="remarks"
                  value={adjustment.remarks}
                  onChange={handleAdjustmentChange}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdjustStock}
                className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium shadow"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LowStockPage;