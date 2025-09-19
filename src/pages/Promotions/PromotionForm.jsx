import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import promotionService from '../../services/promotionService';
import FormCard from '../../components/FormCard.jsx';
import { useAuth } from '../../context/AuthContext';
import { hasMenuPermission } from '../../utils/permissionUtils';

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

const PromotionForm = ({ isEdit }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [promotion, setPromotion] = useState({
        couponCode: '',
        discountAmount: 0,
        discountPercentage: 0,
        description: '',
        validFrom: '',
        validTo: '',
        isActive: true,
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { user } = useAuth();
    const canCreate = hasMenuPermission('PROMOTION_CREATE');
    const canEdit = hasMenuPermission('PROMOTION_UPDATE');

    useEffect(() => {
        if (isEdit) {
            if (!canEdit) {
                navigate('/access-denied');
                return;
            }
            fetchPromotion(id);
        } else {
            if (!canCreate) {
                navigate('/access-denied');
                return;
            }
        }
    }, [isEdit, id, canCreate, canEdit, navigate]);

    const fetchPromotion = async (promotionId) => {
        setLoading(true);
        try {
            const response = await promotionService.getPromotionById(promotionId);
            const data = response.data.data;
            setPromotion({
                ...data,
                validFrom: data.validFrom ? new Date(data.validFrom).toISOString().split('T')[0] : '',
                validTo: data.validTo ? new Date(data.validTo).toISOString().split('T')[0] : '',
            });
        } catch (err) {
            toast.error('Failed to fetch promotion details.');
            navigate('/promotions/list');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPromotion((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            if (isEdit) {
                await promotionService.updatePromotion(id, promotion);
                toast.success('Promotion updated successfully!');
            } else {
                await promotionService.createPromotion(promotion);
                toast.success('Promotion created successfully!');
            }
            navigate('/promotions/list');
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
        } finally {
            setLoading(false);
        }
    };

    if ((isEdit && !canEdit) || (!isEdit && !canCreate)) {
        return null; // Or a loading spinner/message while redirecting
    }

    return (
        <div className="p-3 max-w-4xl mx-auto">
            <FormCard>
                <h2 className="text-2xl font-bold mb-6 text-[#424242]">{isEdit ? 'Edit Promotion' : 'Add New Promotion'}</h2>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label htmlFor="couponCode" className="block text-sm font-medium text-[#424242] mb-1">
                                Coupon Code
                            </label>
                            <input
                                type="text"
                                name="couponCode"
                                id="couponCode"
                                value={promotion.couponCode}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border ${errors.couponCode ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#E65100] focus:outline-none`}
                                required
                            />
                            {errors.couponCode && <p className="text-red-500 text-xs mt-1">{errors.couponCode}</p>}
                        </div>
                        <div>
                            <label htmlFor="discountAmount" className="block text-sm font-medium text-[#424242] mb-1">
                                Discount Amount
                            </label>
                            <input
                                type="number"
                                name="discountAmount"
                                id="discountAmount"
                                value={promotion.discountAmount}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border ${errors.discountAmount ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#E65100] focus:outline-none`}
                                step="0.01"
                            />
                            {errors.discountAmount && <p className="text-red-500 text-xs mt-1">{errors.discountAmount}</p>}
                        </div>
                        <div>
                            <label htmlFor="discountPercentage" className="block text-sm font-medium text-[#424242] mb-1">
                                Discount Percentage
                            </label>
                            <input
                                type="number"
                                name="discountPercentage"
                                id="discountPercentage"
                                value={promotion.discountPercentage}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border ${errors.discountPercentage ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#E65100] focus:outline-none`}
                                step="0.01"
                            />
                            {errors.discountPercentage && <p className="text-red-500 text-xs mt-1">{errors.discountPercentage}</p>}
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-[#424242] mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                id="description"
                                value={promotion.description}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#E65100] focus:outline-none`}
                            ></textarea>
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                        </div>
                        <div>
                            <label htmlFor="validFrom" className="block text-sm font-medium text-[#424242] mb-1">
                                Valid From
                            </label>
                            <input
                                type="date"
                                name="validFrom"
                                id="validFrom"
                                value={promotion.validFrom}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border ${errors.validFrom ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#E65100] focus:outline-none`}
                                required
                            />
                            {errors.validFrom && <p className="text-red-500 text-xs mt-1">{errors.validFrom}</p>}
                        </div>
                        <div>
                            <label htmlFor="validTo" className="block text-sm font-medium text-[#424242] mb-1">
                                Valid To
                            </label>
                            <input
                                type="date"
                                name="validTo"
                                id="validTo"
                                value={promotion.validTo}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border ${errors.validTo ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#E65100] focus:outline-none`}
                                required
                            />
                            {errors.validTo && <p className="text-red-500 text-xs mt-1">{errors.validTo}</p>}
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isActive"
                                id="isActive"
                                checked={promotion.isActive}
                                onChange={handleChange}
                                className="mr-2 h-4 w-4 text-[#E65100] focus:ring-[#E65100] border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-[#424242]">
                                Is Active
                            </label>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/promotions/list')}
                            className="px-5 py-2 rounded-md bg-[#F5F5F5] text-[#424242] hover:bg-[#E0E0E0] border border-gray-300 transition"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-md bg-[#E65100] text-white hover:bg-[#D84315] transition font-medium shadow"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (isEdit ? 'Update Promotion' : 'Add Promotion')}
                        </button>
                    </div>
                </form>
            </FormCard>
        </div>
    );
};

export default PromotionForm;