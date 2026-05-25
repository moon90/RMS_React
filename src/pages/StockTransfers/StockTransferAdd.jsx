import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import stockTransferService from '../../services/stockTransferService';
import { getAllIngredients } from '../../services/ingredientService';
import branchService from '../../services/branchService';
import { toast } from 'react-toastify';
import FormCard from '../../components/FormCard';
import { useAuth } from '../../context/AuthContext';
import { 
  FaSave, 
  FaArrowLeft, 
  FaTruck, 
  FaPlus, 
  FaTrash, 
  FaBuilding, 
  FaBoxOpen 
} from 'react-icons/fa';

export default function StockTransferAdd() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [branches, setBranches] = useState([]);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    toBranchID: '',
    remarks: '',
    details: [{ ingredientID: '', quantity: 1 }]
  });

  const fetchData = useCallback(async () => {
    try {
      const [ingRes, brRes] = await Promise.all([
        getAllIngredients({ pageNumber: 1, pageSize: 1000, status: true }),
        branchService.getAllBranches()
      ]);

      if (ingRes.data.isSuccess) {
          setIngredients(ingRes.data.data.items || []);
      }
      
      if (brRes.data.isSuccess) {
          // Filter out the current branch so user cannot transfer to themselves
          const otherBranches = brRes.data.data.filter(b => b.branchID !== user?.branchID);
          setBranches(otherBranches);
      }
    } catch (err) {
      toast.error("Failed to load dependency data.");
    }
  }, [user?.branchID]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...formData.details];
    updatedDetails[index][field] = value;
    setFormData({ ...formData, details: updatedDetails });
  };

  const addDetail = () => {
    setFormData({
      ...formData,
      details: [...formData.details, { ingredientID: '', quantity: 1 }]
    });
  };

  const removeDetail = (index) => {
    const updatedDetails = formData.details.filter((_, i) => i !== index);
    setFormData({ ...formData, details: updatedDetails });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.toBranchID) return toast.warn("Please select a destination branch.");
    if (formData.details.some(d => !d.ingredientID || d.quantity <= 0)) 
        return toast.warn("Please complete all item lines with valid quantities.");

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        toBranchID: parseInt(formData.toBranchID),
        details: formData.details.map(d => ({
            ingredientID: parseInt(d.ingredientID),
            quantity: parseFloat(d.quantity)
        }))
      };

      const response = await stockTransferService.createTransfer(payload);
      if (response.data.isSuccess) {
        toast.success("Stock transfer initiated and shipped.");
        navigate('/stock-transfers/list');
      } else {
        toast.error(response.data.message || "Failed to initiate transfer.");
      }
    } catch (error) {
      toast.error("Critical error during logistics operation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 animate-fade-in max-w-5xl text-left">
      <div className="flex items-center justify-between mb-10">
        <button 
          onClick={() => navigate('/stock-transfers/list')}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <FaArrowLeft /> Back to Logistics
        </button>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Initiate Stock Transfer</h2>
      </div>

      <FormCard>
        <form onSubmit={handleSubmit} className="p-4 space-y-10">
          
          {/* HEADER INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-indigo-600 transition-colors">Destination Branch</label>
              <div className="relative">
                <FaBuilding className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-all" />
                <select
                  name="toBranchID"
                  value={formData.toBranchID}
                  onChange={(e) => setFormData({...formData, toBranchID: e.target.value})}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-700 shadow-inner appearance-none"
                  required
                >
                  <option value="" className="text-gray-900 bg-white">Select Destination Node...</option>
                  {branches.map(b => (
                      <option key={b.branchID} value={b.branchID} className="text-gray-900 bg-white">{b.branchName} ({b.branchCode})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-indigo-600 transition-colors">Logistics Remarks</label>
              <div className="relative">
                <input
                  type="text"
                  name="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  placeholder="Reason for transfer, vehicle #, etc."
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-700 shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* LINE ITEMS */}
          <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Ingredient Payload</h3>
                <button 
                    type="button"
                    onClick={addDetail}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                >
                    <FaPlus /> Add Line
                </button>
            </div>

            <div className="space-y-4">
                {formData.details.map((detail, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-4 items-end bg-gray-50/50 p-6 rounded-[2rem] border border-gray-50 group/item hover:bg-white hover:shadow-xl transition-all duration-300">
                        <div className="flex-1 w-full">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Ingredient</label>
                            <div className="relative">
                                <FaBoxOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <select
                                    value={detail.ingredientID}
                                    onChange={(e) => handleDetailChange(index, 'ingredientID', e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:border-indigo-500 font-bold text-sm text-slate-700 shadow-sm appearance-none"
                                >
                                    <option value="" className="text-gray-900 bg-white">Select Item...</option>
                                    {ingredients.map(ing => (
                                        <option key={ing.ingredientID} value={ing.ingredientID} className="text-gray-900 bg-white">{ing.name} (Available: {ing.quantityAvailable})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="w-full md:w-32">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Quantity</label>
                            <input
                                type="number"
                                value={detail.quantity}
                                onChange={(e) => handleDetailChange(index, 'quantity', e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:border-indigo-500 font-bold text-sm text-slate-700 shadow-sm"
                            />
                        </div>

                        {formData.details.length > 1 && (
                            <button 
                                type="button"
                                onClick={() => removeDetail(index)}
                                className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <FaTrash />
                            </button>
                        )}
                    </div>
                ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/stock-transfers/list')}
              className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
            >
              Discard Logistics
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 text-[11px] uppercase tracking-[0.2em] flex items-center gap-3"
            >
              {isLoading ? 'Processing...' : <><FaTruck /> Ship Transfer</>}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
}
