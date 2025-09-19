import React, { useState, useEffect } from 'react';
import { salesService } from '../../services/salesService';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';

const SalesAdd = () => {
    const [categories, setCategories] = useState([]);
    const [saleData, setSaleData] = useState({
        customerID: '',
        totalAmount: 0,
        discountAmount: 0,
        finalAmount: 0,
        paymentMethod: '',
        categoryId: '',
        // Assuming saleDate is set by the backend or derived from current date
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(response.data.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

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
            const response = await salesService.createSale(saleData);
            if (response.isSuccess) {
                alert('Sale created successfully!');
                navigate('/sales'); // Navigate back to sales list
            } else {
                alert(`Error creating sale: ${response.message}`);
            }
        } catch (error) {
            alert('An error occurred while creating the sale.');
            console.error('Error creating sale:', error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Add New Sale</h1>
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
                        value={saleData.customerID}
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
                        value={saleData.paymentMethod}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryId">
                        Category
                    </label>
                    <select
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="categoryId"
                        name="categoryId"
                        value={saleData.categoryId}
                        onChange={handleChange}
                    >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.categoryName}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center justify-between">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Add Sale
                    </button>
                    <button
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="button"
                        onClick={() => navigate('/sales')}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SalesAdd;
