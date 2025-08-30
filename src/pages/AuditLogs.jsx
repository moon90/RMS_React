import React, { useEffect, useState } from 'react';
import { getAllAuditLogs } from '../services/auditLogService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuditLogsPage = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuditLogs = async () => {
      if (!user || !user.permissions.includes('AUDIT_LOG_VIEW')) {
        navigate('/access-denied');
        return;
      }

      try {
        const response = await getAllAuditLogs();
        if (response.data.isSuccess) {
          setAuditLogs(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [user, navigate]);

  if (loading) {
    return <div>Loading audit logs...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
      {auditLogs.length === 0 ? (
        <p>No audit logs found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Action</th>
                <th className="py-2 px-4 border-b">Entity Type</th>
                <th className="py-2 px-4 border-b">Entity ID</th>
                <th className="py-2 px-4 border-b">Performed By</th>
                <th className="py-2 px-4 border-b">Performed At</th>
                <th className="py-2 px-4 border-b">Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="py-2 px-4 border-b">{log.id}</td>
                  <td className="py-2 px-4 border-b">{log.action}</td>
                  <td className="py-2 px-4 border-b">{log.entityType}</td>
                  <td className="py-2 px-4 border-b">{log.entityId}</td>
                  <td className="py-2 px-4 border-b">{log.performedBy}</td>
                  <td className="py-2 px-4 border-b">{new Date(log.performedAt).toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
