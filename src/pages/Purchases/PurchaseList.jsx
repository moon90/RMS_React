import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { purchaseService } from '../../services/purchaseService';

const PurchaseList = () => {
    const [purchases, setPurchases] = useState([]);

    const fetchPurchases = async () => {
        try {
            const response = await purchaseService.getAllPurchases();
            if (response.isSuccess) {
                setPurchases(response.data);
            } else {
                console.error("Error fetching purchases:", response.message);
            }
        } catch (error) {
            console.error("Error fetching purchases:", error);
        }
    };

    useEffect(() => {
        fetchPurchases();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this purchase?')) {
            try {
                const response = await purchaseService.deletePurchase(id);
                if (response.isSuccess) {
                    alert('Purchase deleted successfully!');
                    fetchPurchases(); // Refresh the list
                } else {
                    alert(`Error deleting purchase: ${response.message}`);
                }
            } catch (error) {
                alert('An error occurred while deleting the purchase.');
                console.error('Error deleting purchase:', error);
            }
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Purchases</h1>
                <Link to="/purchases/create" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Create Purchase
                </Link>
            </div>
            <div className="bg-white shadow-md rounded my-6">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Purchase ID</th>
                            <th className="py-3 px-6 text-left">Supplier</th>
                            <th className="py-3 px-6 text-left">Category</th>
                            <th className="py-3 px-6 text-center">Total Amount</th>
                            <th className="py-3 px-6 text-center">Payment Method</th>
                            <th className="py-3 px-6 text-center">Purchase Date</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {purchases.map(purchase => (
                            <tr key={purchase.purchaseID} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap">{purchase.purchaseID}</td>
                                <td className="py-3 px-6 text-left">{purchase.supplierID}</td>
                                <td className="py-3 px-6 text-left">{purchase.categoryName}</td>
                                <td className="py-3 px-6 text-center">{purchase.totalAmount}</td>
                                <td className="py-3 px-6 text-center">{purchase.paymentMethod}</td>
                                <td className="py-3 px-6 text-center">{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                                <td className="py-3 px-6 text-center">
                                    <div className="flex item-center justify-center">
                                        <Link to={`/purchases/${purchase.purchaseID}`}
                                            className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </Link>
                                        <Link to={`/purchases/edit/${purchase.purchaseID}`}
                                            className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
                                            </svg>
                                        </Link>
                                        <button onClick={() => handleDelete(purchase.purchaseID)}
                                            className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PurchaseList;