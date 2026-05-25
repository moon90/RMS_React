import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStockTransactionById } from '../../services/stockTransactionService';
import StockTransactionAdd from './StockTransactionAdd.jsx';
import { toast } from 'react-toastify';
import { FaExchangeAlt, FaArrowLeft } from 'react-icons/fa';

const StockTransactionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await getStockTransactionById(id);
        if (response.data.isSuccess) {
          setTransaction(response.data.data);
        } else {
          toast.error('Failed to retrieve transaction protocol.');
          navigate('/stock-transactions/list');
        }
      } catch (error) {
        toast.error('Critical failure: Protocol retrieval interrupted.');
        navigate('/stock-transactions/list');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransaction();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-6 text-xs font-black text-gray-300 uppercase tracking-widest animate-pulse">Retrieving Protocol...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8 flex items-center justify-between text-left">
        <button 
          onClick={() => navigate('/stock-transactions/list')}
          className="flex items-center gap-2 px-6 py-3 bg-white text-gray-500 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md hover:text-blue-600 transition-all border border-gray-50"
        >
          <FaArrowLeft /> Back to Registry
        </button>
        <div className="flex items-center gap-3">
          <FaExchangeAlt className="text-blue-200 text-2xl" />
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Protocol ID: {id}</span>
        </div>
      </div>

      <StockTransactionAdd 
        isEdit={true} 
        transactionData={transaction} 
        onSave={() => navigate('/stock-transactions/list')}
        onClose={() => navigate('/stock-transactions/list')}
      />
    </div>
  );
};

export default StockTransactionEdit;