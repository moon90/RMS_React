import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import promotionService from '../../services/promotionService';
import { hasMenuPermission } from '../../utils/permissionUtils';

const PromotionList = () => {
    const [promotions, setPromotions] = useState([]);
    const [totalPromotions, setTotalPromotions] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('couponCode');
    const [sortDirection, setSortDirection] = useState('asc');
    const [statusFilter, setStatusFilter] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const canView = hasMenuPermission('PROMOTION_VIEW');
    const canCreate = hasMenuPermission('PROMOTION_CREATE');
    const canEdit = hasMenuPermission('PROMOTION_UPDATE');
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
                status: statusFilter === 'true' ? true : statusFilter === 'false' ? false : null,
            };
            const response = await promotionService.getAllPromotions(params);
            if (response.data.isSuccess) {
                setPromotions(response.data.data.data.items);
                setTotalPromotions(response.data.data.data.totalRecords || 0);
            } else {
                toast.error(response.data.message || 'Failed to fetch promotions');
                setPromotions([]);
                setTotalPromotions(0);
            }
        } catch (error) {
            toast.error('An error occurred while fetching promotions.');
            console.error(error);
            setPromotions([]);
            setTotalPromotions(0);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection, statusFilter]);

    useEffect(() => {
        if (!canView) {
            navigate('/access-denied');
            return;
        }
        fetchPromotions();
    }, [canView, navigate, fetchPromotions]);

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
            toast.error('You do not have permission to delete promotions.');
            return;
        }
        confirmAlert({
            title: 'Confirm to delete',
            message: 'Are you sure you want to delete this promotion?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
                        try {
                            const response = await promotionService.deletePromotion(id);
                            if (response.data.isSuccess) {
                                toast.success('Promotion deleted successfully.');
                                fetchPromotions();
                            } else {
                                toast.error(response.data.message || 'Failed to delete promotion.');
                            }
                        } catch (err) {
                            if (err.response && err.response.data && err.response.data.message) {
                                toast.error(err.response.data.message);
                            } else {
                                toast.error('An error occurred while deleting the promotion.');
                            }
                            console.error(err);
                        }
                    }
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ]
        });
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
                <h2 className="text-2xl font-semibold">Promotion List</h2>
                {canCreate && (
                    <button
                        onClick={() => navigate('/promotions/add')}
                        className="mt-4 md:mt-0 px-4 py-2 bg-[#E65100] text-white rounded-md hover:bg-[#D84315] transition"
                    >
                        Add Promotion
                    </button>
                )}
            </div>

            {/* Search and Filter */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search promotions..."
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
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
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
                                onClick={() => handleSort('couponCode')}
                            >
                                <div className="flex items-center">
                                    Coupon Code
                                    {sortField === 'couponCode' && (
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                        </svg>
                                    )}
                                </div>
                            </th>
                            <th
                                className={`px-4 py-3 text-left text-sm font-semibold text-[#424242] ${!isLoading && 'cursor-pointer'}`}
                                onClick={() => handleSort('discountAmount')}
                            >
                                <div className="flex items-center">
                                    Discount Amount
                                    {sortField === 'discountAmount' && (
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                        </svg>
                                    )}
                                </div>
                            </th>
                            <th
                                className={`px-4 py-3 text-left text-sm font-semibold text-[#424242] ${!isLoading && 'cursor-pointer'}`}
                                onClick={() => handleSort('discountPercentage')}
                            >
                                <div className="flex items-center">
                                    Discount Percentage
                                    {sortField === 'discountPercentage' && (
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                        </svg>
                                    )}
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-[#424242]">Description</th>
                            <th
                                className={`px-4 py-3 text-left text-sm font-semibold text-[#424242] ${!isLoading && 'cursor-pointer'}`}
                                onClick={() => handleSort('validFrom')}
                            >
                                <div className="flex items-center">
                                    Valid From
                                    {sortField === 'validFrom' && (
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                        </svg>
                                    )}
                                </div>
                            </th>
                            <th
                                className={`px-4 py-3 text-left text-sm font-semibold text-[#424242] ${!isLoading && 'cursor-pointer'}`}
                                onClick={() => handleSort('validTo')}
                            >
                                <div className="flex items-center">
                                    Valid To
                                    {sortField === 'validTo' && (
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                        </svg>
                                    )}
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-[#424242]">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-[#424242]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan="9" className="text-center py-4">Loading...</td>
                            </tr>
                        ) : promotions.length > 0 ? (
                            promotions.map((promotion, idx) => (
                                <tr key={promotion.promotionID} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4 text-sm text-[#424242]">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                    <td className="px-4 py-4 text-sm text-[#424242]">{promotion.couponCode}</td>
                                    <td className="px-4 py-4 text-sm text-[#424242]">{promotion.discountAmount}</td>
                                    <td className="px-4 py-4 text-sm text-[#424242]">{promotion.discountPercentage}</td>
                                    <td className="px-4 py-4 text-sm text-[#424242]">{promotion.description}</td>
                                    <td className="px-4 py-4 text-sm text-[#424242]">{new Date(promotion.validFrom).toLocaleDateString()}</td>
                                    <td className="px-4 py-4 text-sm text-[#424242]">{new Date(promotion.validTo).toLocaleDateString()}</td>
                                    <td className="px-4 py-4 text-sm text-[#424242]">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                promotion.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {promotion.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-[#424242]">
                                        <div className="flex space-x-2">
                                            {canEdit && (
                                                <button
                                                    onClick={() => navigate(`/promotions/edit/${promotion.promotionID}`)}
                                                    className="p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                                                    aria-label="Edit promotion"
                                                >
                                                    <svg className="w-4 h-4 text-[#E65100]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5h-2m-2 0V7a2 2 0 00-2-2H11a2 2 0 00-2 2v5a2 2 0 002 2h5M9 12h1m-1 4h1" />
                                                    </svg>
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDelete(promotion.promotionID)}
                                                    className="p-1 border border-gray-300 rounded-md hover:bg-red-100 transition-colors"
                                                    aria-label="Delete promotion"
                                                >
                                                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="text-center py-4">No promotions found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                    <span className="text-sm text-[#424242]">
                        Showing <span className="font-medium">{totalPromotions === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                            {totalPromotions === 0 ? 0 : Math.min(currentPage * itemsPerPage, totalPromotions)}
                        </span> of <span className="font-medium">{totalPromotions}</span> entries
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
                        {Array.from({ length: Math.ceil(totalPromotions / itemsPerPage) }, (_, i) => (
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
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalPromotions / itemsPerPage)))}
                        disabled={currentPage === Math.ceil(totalPromotions / itemsPerPage) || isLoading}
                        className="px-3 py-1 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromotionList;