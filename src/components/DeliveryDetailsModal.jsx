
import React, { useState } from 'react';

const DeliveryDetailsModal = ({ isOpen, onClose, onSave, customers, staffMembers }) => {
  const [customer, setCustomer] = React.useState('');
  const [driver, setDriver] = React.useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Delivery Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer</label>
            <select 
              value={customer} 
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c.customerID} value={c.customerID}>{c.customerName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Driver</label>
            <select 
              value={driver} 
              onChange={(e) => setDriver(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Driver</option>
              {staffMembers.map(s => <option key={s.staffID} value={s.staffID}>{s.staffName}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md">Cancel</button>
          <button onClick={() => onSave({ customer, driver })} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetailsModal;
