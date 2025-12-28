import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { getAllAuditLogs } from '../services/auditLogService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import ProfessionalPagination from '../components/ProfessionalPagination';

const AuditLogsPage = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('performedAt');
  const [sortDirection, setSortDirection] = useState('desc');

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchAuditLogs = useCallback(async () => {
    if (!user || !user.permissions.includes('AUDIT_LOG_VIEW')) {
      navigate('/access-denied');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getAllAuditLogs(currentPage, itemsPerPage, searchTerm, sortField, sortDirection);
      if (response.data.isSuccess) {
        setAuditLogs(response.data.data.items);
        setTotalRecords(response.data.data.totalRecords);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, navigate, currentPage, itemsPerPage, searchTerm, sortField, sortDirection]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const debouncedSearch = useCallback(debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300), []);

  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
  };

  const handleSort = (field) => {
    if (loading) return; // Use the 'loading' state directly from component state
    if (field === sortField) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    }
    else {
        setSortField(field);
        setSortDirection('asc');
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setItemsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  if (loading) {
    return <div className="text-center p-4">Loading audit logs...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>

      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search audit logs..."
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={handleSearchChange}
            disabled={loading}
          />
          <FaSearch className="absolute top-3 left-3 text-gray-400" />
        </div>
      </div>

      {auditLogs.length === 0 ? (
        <p className="text-center">No audit logs found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#F5F5F5]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#424242]">ID</th>
                <th
                  className={`px-4 py-3 text-left text-sm font-semibold text-[#424242] ${!loading && 'cursor-pointer'}`}
                  onClick={() => handleSort('action')}
                >
                  <div className="flex items-center">
                    Action
                    {sortField === 'action' && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-semibold text-[#424242] ${!loading && 'cursor-pointer'}`}
                  onClick={() => handleSort('entityType')}
                >
                  <div className="flex items-center">
                    Entity Type
                    {sortField === 'entityType' && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#424242]">Entity ID</th>
                <th
                  className={`px-4 py-3 text-left text-sm font-semibold text-[#424242] ${!loading && 'cursor-pointer'}`}
                  onClick={() => handleSort('performedBy')}
                >
                  <div className="flex items-center">
                    Performed By
                    {sortField === 'performedBy' && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-semibold text-[#424242] ${!loading && 'cursor-pointer'}`}
                  onClick={() => handleSort('performedAt')}
                >
                  <div className="flex items-center">
                    Performed At
                    {sortField === 'performedAt' && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#424242]">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-4 text-sm text-[#424242]">{log.id}</td>
                  <td className="py-2 px-4 text-sm text-[#424242]">{log.action}</td>
                  <td className="py-2 px-4 text-sm text-[#424242]">{log.entityType}</td>
                  <td className="py-2 px-4 text-sm text-[#424242]">{log.entityId}</td>
                  <td className="py-2 px-4 text-sm text-[#424242]">{log.performedBy}</td>
                  <td className="py-2 px-4 text-sm text-[#424242]">{new Date(log.performedAt).toLocaleString()}</td>
                  <td className="py-2 px-4 text-sm text-[#424242]">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && (
        <ProfessionalPagination
          count={totalRecords}
          page={currentPage}
          rowsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}
    </div>
  );
};

export default AuditLogsPage;