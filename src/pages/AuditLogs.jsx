import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { getAllAuditLogs } from '../services/auditLogService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaHistory, FaUser, FaDatabase, FaClock, FaEye } from 'react-icons/fa';
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
  const [selectedLog, setSelectedLog] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchAuditLogs = useCallback(async () => {
    // Check for correct permission key
    const hasPermission = user?.permissions?.some(p => p === 'AUDIT_LOG_VIEW' || p === 'AUDIT_LOGS_VIEW');
    if (!hasPermission) {
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

  const getActionBadge = (action) => {
    const baseClass = "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm";
    switch (action.toUpperCase()) {
      case 'CREATE': return `${baseClass} bg-green-100 text-green-700 border border-green-200`;
      case 'UPDATE':
      case 'UPDATE_BULK': return `${baseClass} bg-blue-100 text-blue-700 border border-blue-200`;
      case 'DELETE': return `${baseClass} bg-red-100 text-red-700 border border-red-200`;
      default: return `${baseClass} bg-gray-100 text-gray-700 border border-gray-200`;
    }
  };

  return (
    <div className="container mx-auto p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <FaHistory className="text-[#DA291C]" />
            Audit Logs
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Track all system activities and database changes</p>
        </div>
        
        <div className="relative group w-full md:w-96">
          <input
            type="text"
            placeholder="Search by action, user or entity..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-2xl focus:border-[#DA291C] focus:ring-4 focus:ring-red-500/10 outline-none transition-all shadow-sm group-hover:shadow-md"
            onChange={handleSearchChange}
          />
          <FaSearch className="absolute top-4 left-4 text-gray-400 group-hover:text-[#DA291C] transition-colors" />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
           <div className="w-12 h-12 border-4 border-gray-100 border-t-[#DA291C] rounded-full animate-spin mb-4"></div>
           <p className="text-gray-400 font-bold animate-pulse">Loading secure logs...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-2 border-red-100 p-6 rounded-2xl text-center">
          <p className="text-red-700 font-bold">Failed to load logs: {error}</p>
          <button onClick={() => fetchAuditLogs()} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full font-bold shadow-lg shadow-red-500/20">Try Again</button>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Log List</th>
                  <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Entity</th>
                  <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Performed By</th>
                  <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                  <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          {getActionBadge(log.action)}
                          <span className="text-[10px] text-gray-300 font-mono">ID: {log.id}</span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium line-clamp-1 group-hover:line-clamp-none transition-all">
                          {log.details || 'No additional details available'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                          <FaDatabase className="text-xs" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{log.entityType}</p>
                          <p className="text-[10px] text-gray-400 font-mono">Ref: {log.entityId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                          <FaUser className="text-[10px]" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{log.performedBy}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-gray-500">
                        <FaClock className="text-xs opacity-40" />
                        <span className="text-sm font-medium">{new Date(log.performedAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="p-2 hover:bg-white hover:shadow-md rounded-xl text-gray-400 hover:text-[#DA291C] transition-all"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {auditLogs.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-bold">No activity logs recorded yet.</p>
            </div>
          )}

          <div className="p-6 bg-gray-50/30 border-t border-gray-100">
            <ProfessionalPagination
              count={totalRecords}
              page={currentPage}
              rowsPerPage={itemsPerPage}
              onPageChange={(p) => setCurrentPage(p)}
              onRowsPerPageChange={(r) => { setItemsPerPage(r); setCurrentPage(1); }}
            />
          </div>
        </div>
      )}

      {/* Log Detail Modal (Optional enhancement) */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900">Event Analysis</h3>
              {getActionBadge(selectedLog.action)}
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Details</p>
                <p className="text-gray-700 font-medium">{selectedLog.details}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Entity Type</p>
                  <p className="text-gray-900 font-bold">{selectedLog.entityType}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Reference ID</p>
                  <p className="text-gray-900 font-bold">{selectedLog.entityId}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setSelectedLog(null)}
              className="mt-8 w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-colors shadow-xl shadow-gray-900/20"
            >
              Close Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;