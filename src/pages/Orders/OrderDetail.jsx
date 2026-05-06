import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderById } from '../../services/orderService';
import { toast } from 'react-toastify';
import FormCard from '../../components/FormCard.jsx';
import { useAuth } from '../../context/AuthContext';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const canEdit = user?.permissions?.includes('ORDER_UPDATE');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await getOrderById(id);
        setOrder(response.data.data); // Assuming response.data.data contains the order object
      } catch (err) {
        setError(err);
        toast.error("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return <div className="text-center py-4">Loading order details...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error.message}</div>;
  }

  if (!order) {
    return <div className="text-center py-4">Order not found.</div>;
  }

  return (
    <div className="p-3 max-w-4xl mx-auto">
      <FormCard>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Order Details (ID: {order.orderID})</h2>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-3">Order Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
              <p><strong>Order Time:</strong> {order.orderTime}</p>
              <p><strong>Status:</strong> {order.orderStatus}</p>
              <p><strong>Type:</strong> {order.orderType}</p>
              <p><strong>Total:</strong> {order.total.toFixed(2)}</p>
              <p><strong>Discount:</strong> {order.discountAmount.toFixed(2)} ({order.discountPercentage}%)</p>
              <p><strong>Received:</strong> {order.received.toFixed(2)}</p>
              <p><strong>Change:</strong> {order.changeAmount.toFixed(2)}</p>
              {order.tableName && <p><strong>Table Name:</strong> {order.tableName}</p>}
              {order.waiterName && <p><strong>Waiter Name:</strong> {order.waiterName}</p>}
              {order.customer && <p><strong>Customer:</strong> {order.customer.customerName}</p>}
              {order.driverID && <p><strong>Driver ID:</strong> {order.driverID}</p>}
              {order.promotionID && <p><strong>Promotion ID:</strong> {order.promotionID}</p>}
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-3">Order Items</h3>
          {order.orderDetails && order.orderDetails.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200 mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 text-left text-sm font-semibold text-gray-800">Product</th>
                    <th className="py-2 px-4 text-left text-sm font-semibold text-gray-800">Quantity</th>
                    <th className="py-2 px-4 text-left text-sm font-semibold text-gray-800">Price</th>
                    <th className="py-2 px-4 text-left text-sm font-semibold text-gray-800">Discount</th>
                    <th className="py-2 px-4 text-left text-sm font-semibold text-gray-800">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.orderDetails.map((detail, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2 px-4 text-sm text-gray-800">{detail.product.productName || 'N/A'}</td>
                      <td className="py-2 px-4 text-sm text-gray-800">{detail.quantity}</td>
                      <td className="py-2 px-4 text-sm text-gray-800">{detail.price.toFixed(2)}</td>
                      <td className="py-2 px-4 text-sm text-gray-800">{detail.discountPrice.toFixed(2)}</td>
                      <td className="py-2 px-4 text-sm text-gray-800">{detail.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-800">No items in this order.</p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            {canEdit && (
              <Link to={`/orders/edit/${order.orderID}`} className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium shadow">
                Edit Order
              </Link>
            )}
            <button
              type="button"
              onClick={() => navigate('/orders/list')}
              className="px-5 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-[#E0E0E0] border border-gray-300 transition"
            >
              Back to Order List
            </button>
          </div>
        </div>
      </FormCard>
    </div>
  );
};

export default OrderDetail;
