import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { salesService } from '../../services/salesService';

const SalesEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [saleData, setSaleData] = useState({
        customerID: '',
        totalAmount: 0,
        discountAmount: 0,
        finalAmount: 0,
        paymentMethod: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSale = async () => {
            try {
                const response = await salesService.getSaleById(id);
                if (response.isSuccess) {
                    setSaleData(response.data);
                } else {
                    setError(response.message);
                }
            } catch (err) {
                setError('Failed to fetch sale details for editing.');
                console.error('Error fetching sale details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSale();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSaleData(prevData => ({
            ...prevData,
            [name]: name === 'totalAmount' || name === 'discountAmount' || name === 'finalAmount' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await salesService.updateSale(id, saleData);
            if (response.isSuccess) {
                alert('Sale updated successfully!');
                navigate(`/sales/${id}`); // Navigate back to sale detail page
            } else {
                alert(`Error updating sale: ${response.message}`);
            }
        } catch (err) {
            alert('An error occurred while updating the sale.');
            console.error('Error updating sale:', err);
        }
    };

    if (loading) {
        return <div className="container mx-auto p-4">Loading sale for editing...</div>;
    }

    if (error) {
        return <div className="container mx-auto p-4 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Edit Sale (ID: {id})</h1>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customerID">
                        Customer ID
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="customerID"
                        type="text"
                        placeholder="Customer ID"
                        name="customerID"
                        value={saleData.customerID || ''}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="totalAmount">
                        Total Amount
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="totalAmount"
                        type="number"
                        step="0.01"
                        placeholder="Total Amount"
                        name="totalAmount"
                        value={saleData.totalAmount}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discountAmount">
                        Discount Amount
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="discountAmount"
                        type="number"
                        step="0.01"
                        placeholder="Discount Amount"
                        name="discountAmount"
                        value={saleData.discountAmount}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="finalAmount">
                        Final Amount
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="finalAmount"
                        type="number"
                        step="0.01"
                        placeholder="Final Amount"
                        name="finalAmount"
                        value={saleData.finalAmount}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentMethod">
                        Payment Method
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="paymentMethod"
                        type="text"
                        placeholder="Payment Method"
                        name="paymentMethod"
                        value={saleData.paymentMethod || ''}
                        onChange={handleChange}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Update Sale
                    </button>
                    <button
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="button"
                        onClick={() => navigate(`/sales/${id}`)}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SalesEdit;
