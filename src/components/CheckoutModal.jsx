import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import promotionService from '../services/promotionService';
import '../styles/POS.css';
import SplitBillModal from './SplitBillModal';

const CheckoutModal = ({
  isOpen,
  onClose,
  totalAmount,
  onProcessPayment,
}) => {
  const [amountReceived, setAmountReceived] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [coupon, setCoupon] = useState('');
  const [appliedPromotionId, setAppliedPromotionId] = useState(null);
  const [change, setChange] = useState(0);
  const [showSplitBillModal, setShowSplitBillModal] = useState(false);
  const amountInputRef = useRef(null);

  // Calculate final amount after discount
  const finalAmount = totalAmount - discount;

  useEffect(() => {
    if (isOpen) {
        setDiscount(0); // Reset discount when modal opens
        setDiscountPercent(0); // Reset discount percent
        setCoupon(''); // Reset coupon
        setAppliedPromotionId(null); // Reset applied promotion ID
        setAmountReceived(finalAmount); // Initialize amount received to final amount
        amountInputRef.current?.focus();
    }
  }, [isOpen, totalAmount, finalAmount]); // Depend on finalAmount

  useEffect(() => {
    const calculatedChange = amountReceived - finalAmount;
    setChange(calculatedChange > 0 ? calculatedChange : 0);
  }, [amountReceived, finalAmount]); // Depend on finalAmount

  const handleDiscountChange = (value) => {
    const newDiscount = parseFloat(value) || 0;
    setDiscount(newDiscount);
    if (totalAmount > 0) {
        const newPercent = (newDiscount / totalAmount) * 100;
        setDiscountPercent(newPercent); // Keep as number
    } else {
        setDiscountPercent(0);
    }
    setAppliedPromotionId(null); // Clear promotion if discount is manually changed
  };

  const handleDiscountPercentChange = (value) => {
    const newPercent = parseFloat(value) || 0;
    setDiscountPercent(newPercent);
    const newDiscount = (newPercent / 100) * totalAmount;
    setDiscount(newDiscount); // Keep as number
    setAppliedPromotionId(null); // Clear promotion if discount is manually changed
  };

  const handleApplyCoupon = async () => {
    if (!coupon) {
      toast.warn("Please enter a coupon code.");
      return;
    }

    try {
      const response = await promotionService.getPromotionByCouponCode(coupon);
      const promotion = response.data.data;

      if (promotion) {
        let calculatedDiscount = 0;
        if (promotion.discountPercentage > 0) {
          calculatedDiscount = (promotion.discountPercentage / 100) * totalAmount;
        } else if (promotion.discountAmount > 0) {
          calculatedDiscount = promotion.discountAmount;
        }

        setDiscount(calculatedDiscount);
        if (totalAmount > 0) {
            setDiscountPercent((calculatedDiscount / totalAmount) * 100);
        } else {
            setDiscountPercent(0);
        }
        setAppliedPromotionId(promotion.promotionID);
        toast.success(`Coupon '${promotion.couponCode}' applied successfully!`);
      } else {
        toast.error("Invalid or expired coupon.");
        setDiscount(0);
        setDiscountPercent(0);
        setAppliedPromotionId(null);
      }
    } catch (error) {
      toast.error("Failed to apply coupon.");
      setDiscount(0);
      setDiscountPercent(0);
      setAppliedPromotionId(null);
      console.error("Error applying coupon:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        onProcessPayment({ amountReceived, discount });
    }
  }

  const handleSplitPayment = (splits) => {
    onProcessPayment({ 
        AmountReceived: amountReceived, 
        DiscountAmount: discount, 
        AmountPaid: finalAmount, 
        ChangeAmount: change, 
        PromotionID: appliedPromotionId, 
        IsSplit: true, 
        SplitPayments: splits 
    });
    setShowSplitBillModal(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 checkout-modal">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg modal-content">
          <h2 className="text-3xl font-bold text-white mb-6">Checkout</h2>
          
          <div className="space-y-4 text-white">
            <div className="text-2xl font-semibold flex justify-between">
              <span>Total:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Coupon Code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
              <button 
                onClick={handleApplyCoupon}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Apply
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-1">
                  <label htmlFor="discount" className="block text-sm font-medium">Discount ($)</label>
                  <input
                  type="number"
                  id="discount"
                  value={discount.toFixed(2)}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
              </div>
              <div className="flex-1">
                  <label htmlFor="discountPercent" className="block text-sm font-medium">Discount (%)</label>
                  <input
                  type="number"
                  id="discountPercent"
                  value={discountPercent.toFixed(2)}
                  onChange={(e) => handleDiscountPercentChange(e.target.value)}
                  className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
              </div>
            </div>

            <div className="text-xl font-semibold flex justify-between">
              <span>Amount to Pay:</span>
              <span>${finalAmount.toFixed(2)}</span>
            </div>

            <div>
              <label htmlFor="amountReceived" className="block text-sm font-medium">Amount Received</label>
              <input
                ref={amountInputRef}
                type="number"
                id="amountReceived"
                value={amountReceived.toFixed(2)}
                onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            <div className="text-xl font-semibold flex justify-between">
              <span>Change:</span>
              <span>${change.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowSplitBillModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Split Bill
            </button>
            <button
              onClick={() => onProcessPayment({ AmountReceived: amountReceived, DiscountAmount: discount, AmountPaid: finalAmount, ChangeAmount: change, PromotionID: appliedPromotionId, IsSplit: false })}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Process Payment
            </button>
          </div>
        </div>
      </div>
      <SplitBillModal show={showSplitBillModal} onHide={() => setShowSplitBillModal(false)} onSplit={handleSplitPayment} />
    </>
  );
};

export default CheckoutModal;