import React from 'react';
import { TablePagination } from '@mui/material';

const ProfessionalPagination = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const handlePageChange = (event, newPage) => {
    onPageChange(newPage + 1); // MUI's page is 0-indexed, our app is 1-indexed
  };

  const handleRowsPerPageChange = (event) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  return (
    <TablePagination
      component="div"
      count={count}
      page={page - 1} // Adjust for 0-indexed MUI component
      onPageChange={handlePageChange}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleRowsPerPageChange}
      rowsPerPageOptions={[5, 10, 25, 50]}
      sx={{
        '.MuiToolbar-root': {
          justifyContent: 'center',
          padding: '0 8px',
        },
        '.MuiTablePagination-spacer': {
          display: 'none',
        },
        '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
          margin: '0 16px 0 0',
          fontSize: '0.875rem',
        },
        '.MuiSelect-select': {
          padding: '4px 24px 4px 8px',
          fontSize: '0.875rem',
        },
        '.MuiTablePagination-actions': {
          marginLeft: '16px',
        },
      }}
    />
  );
};

export default ProfessionalPagination;
