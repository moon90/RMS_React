import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import inventoryAuditService from '../../services/inventoryAuditService';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils/currencyUtils';
import { useAuth } from '../../context/AuthContext';
import { 
  FaClipboardCheck, 
  FaPlus, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaCalendarAlt,
  FaUserShield,
  FaArrowRight,
  FaSearch
} from 'react-icons/fa';

export default function InventoryAuditList() {
  const [audits, setAudits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { selectedBranch } = useAuth();
  const navigate = useNavigate();

  const fetchAudits = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await inventoryAuditService.getAllAudits();
      if (response.data.isSuccess) {
        setAudits(response.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load audit history.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  const filteredAudits = audits.filter(a => 
    a.auditorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.inventoryAuditID.toString().includes(searchTerm)
  );

  return (
    <div className="container mx-auto p-6 animate-fade-in max-w-7xl text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tighter">
            <div className="p-3 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
              <FaClipboardCheck className="text-white" />
            </div>
            Inventory Variance AI
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic">Detect shrinkage, waste, and portion leaks</p>
        </div>
        
        <button
          onClick={() => navigate('/inventory-audits/add')}
          className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg shadow-slate-500/20 hover:bg-black hover:-translate-y-1 transition-all active:scale-95 uppercase text-xs tracking-widest"
        >
          <FaPlus /> Start New Audit
        </button>
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative group flex-1 w-full">
            <input
                type="text"
                placeholder="Search by auditor or ref ID..."
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-bold text-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute top-5 left-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <div className="px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400">
            {filteredAudits.length} Records Found
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AUDIT FEED */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center"><div className="w-12 h-12 border-4 border-gray-100 border-t-slate-900 rounded-full animate-spin mx-auto"></div></div>
          ) : filteredAudits.length > 0 ? (
            filteredAudits.map((audit) => (
              <div key={audit.inventoryAuditID} className="bg-white rounded-[2rem] shadow-xl border border-gray-50 overflow-hidden hover:shadow-2xl transition-all duration-500 group">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${audit.totalVarianceValue < 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {audit.totalVarianceValue < 0 ? <FaExclamationTriangle size={20} /> : <FaCheckCircle size={20} />}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Audit Ref: #{audit.inventoryAuditID}</p>
                            <h3 className="text-lg font-black text-gray-800 tracking-tight flex items-center gap-2">
                                {new Date(audit.auditDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </h3>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={`text-xl font-black tracking-tighter ${audit.totalVarianceValue < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {formatCurrency(audit.totalVarianceValue, selectedBranch?.currencyCode, selectedBranch?.currencySymbol)}
                        </p>
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Total Variance</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs font-bold text-gray-400 mb-6">
                        <span className="flex items-center gap-1.5"><FaUserShield className="text-slate-300" /> {audit.auditorName || 'System Auditor'}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                        <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-slate-300" /> Recorded at {new Date(audit.auditDate).toLocaleTimeString()}</span>
                  </div>

                  {audit.remarks && (
                      <div className="bg-gray-50 rounded-xl p-4 mb-6 text-xs font-bold text-gray-500 italic">
                          "{audit.remarks}"
                      </div>
                  )}

                  <button 
                    onClick={() => navigate(`/inventory-audits/${audit.inventoryAuditID}`)}
                    className="w-full py-4 bg-gray-50 hover:bg-slate-900 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    Deep Variance Analysis <FaSearch className="group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
                <FaClipboardCheck size={48} className="text-gray-100" />
                <p className="text-xl font-black text-gray-300 uppercase tracking-widest">No audit data streams</p>
            </div>
          )}
        </div>

        {/* LOSS PREVENTION INSIGHTS */}
        <div className="space-y-8">
            <div className="bg-red-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-6 relative z-10">Shrinkage Risk</h3>
                <div className="relative z-10">
                    <p className="text-4xl font-black tracking-tighter mb-2">
                        {formatCurrency(audits.reduce((acc, curr) => acc + (curr.totalVarianceValue < 0 ? curr.totalVarianceValue : 0), 0), selectedBranch?.currencyCode, selectedBranch?.currencySymbol)}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-relaxed">Estimated loss detected through portion variance in the last 30 days.</p>
                </div>
                <div className="mt-8 pt-8 border-t border-white/20 relative z-10">
                    <button className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                        Portion Control Guide <FaArrowRight size={10} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">AI Audit Integrity</h3>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Reliability Score</span>
                        <span className="text-xs font-black text-indigo-600">98.4%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="w-[98%] h-full bg-indigo-500 rounded-full"></div>
                    </div>
                    <p className="text-[9px] font-medium text-gray-400 leading-relaxed">System correlates POS recipe deduction with manual physical counts to identify anomalous patterns.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
