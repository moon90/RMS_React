import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { purchaseService } from '../../services/purchaseService';

const PurchaseEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [purchaseData, setPurchaseData] = useState({
        supplierID: '',
        totalAmount: 0,
        paymentMethod: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPurchase = async () => {
            try {
                const response = await purchaseService.getPurchaseById(id);
                if (response.isSuccess) {
                    setPurchaseData(response.data);
                } else {
                    setError(response.message);
                }
            } catch (err) {
                setError('Failed to fetch purchase details for editing.');
                console.error('Error fetching purchase details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPurchase();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPurchaseData(prevData => ({
            ...prevData,
            [name]: name === 'totalAmount' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await purchaseService.updatePurchase(id, purchaseData);
            if (response.isSuccess) {
                alert('Purchase updated successfully!');
                navigate(`/purchases/${id}`); // Navigate back to purchase detail page
            } else {
                alert(`Error updating purchase: ${response.message}`);
            }
        } catch (err) {
            alert('An error occurred while updating the purchase.');
            console.error('Error updating purchase:', err);
        }
    };

    if (loading) {
        return <div className="container mx-auto p-4">Loading purchase for editing...</div>;
    }

    if (error) {
        return <div className="container mx-auto p-4 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Edit Purchase (ID: {id})</h1>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="supplierID">
                        Supplier ID
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="supplierID"
                        type="text"
                        placeholder="Supplier ID"
                        name="supplierID"
                        value={purchaseData.supplierID || ''}
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
                        value={purchaseData.totalAmount}
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
                        value={purchaseData.paymentMethod || ''}
                        onChange={handleChange}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Update Purchase
                    </button>
                    <button
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="button"
                        onClick={() => navigate(`/purchases/${id}`)}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PurchaseEdit;
