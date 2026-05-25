import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiCoffee, FiUser, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

const DineInDetailsModal = ({ isOpen, onClose, onSave, diningTables, staffMembers }) => {
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (selectedTable && selectedStaffId) {
      const staff = staffMembers.find(s => (s.staffID || s.staffId) === parseInt(selectedStaffId));
      onSave({ table: selectedTable, waiter: staff?.staffName || 'N/A', staffID: parseInt(selectedStaffId) });
      toast.success(`Dine-In: ${selectedTable} assigned to ${staff?.staffName}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-white/20 animate-scale-in">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-rose-500 rounded-2xl shadow-lg shadow-rose-500/20">
              <FiCoffee className="text-white text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Dine-In</h3>
              <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-[0.2em] pl-1">Table Assignment</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg text-slate-300 hover:text-red-500 transition-all border border-slate-50"><FiX size={24}/></button>
        </div>

        <div className="p-10 space-y-8">
          <div className="space-y-3 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Select Table</label>
            <div className="relative group">
              <FiCoffee className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" />
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full pl-14 pr-10 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-rose-100 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
              >
                <option value="">Select Table</option>
                {diningTables.map(table => (
                  <option key={table.id || table.tableID || table.tableId} value={table.tableName || table.TableName}>
                    {table.tableName || table.TableName} {table.capacity ? `(${table.capacity}p)` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Select Staff</label>
            <div className="relative group">
              <FiUser className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" />
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full pl-14 pr-10 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-rose-100 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
              >
                <option value="">Select Staff</option>
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
            disabled={!selectedTable || !selectedStaffId}
            className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-rose-500/20 hover:bg-rose-600 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            Confirm <FiArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DineInDetailsModal;
