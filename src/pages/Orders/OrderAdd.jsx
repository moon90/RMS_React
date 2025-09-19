import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../../services/orderService';
import { getAllCustomers } from '../../services/customerService'; // Assuming customer service exists
import { getAllProducts } from '../../services/productService'; // Assuming product service exists
import { getAllDiningTables } from '../../services/diningTableService';
import { getAllStaff } from '../../services/staffService';
import { toast } from 'react-toastify';
import FormCard from '../../components/FormCard';

const OrderAdd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    orderDate: '',
    orderTime: '',
    tableName: '',
    waiterName: '',
    orderStatus: 'Pending',
    orderType: '',
    total: 0,
    discountAmount: 0,
    discountPercentage: 0,
    promotionID: null,
    received: 0,
    changeAmount: 0,
    driverID: null,
    customerID: null,
    orderDetails: [],
  });

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [diningTables, setDiningTables] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        setLoading(true);
        const customerResponse = await getAllCustomers({ PageNumber: 1, PageSize: 1000 });
        if (customerResponse.data && customerResponse.data.data && customerResponse.data.data.items) {
          setCustomers(customerResponse.data.data.items);
        }

        const productResponse = await getAllProducts({ PageNumber: 1, PageSize: 1000 });
        if (productResponse.data && productResponse.data.data && productResponse.data.data.items) {
          setProducts(productResponse.data.data.items);
        }

        const diningTableResponse = await getAllDiningTables({ PageNumber: 1, PageSize: 1000 });
        if (diningTableResponse.data && diningTableResponse.data.data && diningTableResponse.data.data.data.items) {
          setDiningTables(diningTableResponse.data.data.data.items);
        }

        const staffResponse = await getAllStaff({ PageNumber: 1, PageSize: 1000 });
        console.log("Staff Response:", staffResponse);
        if (staffResponse.data && staffResponse.data.data && staffResponse.data.data.items) {
          setStaff(staffResponse.data.data.items);
        }
      } catch (error) {
        toast.error("Failed to load dependencies.");
        console.error("Error fetching dependencies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDependencies();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleOrderDetailChange = (index, e) => {
    const { name, value } = e.target;
    const newOrderDetails = [...formData.orderDetails];
    if (name === 'productID') {
        const product = products.find(p => p.productID === parseInt(value));
        newOrderDetails[index] = {
            ...newOrderDetails[index],
            [name]: value,
            price: product ? product.productPrice : 0,
            productName: product ? product.productName : ''
        };
    } else {
        newOrderDetails[index] = {
            ...newOrderDetails[index],
            [name]: name === 'quantity' || name === 'price' || name === 'discountPrice' ? parseFloat(value) || 0 : value,
        };
    }
    setFormData({
      ...formData,
      orderDetails: newOrderDetails,
    });
  };

  const addOrderDetail = () => {
    setFormData({
      ...formData,
      orderDetails: [...formData.orderDetails, { productID: '', quantity: 1, price: 0, discountPrice: 0, amount: 0 }],
    });
  };

  const removeOrderDetail = (index) => {
    const newOrderDetails = formData.orderDetails.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      orderDetails: newOrderDetails,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.orderDate) newErrors.orderDate = "Order Date is required.";
    if (!formData.orderTime) newErrors.orderTime = "Order Time is required.";
    if (!formData.orderType) newErrors.orderType = "Order Type is required.";
    if (formData.orderDetails.length === 0) newErrors.orderDetails = "At least one order detail is required.";
    formData.orderDetails.forEach((detail, index) => {
      if (!detail.productID) newErrors[`productID-${index}`] = "Product is required.";
      if (detail.quantity <= 0) newErrors[`quantity-${index}`] = "Quantity must be greater than 0.";
      if (detail.price <= 0) newErrors[`price-${index}`] = "Price must be greater than 0.";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the form errors.");
      return;
    }

    // Calculate total and amount for each order detail before submitting
    const orderDetailsWithAmounts = formData.orderDetails.map(detail => ({
      ...detail,
      amount: (detail.quantity * detail.price) - detail.discountPrice,
    }));

    const totalOrderAmount = orderDetailsWithAmounts.reduce((sum, detail) => sum + detail.amount, 0);

    const orderToCreate = {
      ...formData,
      orderDate: new Date(formData.orderDate).toISOString(), // Ensure correct format
      total: totalOrderAmount,
      orderDetails: orderDetailsWithAmounts,
    };

    try {
      await createOrder(orderToCreate);
      toast.success("Order created successfully!");
      navigate('/orders/list');
    } catch (error) {
      toast.error("Failed to create order.");
      console.error("Error creating order:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <FormCard>
        <h1 className="text-2xl font-bold mb-4">Add New Order</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="orderDate" className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
            <input
              type="date"
              id="orderDate"
              name="orderDate"
              value={formData.orderDate}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.orderDate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            />
            {errors.orderDate && <p className="text-red-500 text-xs mt-1">{errors.orderDate}</p>}
          </div>
          <div>
            <label htmlFor="orderTime" className="block text-sm font-medium text-gray-700 mb-1">Order Time</label>
            <input
              type="time"
              id="orderTime"
              name="orderTime"
              value={formData.orderTime}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.orderTime ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            />
            {errors.orderTime && <p className="text-red-500 text-xs mt-1">{errors.orderTime}</p>}
          </div>
          <div>
            <label htmlFor="orderType" className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
            <select
              id="orderType"
              name="orderType"
              value={formData.orderType}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.orderType ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            >
              <option value="">Select Order Type</option>
              <option value="DineIn">Dine-In</option>
              <option value="TakeOut">Take-Out</option>
              <option value="Delivery">Delivery</option>
            </select>
            {errors.orderType && <p className="text-red-500 text-xs mt-1">{errors.orderType}</p>}
          </div>
          <div>
            <label htmlFor="customerID" className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select
              id="customerID"
              name="customerID"
              value={formData.customerID || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Customer (Optional)</option>
              {customers.map(customer => (
                <option key={customer.customerID} value={customer.customerID}>
                  {customer.customerName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tableName" className="block text-sm font-medium text-gray-700 mb-1">Table Name (for Dine-In)</label>
            <select
              id="tableName"
              name="tableName"
              value={formData.tableName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Table</option>
              {diningTables.map(table => (
                <option key={table.diningTableID} value={table.tableName}>
                  {table.tableName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="waiterName" className="block text-sm font-medium text-gray-700 mb-1">Waiter Name (for Dine-In)</label>
            <select
              id="waiterName"
              name="waiterName"
              value={formData.waiterName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Waiter</option>
              {staff.map(staffMember => (
                <option key={staffMember.staffID} value={staffMember.staffName}>
                  {staffMember.staffName}
                </option>
              ))}
            </select>
          </div>
          {/* Add DriverID and PromotionID fields if needed */}
        </div>

        <h2 className="text-xl font-bold mb-3">Order Details</h2>
        {formData.orderDetails.map((detail, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 border rounded-lg bg-gray-50">
            <div>
              <label htmlFor={`productID-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <select
                id={`productID-${index}`}
                name="productID"
                value={detail.productID}
                onChange={(e) => handleOrderDetailChange(index, e)}
                className={`w-full px-4 py-2 border ${errors[`productID-${index}`] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product.productID} value={product.productID}>
                    {product.productName}
                  </option>
                ))}
              </select>
              {errors[`productID-${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`productID-${index}`]}</p>}
            </div>
            <div>
              <label htmlFor={`quantity-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                id={`quantity-${index}`}
                name="quantity"
                value={detail.quantity}
                onChange={(e) => handleOrderDetailChange(index, e)}
                className={`w-full px-4 py-2 border ${errors[`quantity-${index}`] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors[`quantity-${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`quantity-${index}`]}</p>}
            </div>
            <div>
              <label htmlFor={`price-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                id={`price-${index}`}
                name="price"
                value={detail.price}
                onChange={(e) => handleOrderDetailChange(index, e)}
                className={`w-full px-4 py-2 border ${errors[`price-${index}`] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors[`price-${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`price-${index}`]}</p>}
            </div>
            <div>
              <label htmlFor={`discountPrice-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Discount Price</label>
              <input
                type="number"
                id={`discountPrice-${index}`}
                name="discountPrice"
                value={detail.discountPrice}
                onChange={(e) => handleOrderDetailChange(index, e)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => removeOrderDetail(index)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        {errors.orderDetails && <p className="text-red-500 text-xs mt-1">{errors.orderDetails}</p>}
        <button
          type="button"
          onClick={addOrderDetail}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Add Product to Order
        </button>

        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={() => navigate('/orders/list')}
            className="px-5 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Create Order
          </button>
        </div>
        </form>
      </FormCard>
    </div>
  );
};

export default OrderAdd;

