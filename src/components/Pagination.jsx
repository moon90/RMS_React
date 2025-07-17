import React from 'react';

const Pagination = ({ currentPage, itemsPerPage, totalItems, onPageChange, onItemsPerPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
          <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <span className="text-sm text-gray-700">
            Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span> of <span className="font-medium">{totalItems}</span> entries
          </span>
        </div>
        
        <div className="flex items-center">
          <label className="mr-2 text-sm text-gray-700">Items per page:</label>
          <select
            className="p-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={itemsPerPage}
            onChange={(e) => {
              const newItemsPerPage = Number(e.target.value);
              onItemsPerPageChange(newItemsPerPage);
              onPageChange(1);
            }}
          >
            {[5, 10, 25, 50].map((number) => (
              <option key={number} value={number}>
                {number}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center">
          <button
            onClick={() => onPageChange(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="mx-2 flex items-center">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => onPageChange(i + 1)}
                className={`mx-1 px-3 py-1 text-sm rounded-md ${
                  currentPage === i + 1
                    ? 'bg-blue-500 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => onPageChange(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
  );
};

export default Pagination;
