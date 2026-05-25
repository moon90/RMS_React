import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import inventoryAuditService from '../../services/inventoryAuditService';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils/currencyUtils';
import { useAuth } from '../../context/AuthContext';
import { 
  FaArrowLeft, 
  FaClipboardCheck, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaCalendarAlt,
  FaUserShield,
  FaBoxOpen,
  FaHistory
} from 'react-icons/fa';

export default function InventoryAuditDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedBranch } = useAuth();
  const [audit, setAudit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAudit = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await inventoryAuditService.getAuditById(id);
      if (response.data.isSuccess) {
        setAudit(response.data.data);
      } else {
        toast.error(response.data.message || "Audit record not found.");
        navigate('/inventory-audits/list');
      }
    } catch (error) {
      toast.error("Failed to sync with audit database.");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  if (isLoading) {
    return (
      <div className="py-40 text-center">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Retrieving Variance Data...</p>
      </div>
    );
  }

  if (!audit) return null;

  return (
    <div className="container mx-auto p-6 animate-fade-in max-w-6xl text-left pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <button 
          onClick={() => navigate('/inventory-audits/list')}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
        >
          <FaArrowLeft /> Back to History
        </button>
        <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
           <FaHistory /> Audit Log #{audit.inventoryAuditID}
        </div>
      </div>

      {/* Summary Banner */}
      <div className={`rounded-[3rem] p-10 mb-12 flex flex-col md:flex-row justify-between items-center border-4 shadow-2xl ${audit.totalVarianceValue < 0 ? 'bg-red-50 border-red-100 shadow-red-500/5' : 'bg-emerald-50 border-emerald-100 shadow-emerald-500/5'}`}>
        <div className="flex items-center gap-6 mb-8 md:mb-0">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl ${audit.totalVarianceValue < 0 ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                {audit.totalVarianceValue < 0 ? <FaExclamationTriangle size={32} /> : <FaCheckCircle size={32} />}
            </div>
            <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${audit.totalVarianceValue < 0 ? 'text-red-400' : 'text-emerald-400'}`}>Audit Outcome</p>
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
                    {audit.totalVarianceValue < 0 ? 'Shortage Detected' : audit.totalVarianceValue > 0 ? 'Surplus Recorded' : 'Perfect Alignment'}
                </h2>
                <div className="flex items-center gap-4 mt-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><FaUserShield className="opacity-50" /> {audit.auditorName}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                    <span className="flex items-center gap-1.5"><FaCalendarAlt className="opacity-50" /> {new Date(audit.auditDate).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
        <div className="text-center md:text-right px-10 py-6 bg-white/50 rounded-[2rem] border border-white/50 backdrop-blur-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Financial Impact</p>
            <h3 className={`text-4xl font-black tracking-tighter ${audit.totalVarianceValue < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatCurrency(audit.totalVarianceValue, selectedBranch?.currencyCode, selectedBranch?.currencySymbol)}
            </h3>
        </div>
      </div>

      {/* Variance Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Itemized Variance Analysis</h3>
            <span className="px-4 py-1.5 bg-slate-50 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">{audit.details.length} Line Items</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <tr>
                        <th className="px-10 py-6">Ingredient</th>
                        <th className="px-10 py-6 text-center">System Stock</th>
                        <th className="px-10 py-6 text-center">Physical Count</th>
                        <th className="px-10 py-6 text-center">Variance</th>
                        <th className="px-10 py-6 text-right">Value Impact</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-bold">
                    {audit.details.map((detail, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
                            <td className="px-10 py-6 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-white transition-colors">
                                    <FaBoxOpen />
                                </div>
                                <span className="text-sm text-slate-700 font-black uppercase tracking-tight">{detail.ingredientName}</span>
                            </td>
                            <td className="px-10 py-6 text-center text-slate-500 tabular-nums">{detail.theoreticalStock.toFixed(2)}</td>
                            <td className="px-10 py-6 text-center text-slate-800 font-black tabular-nums">{detail.physicalStock.toFixed(2)}</td>
                            <td className={`px-10 py-6 text-center tabular-nums ${detail.variance < 0 ? 'text-red-500' : detail.variance > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                                {detail.variance > 0 ? '+' : ''}{detail.variance.toFixed(2)}
                            </td>
                            <td className={`px-10 py-6 text-right tabular-nums ${detail.varianceValue < 0 ? 'text-red-600' : detail.varianceValue > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                                {formatCurrency(detail.varianceValue, selectedBranch?.currencyCode, selectedBranch?.currencySymbol)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {audit.remarks && (
          <div className="mt-12 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Auditor Remarks</p>
             <p className="text-sm font-bold text-slate-600 italic leading-relaxed ml-2">"{audit.remarks}"</p>
          </div>
      )}
    </div>
  );
}
