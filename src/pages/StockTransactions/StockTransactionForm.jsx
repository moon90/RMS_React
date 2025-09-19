import React, { useState, useEffect } from 'react';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const StockTransactionForm = ({ isEdit, transactionData, onSave, onClose }) => {
  const [stockTransaction, setStockTransaction] = useState({
    productID: '',
    supplierID: '',
    transactionType: 'IN',
    quantity: '',
    remarks: '',
  });

  useEffect(() => {
    if (isEdit && transactionData) {
      setStockTransaction(transactionData);
    }
  }, [isEdit, transactionData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStockTransaction((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(stockTransaction);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit Stock Transaction' : 'Add Stock Transaction'}</h2>
      <TextField
        label="Product ID"
        name="productID"
        value={stockTransaction.productID}
        onChange={handleChange}
        fullWidth
        className="mb-4"
        disabled={isEdit}
      />
      <TextField
        label="Supplier ID"
        name="supplierID"
        value={stockTransaction.supplierID}
        onChange={handleChange}
        fullWidth
        className="mb-4"
      />
      <FormControl fullWidth className="mb-4">
        <InputLabel>Transaction Type</InputLabel>
        <Select
          name="transactionType"
          value={stockTransaction.transactionType}
          onChange={handleChange}
        >
          <MenuItem value="IN">IN</MenuItem>
          <MenuItem value="OUT">OUT</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Quantity"
        name="quantity"
        type="number"
        value={stockTransaction.quantity}
        onChange={handleChange}
        fullWidth
        className="mb-4"
      />
      <TextField
        label="Remarks"
        name="remarks"
        value={stockTransaction.remarks}
        onChange={handleChange}
        fullWidth
        className="mb-4"
      />
      <div className="flex justify-end">
        <Button onClick={onClose} className="mr-2">Cancel</Button>
        <Button type="submit" variant="contained" color="primary">
          {isEdit ? 'Save' : 'Submit'}
        </Button>
      </div>
    </form>
  );
};

export default StockTransactionForm;
