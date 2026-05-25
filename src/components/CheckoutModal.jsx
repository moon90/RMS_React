import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import promotionService from '../services/promotionService';
import { formatCurrency } from '../utils/currencyUtils';
import { 
  FiX, 
  FiCheckCircle, 
  FiPercent, 
  FiDollarSign, 
  FiCreditCard, 
  FiGift,
  FiArrowRight,
  FiHeart
} from 'react-icons/fi';

const CheckoutModal = ({
  isOpen,
  onClose,
  totalAmount,
  grandTotal,
  onProcessPayment,
  currencyCode = 'USD',
  currencySymbol = '$'
}) => {
  const [amountReceived, setAmountReceived] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [coupon, setCoupon] = useState('');
  const [appliedPromotionId, setAppliedPromotionId] = useState(null);
  const [change, setChange] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);
  const [isSplit, setIsSplit] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [splitPayments, setSplitPayments] = useState([{ amount: grandTotal || totalAmount, paymentMethod: 'Cash' }]);
  const amountInputRef = useRef(null);

  const finalAmount = Number(((grandTotal || totalAmount) - discount + tipAmount).toFixed(2));

  useEffect(() => {
    if (isOpen) {
        setDiscount(0);
        setDiscountPercent(0);
        setTipAmount(0);
        setCoupon('');
        setAppliedPromotionId(null);
        setPaymentMethod('Cash');
        const initialAmount = Number((grandTotal || totalAmount).toFixed(2));
        setAmountReceived(initialAmount);
        setIsSplit(false);
        setSplitPayments([{ amount: initialAmount, paymentMethod: 'Cash' }]);
        setTimeout(() => amountInputRef.current?.focus(), 100);
    }
  }, [isOpen, totalAmount, grandTotal]);

  useEffect(() => {
    if (!isSplit) {
      const calculatedChange = amountReceived - finalAmount;
      setChange(calculatedChange > 0 ? Number(calculatedChange.toFixed(2)) : 0);
    } else {
      setChange(0);
    }
  }, [amountReceived, finalAmount, isSplit]);

  const handleAddSplit = () => {
    setSplitPayments([...splitPayments, { amount: 0, paymentMethod: 'Cash' }]);
  };

  const handleSplitChange = (index, field, value) => {
    const newSplits = [...splitPayments];
    newSplits[index][field] = field === 'amount' ? (parseFloat(parseFloat(value).toFixed(2)) || 0) : value;
    setSplitPayments(newSplits);
  };

  const handleRemoveSplit = (index) => {
    if (splitPayments.length > 1) {
      setSplitPayments(splitPayments.filter((_, i) => i !== index));
    }
  };

  const calculateSplitTotal = () => Number(splitPayments.reduce((sum, s) => sum + s.amount, 0).toFixed(2));

  const handleDiscountChange = (value) => {
    const newDiscount = parseFloat(parseFloat(value).toFixed(2)) || 0;
    setDiscount(newDiscount);
    if (totalAmount > 0) setDiscountPercent(Number(((newDiscount / totalAmount) * 100).toFixed(2)));
    setAppliedPromotionId(null);
  };

  const handleDiscountPercentChange = (value) => {
    const newPercent = parseFloat(parseFloat(value).toFixed(2)) || 0;
    setDiscountPercent(newPercent);
    setDiscount(Number(((newPercent / 100) * totalAmount).toFixed(2)));
    setAppliedPromotionId(null);
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

        const roundedDiscount = Number(calculatedDiscount.toFixed(2));
        setDiscount(roundedDiscount);
        setDiscountPercent(totalAmount > 0 ? Number(((roundedDiscount / totalAmount) * 100).toFixed(2)) : 0);
        setAppliedPromotionId(promotion.promotionID);
        toast.success(`Coupon '${promotion.couponCode}' applied.`);
      } else {
        toast.error("Invalid or expired coupon.");
      }
    } catch (error) {
      toast.error("Failed to apply coupon.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-[98vh] overflow-hidden flex flex-col border border-white/20 animate-scale-in">
        
        {/* COMPACT HEADER */}
        <div className="px-6 py-4 sm:px-8 sm:py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-blue-600 rounded-xl sm:rounded-2xl shadow-lg">
              <FiCreditCard className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Checkout</h3>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md text-slate-300 hover:text-red-500 transition-all">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto no-scrollbar">
          
          {/* TOTALS GRID */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Amount</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter">
                {formatCurrency(totalAmount, currencyCode, currencySymbol)}
              </h2>
            </div>
            <div className="p-4 sm:p-5 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20">
              <span className="text-[8px] sm:text-[9px] font-black text-blue-200 uppercase tracking-widest block mb-1">Final Amount</span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tighter">
                {formatCurrency(finalAmount, currencyCode, currencySymbol)}
              </h2>
            </div>
          </div>

          {/* DISCOUNTS & OFFERS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
               <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                 <FiGift className="text-blue-500" /> Coupon
               </h4>
               <div className="relative group">
                 <input
                   type="text"
                   placeholder="Code"
                   value={coupon}
                   onChange={(e) => setCoupon(e.target.value)}
                   className="w-full pl-4 pr-16 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-slate-700 text-xs"
                 />
                 <button onClick={handleApplyCoupon} className="absolute right-1 top-1 bottom-1 px-3 bg-blue-600 text-white rounded-lg font-black text-[8px] uppercase tracking-widest hover:bg-blue-700">Apply</button>
               </div>
            </div>

            <div className="space-y-3">
               <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                 <FiPercent className="text-blue-500" /> Custom Discount
               </h4>
               <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">{currencySymbol}</span>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => handleDiscountChange(e.target.value)}
                      className="w-full pl-7 pr-2 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-slate-700 text-xs"
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">%</span>
                    <input
                      type="number"
                      value={discountPercent}
                      onChange={(e) => handleDiscountPercentChange(e.target.value)}
                      className="w-full pl-7 pr-2 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-slate-700 text-xs"
                    />
                  </div>
               </div>
            </div>
          </div>

          {/* TIP & SPLIT ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
             <div className="space-y-3">
                <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <FiHeart className="text-pink-500" /> Tip Amount
                </h4>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300 font-bold text-xs">{currencySymbol}</span>
                  <input
                    type="number"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(parseFloat(parseFloat(e.target.value).toFixed(2)) || 0)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-pink-100 transition-all font-bold text-slate-700 text-xs"
                  />
                </div>
             </div>

             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
               <div className="flex items-center gap-2">
                  <FiCreditCard className={isSplit ? 'text-blue-500' : 'text-slate-400'} />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Split Bill</span>
               </div>
               <button 
                 onClick={() => setIsSplit(!isSplit)}
                 className={`w-10 h-5 rounded-full relative transition-colors ${isSplit ? 'bg-blue-600' : 'bg-slate-300'}`}
               >
                 <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${isSplit ? 'left-5.5' : 'left-0.5'}`} />
               </button>
             </div>
          </div>

          {/* PAYMENT INPUT SECTION */}
          {!isSplit ? (
            <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex gap-2">
                {['Cash', 'Card', 'MobilePay'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      paymentMethod === method 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-6 items-center">
                <div>
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Amount Received</label>
                  <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 font-bold text-lg">{currencySymbol}</span>
                     <input
                      ref={amountInputRef}
                      type="number"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(parseFloat(parseFloat(e.target.value).toFixed(2)) || 0)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl outline-none focus:bg-white focus:text-slate-900 focus:border-blue-500 transition-all font-black text-xl text-white"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 block text-right">Change</label>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tighter">
                    {formatCurrency(change, currencyCode, currencySymbol)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
               {splitPayments.map((split, index) => (
                 <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <input 
                      type="number"
                      value={split.amount}
                      onChange={(e) => handleSplitChange(index, 'amount', e.target.value)}
                      className="flex-1 bg-transparent font-bold text-slate-700 outline-none text-xs"
                      placeholder="Amount"
                    />
                    <select 
                      value={split.paymentMethod}
                      onChange={(e) => handleSplitChange(index, 'paymentMethod', e.target.value)}
                      className="bg-slate-50 border-none rounded-lg px-2 py-1 text-[9px] font-black text-slate-500 outline-none"
                    >
                       <option value="Cash">Cash</option>
                       <option value="Card">Card</option>
                       <option value="MobilePay">MobilePay</option>
                    </select>
                    {splitPayments.length > 1 && (
                      <button onClick={() => handleRemoveSplit(index)} className="text-red-300 hover:text-red-500 p-1">
                         <FiX size={14}/>
                      </button>
                    )}
                 </div>
               ))}
               <button 
                 onClick={handleAddSplit}
                 className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-[8px] font-black uppercase text-slate-400 hover:text-blue-500 hover:border-blue-300 transition-all"
               >
                 + Add Method
               </button>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3.5 bg-slate-50 text-slate-400 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-100 active:scale-95 transition-all">Cancel</button>
            <button
              onClick={() => {
                const finalValidationAmount = Number(finalAmount.toFixed(2));
                if (!isSplit) {
                  const roundedReceived = Number(amountReceived.toFixed(2));
                  if (roundedReceived < finalValidationAmount) {
                    toast.error(`Required: ${formatCurrency(finalValidationAmount, currencyCode, currencySymbol)}`);
                    return;
                  }
                  onProcessPayment({ 
                    AmountReceived: roundedReceived, 
                    DiscountAmount: Number(discount.toFixed(2)), 
                    TipAmount: Number(tipAmount.toFixed(2)), 
                    AmountPaid: finalValidationAmount, 
                    ChangeAmount: Number(change.toFixed(2)), 
                    PromotionID: appliedPromotionId, 
                    IsSplit: false,
                    PaymentMethod: paymentMethod,
                    SplitPayments: []
                  });
                } else {
                  if (Math.abs(calculateSplitTotal() - finalValidationAmount) > 0.01) {
                    toast.error("Split total mismatch.");
                    return;
                  }
                  onProcessPayment({
                    AmountReceived: finalValidationAmount,
                    DiscountAmount: Number(discount.toFixed(2)),
                    TipAmount: Number(tipAmount.toFixed(2)),
                    AmountPaid: finalValidationAmount,
                    ChangeAmount: 0,
                    PromotionID: appliedPromotionId,
                    IsSplit: true,
                    PaymentMethod: 'Split',
                    SplitPayments: splitPayments
                  });
                }
              }}
              className="flex-[2] py-3.5 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Confirm Payment <FiArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;