import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { salesService } from '../../services/salesService';
import SalesAdd from './SalesAdd.jsx';
import { toast } from 'react-toastify';
import { FaChartBar, FaArrowLeft } from 'react-icons/fa';

const SalesEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const response = await salesService.getSaleById(id);
        if (response.data.isSuccess) {
          setData(response.data.data);
        } else {
          toast.error('Failed to retrieve revenue protocol.');
          navigate('/sales');
        }
      } catch (error) {
        toast.error('Critical failure: Protocol retrieval interrupted.');
        navigate('/sales');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSale();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-6 text-xs font-black text-gray-300 uppercase tracking-widest animate-pulse text-left">Retrieving Revenue Node...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl text-left">
      <div className="mb-8 flex items-center justify-between text-left">
        <button 
          onClick={() => navigate('/sales')}
          className="flex items-center gap-2 px-6 py-3 bg-white text-gray-500 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md hover:text-blue-600 transition-all border border-gray-50"
        >
          <FaArrowLeft /> Back to Registry
        </button>
        <div className="flex items-center gap-3">
          <FaChartBar className="text-blue-200 text-2xl" />
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Entry ID: SR-{id}</span>
        </div>
      </div>

      <SalesAdd 
        isEdit={true} 
        data={data} 
        onSave={() => navigate('/sales')}
        onClose={() => navigate('/sales')}
      />
    </div>
  );
};

export default SalesEdit;
