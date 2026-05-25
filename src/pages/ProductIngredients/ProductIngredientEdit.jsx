import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductIngredientById } from '../../services/productIngredientService';
import ProductIngredientAdd from './ProductIngredientAdd.jsx';
import { toast } from 'react-toastify';
import { FaFlask, FaArrowLeft } from 'react-icons/fa';

const ProductIngredientEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComponent = async () => {
      try {
        const response = await getProductIngredientById(id);
        if (response.data.isSuccess) {
          setData(response.data.data);
        } else {
          toast.error('Failed to retrieve formula protocol.');
          navigate('/product-ingredients/list');
        }
      } catch (error) {
        toast.error('Critical failure: Protocol retrieval interrupted.');
        navigate('/product-ingredients/list');
      } finally {
        setIsLoading(false);
      }
    };
    fetchComponent();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-purple-50 border-t-purple-600 rounded-full animate-spin"></div>
        <p className="mt-6 text-xs font-black text-gray-300 uppercase tracking-widest animate-pulse text-left">Retrieving Protocol...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl text-left">
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={() => navigate('/product-ingredients/list')}
          className="flex items-center gap-2 px-6 py-3 bg-white text-gray-500 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md hover:text-purple-600 transition-all border border-gray-50"
        >
          <FaArrowLeft /> Back to Formula Registry
        </button>
        <div className="flex items-center gap-3">
          <FaFlask className="text-purple-200 text-2xl" />
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Component ID: PI-{id}</span>
        </div>
      </div>

      <ProductIngredientAdd 
        isEdit={true} 
        data={data} 
        onSave={() => navigate('/product-ingredients/list')}
        onClose={() => navigate('/product-ingredients/list')}
      />
    </div>
  );
};

export default ProductIngredientEdit;
