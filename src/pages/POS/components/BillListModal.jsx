import React from 'react';
import { FiX, FiFilter, FiChevronRight, FiPrinter } from 'react-icons/fi';
import { FaHistory, FaClock } from 'react-icons/fa';
import { FiUser } from 'react-icons/fi';
import { formatCurrency } from '../../../utils/currencyUtils';

const BillListModal = ({ 
    isOpen, 
    onClose, 
    billList, 
    billStatusFilter, 
    setBillStatusFilter, 
    fetchAllBills, 
    handleRecallOrder,
    handlePrintOrder,
    currencyCode = 'USD',
    currencySymbol = '$'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-slate-800 rounded-3xl shadow-xl">
                            <FaHistory className="text-white text-2xl" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Order History</h3>
                            <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.2em] pl-1">Previous orders and bills</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group min-w-[200px]">
                            <FiFilter className="absolute top-1/2 left-5 -translate-y-1/2 text-slate-300" />
                            <select
                                value={billStatusFilter}
                                onChange={(e) => { setBillStatusFilter(e.target.value); fetchAllBills(e.target.value); }}
                                className="w-full appearance-none pl-12 pr-10 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-black text-[10px] uppercase tracking-widest text-slate-500 cursor-pointer"
                            >
                                <option value="">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Held">Held</option>
                            </select>
                        </div>
                        <button onClick={onClose} className="w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-2xl text-slate-300 hover:text-red-500 transition-all hover:rotate-90 border border-slate-50">
                            <FiX size={32} />
                        </button>
                    </div>
                </div>

                <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="grid grid-cols-1 gap-4">
                        {billList.length === 0 ? (
                            <div className="py-20 text-center opacity-20">
                                <FaHistory size={80} className="mx-auto mb-6" />
                                <p className="text-xl font-black uppercase tracking-widest">No Orders Found</p>
                            </div>
                        ) : (
                            billList.map((order, index) => {
                                const oId = order.orderID || order.orderId || order.id || order.Id;
                                const oType = order.orderType || order.OrderType || 'Standard';
                                const tName = order.tableName || order.TableName;
                                const oDate = order.orderDate || order.OrderDate;
                                const oTime = order.orderTime || order.OrderTime;
                                const oStatus = order.orderStatus || order.OrderStatus;
                                const pStatus = order.paymentStatus || order.PaymentStatus;
                                const oTotal = order.total || order.Total || 0;
                                const oDetails = order.orderDetails || order.OrderDetails || [];
                                const wName = order.waiterName || order.WaiterName;

                                return (
                                    <div key={oId || index} className="group flex flex-col p-6 bg-white border-2 border-slate-50 rounded-[2rem] hover:border-blue-100 hover:shadow-xl transition-all">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 text-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    #{oId}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <h5 className="font-black text-slate-800 text-lg tracking-tight uppercase">{oType}</h5>
                                                        {tName && (
                                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200">
                                                                Table: {tName}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            <FaClock size={10} className="text-slate-300" /> {oDate ? new Date(oDate).toLocaleDateString() : ''} {oTime}
                                                        </span>
                                                        <div className="flex gap-2">
                                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                                oStatus === 'Paid' ? 'bg-green-50 text-green-600' :
                                                                oStatus === 'Held' ? 'bg-amber-50 text-amber-600' :
                                                                oStatus === 'Pending' ? 'bg-blue-50 text-blue-600' :
                                                                oStatus === 'Preparing' ? 'bg-purple-50 text-purple-600' :
                                                                oStatus === 'Ready' ? 'bg-emerald-50 text-emerald-600' :
                                                                'bg-slate-50 text-slate-400'
                                                            }`}>
                                                                {oStatus}
                                                            </span>
                                                            {pStatus === 'Paid' && (
                                                                <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                                                                    Paid
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-12">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                                                    <p className="text-2xl font-black text-slate-900 tracking-tighter">
                                                        {formatCurrency(oTotal, currencyCode, currencySymbol)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        console.log("Recall button clicked for order:", order);
                                                        handleRecallOrder(order);
                                                    }}
                                                    disabled={pStatus === 'Paid' || oStatus === 'Paid'}
                                                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                                        (pStatus !== 'Paid' && oStatus !== 'Paid') ? 'bg-blue-600 text-white shadow-xl hover:-translate-y-1' : 'bg-slate-50 text-slate-200 cursor-not-allowed'
                                                    }`}
                                                >
                                                    Recall Order <FiChevronRight />
                                                </button>
                                                <button
                                                    onClick={() => handlePrintOrder(order)}
                                                    className="flex items-center justify-center w-14 h-14 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl hover:-translate-y-1"
                                                    title="Print Receipt"
                                                >
                                                    <FiPrinter size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* ORDER DETAILS (ITEMS) */}
                                        <div className="bg-slate-50/50 rounded-2xl p-4 mt-2">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                {oDetails?.map((detail, idx) => {
                                                    const pName = detail.productName || detail.ProductName || detail.product?.productName || detail.product?.ProductName || `Product #${detail.productID ?? detail.ProductID ?? 'N/A'}`;
                                                    const qty = detail.quantity || detail.Quantity || 1;
                                                    const amt = detail.amount || detail.Amount || 0;
                                                    
                                                    return (
                                                        <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                            <div className="flex items-center gap-3">
                                                                <span className="w-6 h-6 bg-slate-100 rounded-md flex items-center justify-center text-[10px] font-black text-slate-400">{qty}x</span>
                                                                <span className="text-[11px] font-bold text-slate-700 truncate max-w-[120px]">{pName}</span>
                                                            </div>
                                                            <span className="text-[11px] font-black text-slate-900">
                                                                {formatCurrency(amt, currencyCode, currencySymbol)}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {wName && wName !== 'N/A' && (
                                                <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                                                    <FiUser className="text-blue-500" /> Waiter: <span className="text-slate-600">{wName}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillListModal;
