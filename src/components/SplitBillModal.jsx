import React, { useState } from 'react';

const SplitBillModal = ({ show, onHide, onSplit }) => {
    const [splits, setSplits] = useState([{ amount: '', paymentMethod: 'Cash' }]);

    const handleAddSplit = () => {
        setSplits([...splits, { amount: '', paymentMethod: 'Cash' }]);
    };

    const handleSplitChange = (index, field, value) => {
        const newSplits = [...splits];
        newSplits[index][field] = value;
        setSplits(newSplits);
    };

    const handleRemoveSplit = (index) => {
        if (splits.length > 1) {
            const newSplits = splits.filter((_, i) => i !== index);
            setSplits(newSplits);
        }
    };

    const handleSplit = () => {
        onSplit(splits);
    };

    if (!show) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Split Bill</h2>
                    <button 
                        type="button" 
                        className="text-gray-500 hover:text-red-500 text-3xl font-bold transition-colors" 
                        onClick={onHide}
                    >
                        &times;
                    </button>
                </div>
                
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                    {splits.map((split, index) => (
                        <div key={index} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                    placeholder="0.00"
                                    value={split.amount}
                                    onChange={(e) => handleSplitChange(index, 'amount', e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                    value={split.paymentMethod}
                                    onChange={(e) => handleSplitChange(index, 'paymentMethod', e.target.value)}
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                    <option value="MobilePay">MobilePay</option>
                                </select>
                            </div>
                            {splits.length > 1 && (
                                <button 
                                    className="mt-6 text-red-500 hover:text-red-700 font-bold p-2"
                                    onClick={() => handleRemoveSplit(index)}
                                    title="Remove Split"
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    ))}
                    
                    <button 
                        type="button" 
                        className="w-full border-2 border-dashed border-gray-300 text-gray-600 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 font-semibold py-3 rounded-lg transition-colors"
                        onClick={handleAddSplit}
                    >
                        + Add Another Split
                    </button>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button 
                        type="button" 
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors" 
                        onClick={onHide}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors" 
                        onClick={handleSplit}
                    >
                        Confirm Split
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SplitBillModal;
