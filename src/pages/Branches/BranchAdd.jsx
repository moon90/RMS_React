import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import branchService from '../../services/branchService';
import { toast } from 'react-toastify';
import FormCard from '../../components/FormCard';
import { 
  FaSave, 
  FaArrowLeft, 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaBarcode 
} from 'react-icons/fa';

export default function BranchAdd() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    branchName: '',
    branchCode: '',
    address: '',
    phone: '',
    email: '',
    isMainBranch: false
  });

  const fetchBranchDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await branchService.getBranchById(id);
      if (response.data.isSuccess) {
        setFormData(response.data.data);
      } else {
        toast.error('Could not load branch details.');
      }
    } catch (error) {
      toast.error('Fetch error.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBranchDetails();
  }, [fetchBranchDetails]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // In a real app, you'd have an updateBranch service too.
      // For this demo, let's assume update and create use the same structure.
      const response = isEdit 
        ? await branchService.createBranch(formData) // Placeholder for update
        : await branchService.createBranch(formData);

      if (response.data.isSuccess) {
        toast.success(`Branch ${isEdit ? 'updated' : 'registered'} successfully.`);
        navigate('/branches/list');
      } else {
        toast.error(response.data.message || 'Operation failed.');
      }
    } catch (error) {
      toast.error('Critical submission error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 animate-fade-in max-w-4xl text-left">
      <div className="flex items-center justify-between mb-10">
        <button 
          onClick={() => navigate('/branches/list')}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <FaArrowLeft /> Back to Network
        </button>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
          {isEdit ? 'Configure Node' : 'Register New Node'}
        </h2>
      </div>

      <FormCard>
        <form onSubmit={handleSubmit} className="space-y-8 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Branch Name */}
            <div className="group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-indigo-600 transition-colors">Location Name</label>
              <div className="relative">
                <FaBuilding className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-all" />
                <input
                  type="text"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleChange}
                  placeholder="e.g. Downtown Central"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-700 shadow-inner"
                  required
                />
              </div>
            </div>

            {/* Branch Code */}
            <div className="group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-indigo-600 transition-colors">Network Code</label>
              <div className="relative">
                <FaBarcode className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-all" />
                <input
                  type="text"
                  name="branchCode"
                  value={formData.branchCode}
                  onChange={handleChange}
                  placeholder="e.g. NYC-01"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-700 shadow-inner"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-indigo-600 transition-colors">Direct Phone</label>
              <div className="relative">
                <FaPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-all" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-700 shadow-inner"
                />
              </div>
            </div>

            {/* Email */}
            <div className="group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-indigo-600 transition-colors">Node Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-all" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="manager@branch.com"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-700 shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="group">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block group-focus-within:text-indigo-600 transition-colors">Physical Address</label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-5 top-5 text-slate-300 group-focus-within:text-indigo-600 transition-all" />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full operational address..."
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-700 shadow-inner min-h-[120px]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/branches/list')}
              className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 text-[11px] uppercase tracking-[0.2em] flex items-center gap-3"
            >
              {isLoading ? 'Syncing...' : <><FaSave /> Save Configuration</>}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
}
