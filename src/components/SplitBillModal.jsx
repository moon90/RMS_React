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

    const handleSplit = () => {
        onSplit(splits);
    };

    if (!show) {
        return null;
    }

    return (
        <div className="modal show" style={{ display: 'block' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Split Bill</h5>
                        <button type="button" className="btn-close" onClick={onHide}></button>
                    </div>
                    <div className="modal-body">
                        {splits.map((split, index) => (
                            <div key={index} className="row mb-3">
                                <div className="col">
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Amount"
                                        value={split.amount}
                                        onChange={(e) => handleSplitChange(index, 'amount', e.target.value)}
                                    />
                                </div>
                                <div className="col">
                                    <select
                                        className="form-select"
                                        value={split.paymentMethod}
                                        onChange={(e) => handleSplitChange(index, 'paymentMethod', e.target.value)}
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Card">Card</option>
                                        <option value="MobilePay">MobilePay</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                        <button type="button" className="btn btn-primary" onClick={handleAddSplit}>Add Split</button>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onHide}>Close</button>
                        <button type="button" className="btn btn-primary" onClick={handleSplit}>Split</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SplitBillModal;
