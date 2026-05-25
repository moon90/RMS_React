import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FiShoppingBag, FiChevronRight, FiPrinter } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';
import { formatCurrency } from '../../../utils/currencyUtils';

const CartPanel = React.memo(({ 
    cart, 
    selectedCartItemIndex, 
    handleCartItemQuantityChange, 
    removeCartItem, 
    calculateTotal, 
    calculateTax,
    calculateServiceCharge,
    calculateGrandTotal,
    setShowCheckoutModal, 
    validateOrder, 
    orderFormData, 
    recalledOrderId,
    handlePrintOrder,
    currencyCode,
    currencySymbol
}) => {
    const { t } = useTranslation();
    return (
    <div className="flex flex-col h-full animate-fade-in-right">
        <div className="p-4 sm:p-6 border-b border-slate-50 bg-slate-50/30">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-600 rounded-xl text-white shadow-lg">
                    <FiShoppingBag />
                </div>
                {t('pos.cart')}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
                {orderFormData.orderType ? (
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${orderFormData.orderType === 'DineIn' ? 'bg-red-100 text-red-600 border border-red-200' : orderFormData.orderType === 'TakeOut' ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-green-100 text-green-600 border border-green-200'}`}>
                        {orderFormData.orderType === 'DineIn' ? t('pos.dine_in') : orderFormData.orderType === 'TakeOut' ? t('pos.take_away') : t('pos.delivery')}
                    </span>
                ) : (
                    <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-400 border border-slate-200 text-[9px] font-black uppercase tracking-widest animate-pulse">
                        {t('pos.order_type')}
                    </span>
                )}
                {orderFormData.tableName && (
                    <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-black uppercase tracking-widest">
                        Table: {orderFormData.tableName}
                    </span>
                )}
                {orderFormData.waiterName && (
                    <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-black uppercase tracking-widest">
                        Waiter: {orderFormData.waiterName}
                    </span>
                )}
            </div>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar p-2 sm:p-4 space-y-2">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                    <FiShoppingBag size={60} className="text-slate-300" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-4 text-slate-400">{t('pos.cart_empty')}</p>
                </div>
            ) : (
                cart.map((item, index) => (
                    <div
                        key={index}
                        className={`group p-2 sm:p-3 rounded-xl border transition-all duration-300 ${selectedCartItemIndex === index ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-100 hover:border-blue-100'}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 flex-shrink-0 bg-slate-50 rounded-lg flex items-center justify-center font-black text-slate-400 text-[10px] group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    {index + 1}
                                </div>
                                <div className="min-w-0">
                                    <h5 className="font-black text-slate-800 text-xs tracking-tight truncate">{item.productName}</h5>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                                        {formatCurrency(item.price, currencyCode, currencySymbol)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeCartItem(index)}
                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all flex-shrink-0"
                            >
                                <FaTrash size={12} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-100">
                                <button
                                    onClick={() => handleCartItemQuantityChange(index, Math.max(1, item.quantity - 1))}
                                    className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white hover:text-blue-600 transition-all font-black text-xs"
                                >-</button>
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleCartItemQuantityChange(index, e.target.value)}
                                    className="w-8 bg-transparent text-center font-black text-slate-700 text-xs outline-none"
                                    min="1"
                                />
                                <button
                                    onClick={() => handleCartItemQuantityChange(index, item.quantity + 1)}
                                    className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white hover:text-blue-600 transition-all font-black text-xs"
                                >+</button>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-black text-slate-900 tracking-tighter">
                                    {formatCurrency(item.amount, currencyCode, currencySymbol)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        <div className="p-5 sm:p-6 bg-slate-900 text-white rounded-t-[2.5rem] shadow-2xl shadow-slate-900/50">
            <div className="space-y-2 mb-4 px-2 opacity-80 border-b border-white/5 pb-4">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Subtotal</span>
                    <span>{formatCurrency(calculateTotal(), currencyCode, currencySymbol)}</span>
                </div>
                {orderFormData.orderType === 'DineIn' && (
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Service Charge</span>
                        <span>{formatCurrency(typeof calculateServiceCharge === 'function' ? calculateServiceCharge() : 0, currencyCode, currencySymbol)}</span>
                    </div>
                )}
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Tax / VAT</span>
                    <span>{formatCurrency(typeof calculateTax === 'function' ? calculateTax() : 0, currencyCode, currencySymbol)}</span>
                </div>
            </div>

            <div className="flex justify-between items-center mb-5 px-2">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Final Amount</p>
                        <h3 className="text-2xl sm:text-3xl font-black tracking-tighter leading-none">
                            {formatCurrency(typeof calculateGrandTotal === 'function' ? calculateGrandTotal() : calculateTotal(), currencyCode, currencySymbol)}
                        </h3>
                    </div>
                </div>
                <div className="bg-white/10 px-3 py-1.5 rounded-lg">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{cart.length} Items</p>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => {
                        const orderForManualPrint = {
                            ...orderFormData,
                            total: calculateTotal(),
                            orderID: recalledOrderId || 'New',
                            orderDetails: cart.map(item => ({
                                ...item,
                                amount: item.amount
                            }))
                        };
                        handlePrintOrder(orderForManualPrint);
                    }}
                    disabled={cart.length === 0}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black py-3.5 sm:py-4 rounded-xl text-[10px] uppercase tracking-[0.15em] transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <FiPrinter /> {t('pos.print')}
                </button>
                <button
                    onClick={() => {
                        // Relaxing the KOT requirement for fast-paced checkout (TakeAway/Delivery)
                        if (!recalledOrderId && orderFormData.orderType === 'DineIn') {
                            toast.warn(t('pos.kot_required_dinein'));
                            return;
                        }

                        const errors = validateOrder();
                        if (Object.keys(errors).length > 0) {
                            Object.values(errors).forEach(err => toast.error(err));
                            return;
                        }
                        setShowCheckoutModal(true);
                    }}
                    disabled={cart.length === 0}
                    className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-black py-3.5 sm:py-4 rounded-xl text-[10px] uppercase tracking-[0.15em] transition-all shadow-2xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {t('pos.checkout')} <FiChevronRight />
                </button>
            </div>
            <p className="text-center text-[8px] font-black text-slate-500 uppercase tracking-widest mt-4">Alt+C to checkout</p>
        </div>
    </div>
    );
});

CartPanel.displayName = 'CartPanel';

export default CartPanel;
