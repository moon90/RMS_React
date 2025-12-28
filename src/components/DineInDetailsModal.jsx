
import React, { useState } from 'react';

const DineInDetailsModal = ({ isOpen, onClose, onSave, diningTables, staffMembers }) => {
  const [table, setTable] = React.useState('');
  const [waiter, setWaiter] = React.useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Dine-In Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Table</label>
            <select 
              value={table} 
              onChange={(e) => setTable(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Table</option>
              {diningTables.map(t => <option key={t.tableID} value={t.tableName}>{t.tableName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Waiter</label>
            <select 
              value={waiter} 
              onChange={(e) => setWaiter(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Waiter</option>
              {staffMembers.map(s => <option key={s.staffID} value={s.staffName}>{s.staffName}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md">Cancel</button>
          <button onClick={() => onSave({ table, waiter })} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
        </div>
      </div>
    </div>
  );
};

export default DineInDetailsModal;
