import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiTruck, FiUser, FiArrowRight, FiTarget } from 'react-icons/fi';

const DeliveryDetailsModal = ({ isOpen, onClose, onSave, customers, staffMembers }) => {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (selectedCustomer && selectedDriver) {
      const customer = customers.find(c => (c.customerID || c.customerId) === parseInt(selectedCustomer));
      const driver = staffMembers.find(s => (s.staffID || s.staffId) === parseInt(selectedDriver));
      
      onSave({ customer: parseInt(selectedCustomer), driver: parseInt(selectedDriver) });
      toast.success(`Delivery: ${customer?.customerName || 'Customer'} assigned to ${driver?.staffName || 'Driver'}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-white/20 animate-scale-in">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
              <FiTruck className="text-white text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Delivery</h3>
              <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-[0.2em] pl-1">Order Dispatch</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg text-slate-300 hover:text-red-500 transition-all border border-slate-50"><FiX size={24}/></button>
        </div>

        <div className="p-10 space-y-8">
          <div className="space-y-3 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Select Customer</label>
            <div className="relative group">
              <FiUser className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full pl-14 pr-10 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-100 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.customerID || customer.customerId} value={customer.customerID || customer.customerId}>
                    {customer.customerName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Assign Driver</label>
            <div className="relative group">
              <FiTarget className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full pl-14 pr-10 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-100 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
              >
                <option value="">Select Driver</option>
                {staffMembers.map(staff => (
                  <option key={staff.staffID || staff.staffId} value={staff.staffID || staff.staffId}>
                    {staff.staffName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!selectedCustomer || !selectedDriver}
            className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 hover:bg-emerald-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            Confirm <FiArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetailsModal;
