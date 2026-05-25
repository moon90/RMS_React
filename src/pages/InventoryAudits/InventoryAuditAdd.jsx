import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import inventoryAuditService from '../../services/inventoryAuditService';
import { getAllIngredients } from '../../services/ingredientService';
import { toast } from 'react-toastify';
import FormCard from '../../components/FormCard';
import { 
  FaSave, 
  FaArrowLeft, 
  FaClipboardCheck, 
  FaUserShield, 
  FaBoxOpen, 
  FaExclamationCircle, 
  FaSync
} from 'react-icons/fa';

export default function InventoryAuditAdd() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [ingredients, setIngredients] = useState([]);

  const [formData, setFormData] = useState({
    auditorName: '',
    remarks: '',
    details: []
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllIngredients({ pageNumber: 1, pageSize: 1000, status: true });
      if (response.data.isSuccess) {
        const items = response.data.data.items || [];
        setIngredients(items);
        // Initialize details with current ingredients and their theoretical stock
        setFormData(prev => ({
          ...prev,
          details: items.map(ing => ({
            ingredientID: ing.ingredientID,
            name: ing.name,
            theoreticalStock: ing.quantityAvailable,
            physicalStock: ing.quantityAvailable // Default to matching
          }))
        }));
      }
    } catch (err) {
      toast.error("Failed to load inventory for audit.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStockChange = (index, value) => {
    const updatedDetails = [...formData.details];
    updatedDetails[index].physicalStock = parseFloat(value) || 0;
    setFormData({ ...formData, details: updatedDetails });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        auditorName: formData.auditorName,
        remarks: formData.remarks,
        details: formData.details.map(d => ({
          ingredientID: d.ingredientID,
          physicalStock: d.physicalStock
        }))
      };

      const response = await inventoryAuditService.createAudit(payload);
      if (response.data.isSuccess) {
        toast.success("Inventory Audit submitted. Variance AI analysis updated.");
        navigate('/inventory-audits/list');
      } else {
        toast.error(response.data.message || "Submission failed.");
      }
    } catch (error) {
      toast.error("Critical error during audit processing.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 animate-fade-in max-w-5xl text-left">
      <div className="flex items-center justify-between mb-10">
        <button 
          onClick={() => navigate('/inventory-audits/list')}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
        >
          <FaArrowLeft /> Back to Audits
        </button>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
            <FaClipboardCheck className="text-indigo-600" /> Physical Stock Audit
        </h2>
      </div>

      <FormCard>
        <form onSubmit={handleSubmit} className="p-4 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-indigo-600 transition-colors">Auditor Name</label>
              <div className="relative">
                <FaUserShield className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-all" />
                <input
                  type="text"
                  name="auditorName"
                  value={formData.auditorName}
                  onChange={(e) => setFormData({...formData, auditorName: e.target.value})}
                  placeholder="Employee performing count"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-700 shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-indigo-600 transition-colors">Audit Remarks</label>
              <div className="relative">
                <input
                  type="text"
                  name="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  placeholder="e.g. End of Month Count"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-700 shadow-inner"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Stock Comparison Sheet</h3>
                <div className="flex items-center gap-2 text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                    <FaExclamationCircle /> AI Variance detection enabled
                </div>
            </div>

            <div className="space-y-4">
                {formData.details.map((detail, index) => {
                    const variance = detail.physicalStock - detail.theoreticalStock;
                    return (
                        <div key={index} className={`flex flex-col md:flex-row gap-6 items-center p-6 rounded-[2.5rem] border-2 transition-all duration-300 ${variance !== 0 ? 'bg-amber-50/30 border-amber-100 shadow-xl shadow-amber-500/5' : 'bg-white border-slate-50 hover:border-slate-200'}`}>
                            <div className="flex-1 w-full">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ingredient</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
                                        <FaBoxOpen />
                                    </div>
                                    <h4 className="font-black text-slate-800 text-sm tracking-tight">{detail.name}</h4>
                                </div>
                            </div>

                            <div className="w-full md:w-32 text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">System Stock</p>
                                <p className="font-black text-slate-600 text-base tabular-nums">{detail.theoreticalStock.toFixed(2)}</p>
                            </div>

                            <div className="w-full md:w-48">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Physical Count</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={detail.physicalStock}
                                    onChange={(e) => handleStockChange(index, e.target.value)}
                                    className="w-full px-6 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-500 font-black text-sm text-slate-700 shadow-sm text-center"
                                />
                            </div>

                            <div className="w-full md:w-32 text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Variance</p>
                                <p className={`font-black text-base tabular-nums ${variance < 0 ? 'text-red-500' : variance > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                                    {variance > 0 ? '+' : ''}{variance.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/inventory-audits/list')}
              className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
            >
              Abort Audit
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-10 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black shadow-xl shadow-slate-300 active:scale-95 transition-all disabled:opacity-50 text-[11px] uppercase tracking-[0.2em] flex items-center gap-3"
            >
              {isLoading ? 'Analyzing...' : <><FaSave /> Commit & Sync AI</>}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
}
