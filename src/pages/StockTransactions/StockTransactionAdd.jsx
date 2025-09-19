import React, { useState, useEffect } from 'react';
import { createStockTransaction } from '../../services/stockTransactionService';
import { getAllProducts } from '../../services/productService';
import { getAllSuppliers } from '../../services/supplierService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import FormCard from '../../components/FormCard.jsx';
import { toast } from 'react-toastify';

const ValidationToast = ({ title, messages }) => (
  <div>
    <strong>{title}</strong>
    <ul style={{ whiteSpace: 'pre-wrap', textAlign: 'left', paddingLeft: '20px' }}>
      {messages.map((msg, index) => (
        <li key={index}>{msg}</li>
      ))}
    </ul>
  </div>
);

const StockTransactionAdd = () => {
  const [productID, setProductID] = useState('');
  const [supplierID, setSupplierID] = useState('');
  const [transactionType, setTransactionType] = useState('IN');
  const [quantity, setQuantity] = useState('');
  const [remarks, setRemarks] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 10));
  const [expireDate, setExpireDate] = useState('');
  const [saleID, setSaleID] = useState('');
  const [purchaseID, setPurchaseID] = useState('');
  const [transactionSource, setTransactionSource] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('');
  const [reason, setReason] = useState('');
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [errors, setErrors] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  const canCreate = user?.permissions?.includes('STOCK_TRANSACTION_CREATE');

  useEffect(() => {
    if (!canCreate) {
      navigate('/access-denied');
    }

    const fetchDependencies = async () => {
      try {
        const [productsRes, suppliersRes] = await Promise.all([
          getAllProducts({ pageNumber: 1, pageSize: 1000, status: true }),
          getAllSuppliers({ pageNumber: 1, pageSize: 1000, status: true }),
        ]);

        if (productsRes.data.isSuccess) {
          setProducts(productsRes.data.data.items);
        }
        if (suppliersRes.data.isSuccess) {
          setSuppliers(suppliersRes.data.data.items);
        }
      } catch (error) {
        toast.error('Failed to load dependencies.');
        console.error(error);
      }
    };

    fetchDependencies();
  }, [canCreate, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const stockTransactionData = {
        productID: parseInt(productID),
        supplierID: supplierID ? parseInt(supplierID) : null,
        transactionType: transactionType,
        quantity: parseInt(quantity),
        remarks: remarks,
        transactionDate: transactionDate,
        expireDate: expireDate ? expireDate : null,
        saleID: saleID ? parseInt(saleID) : null,
        purchaseID: purchaseID ? parseInt(purchaseID) : null,
        transactionSource: transactionSource,
        adjustmentType: adjustmentType || null,
        reason: reason || null,
      };

      await createStockTransaction(stockTransactionData);
      toast.success('Stock transaction created successfully!');
      navigate('/stock-transactions/list');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.details) {
        const newErrors = {};
        const errorMessages = err.response.data.details.map(error => {
          newErrors[error.propertyName.toLowerCase()] = error.errorMessage;
          return `- ${error.errorMessage}`;
        });
        setErrors(newErrors);
        toast.error(<ValidationToast title={err.response.data.message} messages={errorMessages} />);
      } else {
        toast.error(err.response?.data?.message || err.message || 'An error occurred.');
      }
      console.error(err);
    }
  };

  if (!canCreate) {
    return null;
  }

  return (
    <div className="p-3 max-w-4xl mx-auto">
      <FormCard>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Stock Transaction</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="productID" className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <select
                id="productID"
                name="productID"
                value={productID}
                onChange={(e) => setProductID(e.target.value)}
                required
                className={`w-full px-4 py-2 border ${errors.productID ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              >
                <option value="">Select Product</option>
                {products.map(prod => (
                  <option key={prod.id} value={prod.id}>{prod.productName}</option>
                ))}
              </select>
              {errors.productID && <p className="text-red-500 text-xs mt-1">{errors.productID}</p>}
            </div>
            <div>
              <label htmlFor="supplierID" className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <select
                id="supplierID"
                name="supplierID"
                value={supplierID}
                onChange={(e) => setSupplierID(e.target.value)}
                className={`w-full px-4 py-2 border ${errors.supplierID ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              >
                <option value="">Select Supplier</option>
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.supplierName}</option>
                ))}
              </select>
              {errors.supplierID && <p className="text-red-500 text-xs mt-1">{errors.supplierID}</p>}
            </div>
            <div>
              <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
              <select
                id="transactionType"
                name="transactionType"
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                required
                className={`w-full px-4 py-2 border ${errors.transactionType ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              >
                <option value="IN">IN</option>
                <option value="OUT">OUT</option>
                <option value="ADJUSTMENT">ADJUSTMENT</option>
              </select>
              {errors.transactionType && <p className="text-red-500 text-xs mt-1">{errors.transactionType}</p>}
            </div>
            {transactionType === 'ADJUSTMENT' && (
              <>
                <div>
                  <label htmlFor="adjustmentType" className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type</label>
                  <select
                    id="adjustmentType"
                    name="adjustmentType"
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value)}
                    required
                    className={`w-full px-4 py-2 border ${errors.adjustmentType ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                  >
                    <option value="">Select Adjustment Type</option>
                    <option value="Addition">Addition</option>
                    <option value="Subtraction">Subtraction</option>
                  </select>
                  {errors.adjustmentType && <p className="text-red-500 text-xs mt-1">{errors.adjustmentType}</p>}
                </div>
                <div className="col-span-2">
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={reason}
                    placeholder="Enter reason for adjustment"
                    onChange={(e) => setReason(e.target.value)}
                    rows="3"
                    required
                    className={`w-full px-4 py-2 border ${errors.reason ? 'border-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                  ></textarea>
                  {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
                </div>
              </>
            )}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={quantity}
                placeholder="Enter quantity"
                onChange={(e) => setQuantity(e.target.value)}
                required
                className={`w-full px-4 py-2 border ${errors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700 mb-1">Transaction Date</label>
              <input
                type="date"
                id="transactionDate"
                name="transactionDate"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                required
                className={`w-full px-4 py-2 border ${errors.transactionDate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.transactionDate && <p className="text-red-500 text-xs mt-1">{errors.transactionDate}</p>}
            </div>
            <div>
              <label htmlFor="expireDate" className="block text-sm font-medium text-gray-700 mb-1">Expire Date</label>
              <input
                type="date"
                id="expireDate"
                name="expireDate"
                value={expireDate}
                onChange={(e) => setExpireDate(e.target.value)}
                className={`w-full px-4 py-2 border ${errors.expireDate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.expireDate && <p className="text-red-500 text-xs mt-1">{errors.expireDate}</p>}
            </div>
            <div>
              <label htmlFor="saleID" className="block text-sm font-medium text-gray-700 mb-1">Sale ID</label>
              <input
                type="number"
                id="saleID"
                name="saleID"
                value={saleID}
                placeholder="Enter sale ID"
                onChange={(e) => setSaleID(e.target.value)}
                className={`w-full px-4 py-2 border ${errors.saleID ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.saleID && <p className="text-red-500 text-xs mt-1">{errors.saleID}</p>}
            </div>
            <div>
              <label htmlFor="purchaseID" className="block text-sm font-medium text-gray-700 mb-1">Purchase ID</label>
              <input
                type="number"
                id="purchaseID"
                name="purchaseID"
                value={purchaseID}
                placeholder="Enter purchase ID"
                onChange={(e) => setPurchaseID(e.target.value)}
                className={`w-full px-4 py-2 border ${errors.purchaseID ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.purchaseID && <p className="text-red-500 text-xs mt-1">{errors.purchaseID}</p>}
            </div>
            <div>
              <label htmlFor="transactionSource" className="block text-sm font-medium text-gray-700 mb-1">Transaction Source</label>
              <input
                type="text"
                id="transactionSource"
                name="transactionSource"
                value={transactionSource}
                placeholder="Enter transaction source"
                onChange={(e) => setTransactionSource(e.target.value)}
                className={`w-full px-4 py-2 border ${errors.transactionSource ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.transactionSource && <p className="text-red-500 text-xs mt-1">{errors.transactionSource}</p>}
            </div>
            <div className="col-span-2">
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea
                id="remarks"
                name="remarks"
                value={remarks}
                placeholder="Enter remarks"
                onChange={(e) => setRemarks(e.target.value)}
                rows="3"
                className={`w-full px-4 py-2 border ${errors.remarks ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              ></textarea>
              {errors.remarks && <p className="text-red-500 text-xs mt-1">{errors.remarks}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/stock-transactions/list')}
              className="px-5 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium shadow"
            >
              Add Stock Transaction
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default StockTransactionAdd;