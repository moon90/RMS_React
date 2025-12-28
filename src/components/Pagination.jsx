import React from 'react';
import ProfessionalPagination from './ProfessionalPagination';

const Pagination = ({ currentPage, itemsPerPage, totalItems, onPageChange, onItemsPerPageChange }) => {
  const handlePageChange = (newPage) => {
    onPageChange(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    onItemsPerPageChange(newRowsPerPage);
    onPageChange(1); // Reset to the first page when items per page changes
  };

  return (
    <ProfessionalPagination
      count={totalItems}
      page={currentPage}
      rowsPerPage={itemsPerPage}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
    />
  );
};

export default Pagination;

