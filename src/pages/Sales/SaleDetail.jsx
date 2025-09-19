import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { salesService } from '../../services/salesService';

const SaleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSale = async () => {
            try {
                const response = await salesService.getSaleById(id);
                if (response.isSuccess) {
                    setSale(response.data);
                } else {
                    setError(response.message);
                }
            } catch (err) {
                setError('Failed to fetch sale details.');
                console.error('Error fetching sale details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSale();
    }, [id]);

    if (loading) {
        return <div className="container mx-auto p-4">Loading sale details...</div>;
    }

    if (error) {
        return <div className="container mx-auto p-4 text-red-600">Error: {error}</div>;
    }

    if (!sale) {
        return <div className="container mx-auto p-4">Sale not found.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Sale Details (ID: {sale.saleID})</h1>
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Customer ID:</label>
                    <p className="text-gray-900">{sale.customerID || 'N/A'}</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Total Amount:</label>
                    <p className="text-gray-900">{sale.totalAmount}</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Discount Amount:</label>
                    <p className="text-gray-900">{sale.discountAmount}</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Final Amount:</label>
                    <p className="text-gray-900">{sale.finalAmount}</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Payment Method:</label>
                    <p className="text-gray-900">{sale.paymentMethod}</p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Sale Date:</label>
                    <p className="text-gray-900">{new Date(sale.saleDate).toLocaleDateString()}</p>
                </div>
                {sale.saleDetails && sale.saleDetails.length > 0 && (
                    <div className="mb-4">
                        <h2 className="text-xl font-bold mb-2">Sale Items:</h2>
                        <table className="min-w-full table-auto border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 py-2 px-4 text-left">Product ID</th>
                                    <th className="border border-gray-300 py-2 px-4 text-left">Quantity</th>
                                    <th className="border border-gray-300 py-2 px-4 text-left">Unit Price</th>
                                    <th className="border border-gray-300 py-2 px-4 text-left">Discount</th>
                                    <th className="border border-gray-300 py-2 px-4 text-left">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sale.saleDetails.map((item, index) => (
                                    <tr key={index}>
                                        <td className="border border-gray-300 py-2 px-4">{item.productID}</td>
                                        <td className="border border-gray-300 py-2 px-4">{item.quantity}</td>
                                        <td className="border border-gray-300 py-2 px-4">{item.unitPrice}</td>
                                        <td className="border border-gray-300 py-2 px-4">{item.discount}</td>
                                        <td className="border border-gray-300 py-2 px-4">{item.totalAmount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="flex items-center justify-between mt-4">
                    <button
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="button"
                        onClick={() => navigate('/sales')}
                    >
                        Back to Sales List
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaleDetail;
