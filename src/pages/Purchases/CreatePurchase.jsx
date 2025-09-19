
import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';

const CreatePurchase = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [purchaseDetails, setPurchaseDetails] = useState([{ productId: '', quantity: '', unitPrice: '' }]);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await api.get('/suppliers');
                setSuppliers(response.data.data);
            } catch (error) {
                console.error("Error fetching suppliers:", error);
            }
        };

        const fetchProducts = async () => {
            try {
                const response = await api.get('/products');
                setProducts(response.data.data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(response.data.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchSuppliers();
        fetchProducts();
        fetchCategories();
    }, []);

    const handleProductChange = (index, event) => {
        const values = [...purchaseDetails];
        values[index][event.target.name] = event.target.value;
        setPurchaseDetails(values);
    };

    const handleAddProduct = () => {
        setPurchaseDetails([...purchaseDetails, { productId: '', quantity: '', unitPrice: '' }]);
    };

    const handleRemoveProduct = (index) => {
        const values = [...purchaseDetails];
        values.splice(index, 1);
        setPurchaseDetails(values);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const totalAmount = purchaseDetails.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
            const purchaseData = {
                supplierId: parseInt(selectedSupplier),
                categoryId: parseInt(selectedCategory),
                purchaseDate: new Date().toISOString(),
                totalAmount,
                paymentMethod: 'Cash', // Or get from form
                purchaseDetails: purchaseDetails.map(item => ({
                    productId: parseInt(item.productId),
                    quantity: parseInt(item.quantity),
                    unitPrice: parseFloat(item.unitPrice),
                    totalAmount: item.quantity * item.unitPrice
                }))
            };

            const response = await api.post('/purchases', purchaseData);
            if (response.data.isSuccess) {
                alert("Purchase created successfully!");
                // Optionally redirect or clear form
            } else {
                alert(`Error: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Error creating purchase:", error);
            alert("An error occurred while creating the purchase.");
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Create Purchase</h1>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="supplier">
                        Supplier
                    </label>
                    <select
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="supplier"
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                    >
                        <option value="">Select a supplier</option>
                        {suppliers.map(supplier => (
                            <option key={supplier.supplierID} value={supplier.supplierID}>{supplier.supplierName}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                        Category
                    </label>
                    <select
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.categoryName}</option>
                        ))}
                    </select>
                </div>

                <h2 className="text-xl font-bold mb-2">Products</h2>
                {purchaseDetails.map((product, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <select
                            className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                            name="productId"
                            value={product.productId}
                            onChange={(e) => handleProductChange(index, e)}
                        >
                            <option value="">Select a product</option>
                            {products.map(p => (
                                <option key={p.productID} value={p.productID}>{p.productName}</option>
                            ))}
                        </select>
                        <input
                            className="shadow appearance-none border rounded w-1/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                            name="quantity"
                            type="number"
                            placeholder="Quantity"
                            value={product.quantity}
                            onChange={(e) => handleProductChange(index, e)}
                        />
                        <input
                            className="shadow appearance-none border rounded w-1/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                            name="unitPrice"
                            type="number"
                            placeholder="Unit Price"
                            value={product.unitPrice}
                            onChange={(e) => handleProductChange(index, e)}
                        />
                        <button
                            type="button"
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => handleRemoveProduct(index)}
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                    onClick={() => handleAddProduct()}
                >
                    Add Product
                </button>

                <div className="flex items-center justify-between">
                    <button
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Create Purchase
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePurchase;
