import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import payrollService from '../../services/payrollService';
import { getAllStaff } from '../../services/staffService';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils/currencyUtils';
import { useAuth } from '../../context/AuthContext';
import { 
  FaFileInvoiceDollar, 
  FaRobot, 
  FaPlus, 
  FaCalendarAlt, 
  FaUserTie, 
  FaCheckCircle, 
  FaInfoCircle,
  FaCogs
} from 'react-icons/fa';

export default function PayrollList() {
  const [payrolls, setPayrolls] = useState([]);
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsSubmitting] = useState(false);
  const { selectedBranch } = useAuth();
  const navigate = useNavigate();

  const [showRunModal, setShowRunModal] = useState(false);
  const [runData, setRunData] = useState({
    staffID: '',
    periodStart: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    periodEnd: new Date().toISOString().split('T')[0],
    bonusAmount: 0
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        payrollService.getAll(),
        getAllStaff()
      ]);
      if (pRes.data.isSuccess) setPayrolls(pRes.data.data || []);
      if (sRes.data.isSuccess) setStaff(sRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load payroll data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRunAi = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await payrollService.runAi(runData);
      if (response.data.isSuccess) {
        toast.success("AI Payroll analysis complete. Payment record created.");
        setShowRunModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error("AI engine encountered an error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 animate-fade-in max-w-7xl text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tighter">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100">
              <FaFileInvoiceDollar className="text-white" />
            </div>
            Payroll Engine AI
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic">Automated wage, commission, and bonus analysis</p>
        </div>
        
        <button
          onClick={() => setShowRunModal(true)}
          className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg shadow-slate-500/20 hover:bg-black hover:-translate-y-1 transition-all active:scale-95 uppercase text-xs tracking-widest"
        >
          <FaRobot /> Run AI Payroll
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* PAYROLL HISTORY */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Employee</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Period Details</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Earnings Breakdown</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Net Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    <tr><td colSpan="4" className="py-20 text-center"><div className="w-12 h-12 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin mx-auto"></div></td></tr>
                  ) : payrolls.length > 0 ? (
                    payrolls.map((p) => (
                      <tr key={p.payrollID} className="hover:bg-gray-50/50 transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 shadow-inner">
                                {p.staffName.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-gray-800 text-sm tracking-tight uppercase">{p.staffName}</span>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{p.role}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                    <FaCalendarAlt className="text-gray-300" size={10} />
                                    Paid on {new Date(p.payDate).toLocaleDateString()}
                                </div>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 w-fit">AI Generated</span>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                    <span>Base:</span>
                                    <span>{formatCurrency(p.basePay, selectedBranch?.currencyCode, selectedBranch?.currencySymbol)}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                                    <span>Commission:</span>
                                    <span>{formatCurrency(p.commissionEarned, selectedBranch?.currencyCode, selectedBranch?.currencySymbol)}</span>
                                </div>
                                {p.bonusAmount > 0 && (
                                    <div className="flex justify-between text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                                        <span>Bonus:</span>
                                        <span>{formatCurrency(p.bonusAmount, selectedBranch?.currencyCode, selectedBranch?.currencySymbol)}</span>
                                    </div>
                                )}
                            </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <p className="text-lg font-black text-slate-900 tracking-tighter">
                                {formatCurrency(p.totalPay, selectedBranch?.currencyCode, selectedBranch?.currencySymbol)}
                           </p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="py-20 text-center text-gray-400 font-bold italic">No payroll cycles executed yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SIDEBAR INSIGHTS */}
        <div className="space-y-8">
            <div className="bg-indigo-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-6 relative z-10">Payroll Accuracy</h3>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <FaCheckCircle className="text-emerald-300" />
                        </div>
                        <p className="text-2xl font-black tracking-tight">100% Correct</p>
                    </div>
                    <p className="text-[10px] font-bold opacity-80 leading-relaxed">AI engine automatically reconciles POS revenue with staff commission rates to ensure zero-error payroll cycles.</p>
                </div>
            </div>
        </div>
      </div>

      {/* RUN AI MODAL */}
      {showRunModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
              <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg p-10 animate-in zoom-in-95 duration-300">
                  <div className="text-center mb-10">
                      <div className="p-4 bg-indigo-50 inline-flex rounded-3xl mb-6">
                        <FaRobot className="text-indigo-600 text-3xl" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Neural Payroll Analysis</h3>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Initialize automated wage calculation</p>
                  </div>

                  <form onSubmit={handleRunAi} className="space-y-8">
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Target Employee</label>
                          <select 
                            value={runData.staffID}
                            onChange={(e) => setRunData({...runData, staffID: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700"
                            required
                          >
                              <option value="">Select Staff Member...</option>
                              {staff.map(s => <option key={s.staffID} value={s.staffID}>{s.staffName} ({s.staffRole})</option>)}
                          </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Period Start</label>
                            <input type="date" value={runData.periodStart} onChange={(e) => setRunData({...runData, periodStart: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Period End</label>
                            <input type="date" value={runData.periodEnd} onChange={(e) => setRunData({...runData, periodEnd: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700" required />
                          </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Bonus Adjustment</label>
                          <input type="number" value={runData.bonusAmount} onChange={(e) => setRunData({...runData, bonusAmount: parseFloat(e.target.value) || 0})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700" />
                      </div>

                      <div className="flex gap-4 pt-6">
                        <button type="button" onClick={() => setShowRunModal(false)} className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Cancel</button>
                        <button type="submit" disabled={isProcessing} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50">
                            {isProcessing ? 'Analyzing Data...' : 'Execute AI Run'}
                        </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
