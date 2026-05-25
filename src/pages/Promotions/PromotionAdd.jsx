import React, { useState, useEffect } from 'react';
import promotionService from '../../services/promotionService';
import { hasMenuPermission } from '../../utils/permissionUtils';
import FormCard from '../../components/FormCard.jsx';
import { toast } from 'react-toastify';
import { 
  FaTag, 
  FaSave, 
  FaUndo, 
  FaCheckCircle, 
  FaTimesCircle,
  FaCalendarAlt,
  FaPercentage,
  FaCoins,
  FaStickyNote
} from 'react-icons/fa';

const PromotionAdd = ({ isEdit = false, promotionData = null, onClose, onSave, showTitle = true }) => {
  const [formData, setFormData] = useState({
    couponCode: '',
    discountAmount: 0,
    discountPercentage: 0,
    description: '',
    validFrom: '',
    validTo: '',
    isActive: true
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const canCreate = hasMenuPermission('PROMOTION_CREATE');
  const canUpdate = hasMenuPermission('PROMOTION_UPDATE');

  useEffect(() => {
    if (isEdit && promotionData) {
      setFormData({
        promotionID: promotionData.promotionID || promotionData.id,
        couponCode: promotionData.couponCode || '',
        discountAmount: promotionData.discountAmount || 0,
        discountPercentage: promotionData.discountPercentage || 0,
        description: promotionData.description || '',
        validFrom: promotionData.validFrom ? new Date(promotionData.validFrom).toISOString().split('T')[0] : '',
        validTo: promotionData.validTo ? new Date(promotionData.validTo).toISOString().split('T')[0] : '',
        isActive: promotionData.isActive ?? true
      });
    }
  }, [isEdit, promotionData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleReset = () => {
    setErrors({});
    if (isEdit && promotionData) {
      setFormData({
        promotionID: promotionData.promotionID || promotionData.id,
        couponCode: promotionData.couponCode || '',
        discountAmount: promotionData.discountAmount || 0,
        discountPercentage: promotionData.discountPercentage || 0,
        description: promotionData.description || '',
        validFrom: promotionData.validFrom ? new Date(promotionData.validFrom).toISOString().split('T')[0] : '',
        validTo: promotionData.validTo ? new Date(promotionData.validTo).toISOString().split('T')[0] : '',
        isActive: promotionData.isActive ?? true
      });
    } else {
      setFormData({
        couponCode: '',
        discountAmount: 0,
        discountPercentage: 0,
        description: '',
        validFrom: '',
        validTo: '',
        isActive: true
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    if (isEdit && !canUpdate) {
      toast.error('Access Denied: Cannot update.');
      setIsLoading(false);
      return;
    }
    if (!isEdit && !canCreate) {
      toast.error('Access Denied: Cannot add.');
      setIsLoading(false);
      return;
    }

    const payload = {
      ...formData,
      discountAmount: parseFloat(formData.discountAmount),
      discountPercentage: parseFloat(formData.discountPercentage),
      validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : null,
      validTo: formData.validTo ? new Date(formData.validTo).toISOString() : null
    };

    try {
      let response;
      if (isEdit) {
        response = await promotionService.updatePromotion(payload.promotionID, payload);
      } else {
        response = await promotionService.createPromotion(payload);
      }

      if (response.data.isSuccess) {
        toast.success(isEdit ? 'Promotion updated.' : 'Promotion added.');
        if (onSave) onSave();
        if (onClose) onClose();
      } else {
        const errorResponse = response.data;
        if (errorResponse && errorResponse.details && errorResponse.details.length > 0) {
          const apiErrors = {};
          errorResponse.details.forEach(err => {
            apiErrors[err.propertyName.toLowerCase()] = err.errorMessage;
          });
          setErrors(apiErrors);
          toast.error('Error: Invalid promotion data.');
        } else {
          toast.error(errorResponse?.message || 'Server error.');
        }
      }
    } catch (error) {
      toast.error('Error: Promotion list unreachable.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-3 max-w-4xl mx-auto text-left">
      <FormCard>
        {showTitle && (
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
              <FaTag className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {isEdit ? 'Edit Promotion' : 'Add Promotion'}
              </h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1 text-left">Promotions</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Coupon Code */}
            <div className="relative group md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Coupon Code
              </label>
              <div className="relative">
                <FaTag className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  name="couponCode"
                  value={formData.couponCode}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.couponcode ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="e.g. SUMMER2024"
                  required
                />
              </div>
            </div>

            {/* Discount Percentage & Amount */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Discount (%)
              </label>
              <div className="relative">
                <FaPercentage className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="number"
                  step="0.01"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Discount (Amount)
              </label>
              <div className="relative">
                <FaCoins className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="number"
                  step="0.01"
                  name="discountAmount"
                  value={formData.discountAmount}
                  onChange={handleInputChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Validity Lifecycle */}
            <div className="relative group text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Start Date
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="date"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleInputChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700"
                  required
                />
              </div>
            </div>

            <div className="relative group text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                End Date
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="date"
                  name="validTo"
                  value={formData.validTo}
                  onChange={handleInputChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2 relative group text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Description
              </label>
              <div className="relative">
                <FaStickyNote className="absolute left-5 top-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700 resize-none"
                  placeholder="Enter description..."
                />
              </div>
            </div>

            {/* Status */}
            <div className="relative group md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors text-left">
                Status
              </label>
              <div className="flex gap-4 p-1 bg-gray-50 rounded-2xl border-2 border-transparent focus-within:border-blue-100 focus-within:bg-white transition-all">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isActive: true }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    formData.isActive ? 'bg-white text-green-600 shadow-sm border border-green-100' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <FaCheckCircle className={formData.isActive ? 'text-green-500' : 'text-gray-300'} /> Active
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isActive: false }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    !formData.isActive ? 'bg-white text-red-600 shadow-sm border border-red-100' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <FaTimesCircle className={!formData.isActive ? 'text-red-500' : 'text-gray-300'} /> Inactive
                </button>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-50">
            <button
              type="button"
              onClick={() => { handleReset(); if(onClose) onClose(); }}
              className="px-8 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 hover:text-gray-600 transition-all flex items-center gap-2"
            >
              <FaUndo /> Reset
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <FaSave /> {isLoading ? 'Updating...' : isEdit ? 'Save' : 'Add Promotion'}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default PromotionAdd;
