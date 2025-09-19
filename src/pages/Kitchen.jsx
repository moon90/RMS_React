import React, { useState, useEffect } from 'react';
import { hasPermission } from '../utils/permissionUtils';
import useSignalR from '../useSignalR';
import { toast } from 'react-toastify';
import kitchenService from '../services/kitchenService'; // Import the new service
import config from '../config'; // Import config file

export default function Kitchen() {
  const canViewKitchen = hasPermission('KITCHEN_VIEW');
  const { connection, isConnected, error } = useSignalR(config.SIGNALR_HUB_URL);

  {error && <div className="text-red-500 text-center mb-4">SignalR Connection Error: {error}</div>}

  const [orders, setOrders] = useState([]); // Renamed from kitchenUpdates to orders for clarity
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch orders from the backend
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // Fetch orders that are either 'Pending' or 'Preparing'
      const fetchedOrdersResponse = await kitchenService.getKitchenOrders(['Pending', 'Preparing']);

      let fetchedOrders = [];
      if (fetchedOrdersResponse.data && fetchedOrdersResponse.data.items) {
        fetchedOrders = fetchedOrdersResponse.data.items;
      }
      
      setOrders(fetchedOrders);
    } catch (err) {
      toast.error('Failed to fetch kitchen orders.');
      console.error('Error fetching kitchen orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch of orders on component mount
  useEffect(() => {
    if (canViewKitchen) {
      fetchOrders();
    }
  }, [canViewKitchen]);

  // SignalR Integration
  useEffect(() => {
    if (isConnected && connection) {
      connection.on("KitchenOrderUpdate", (orderUpdateDto) => {
        console.log("Received KitchenOrderUpdate:", orderUpdateDto);
        toast.info(`Order ${orderUpdateDto.orderId}: ${orderUpdateDto.message}`);
        
        // Update the specific order in the state or add new order
        setOrders(prevOrders => {
          const existingOrderIndex = prevOrders.findIndex(o => o.orderID === orderUpdateDto.orderId);
          if (existingOrderIndex > -1) {
            // Update existing order
            const updatedOrders = [...prevOrders];
            updatedOrders[existingOrderIndex] = {
              ...updatedOrders[existingOrderIndex],
              orderStatus: orderUpdateDto.orderStatus,
              // Update other relevant fields from orderUpdateDto if available
            };
            return updatedOrders;
          } else {
            // Add new order (assuming orderUpdateDto contains enough info for a new order display)
            // You might need to fetch the full order details here if orderUpdateDto is too minimal
            fetchOrders(); // Re-fetch all orders to ensure consistency
            return prevOrders; // Return previous state for now, fetchOrders will update it
          }
        });
      });

      // Clean up the event listener when the component unmounts or connection changes
      return () => {
        connection.off("KitchenOrderUpdate");
      };
    }
  }, [isConnected, connection]); // Removed kitchenUpdates from dependencies as it's being updated inside

  const handleUpdateOrderStatus = async (orderId, currentStatus) => {
    let newStatus = '';
    if (currentStatus === 'Pending') {
      newStatus = 'Preparing';
    } else if (currentStatus === 'Preparing') {
      newStatus = 'Ready';
    } else if (currentStatus === 'Ready') {
      newStatus = 'Completed';
    }

    if (newStatus) {
      try {
        const response = await kitchenService.updateOrderStatus(orderId, newStatus);
        if (response.isSuccess) {
          toast.success(`Order ${orderId} status updated to ${newStatus}.`);
          // Optimistically update UI or re-fetch
          fetchOrders(); 
        } else {
          toast.error(response.message || 'Failed to update order status.');
        }
      } catch (err) {
        toast.error('An error occurred while updating order status.');
        console.error('Error updating order status:', err);
      }
    }
  };

  const getStatusButtonClass = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Preparing': return 'bg-blue-500 hover:bg-blue-600';
      case 'Ready': return 'bg-green-500 hover:bg-green-600';
      case 'Completed': return 'bg-gray-500 cursor-not-allowed';
      default: return 'bg-gray-400';
    }
  };

  const getNextStatusText = (status) => {
    switch (status) {
      case 'Pending': return 'Start Preparing';
      case 'Preparing': return 'Mark as Ready';
      case 'Ready': return 'Mark as Completed';
      case 'Completed': return 'Completed';
      default: return 'Update Status';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Kitchen Orders</h2>
      {canViewKitchen ? (
        <>
          {isLoading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p>No active kitchen orders at this time.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map(order => (
                <div key={order.orderID} className="bg-gray-100 p-4 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold mb-2">Order #{order.orderID} - Table: {order.tableName || 'N/A'}</h3>
                  <p className="text-sm text-gray-600 mb-2">Status: <span className={`font-semibold ${getStatusButtonClass(order.orderStatus)} px-2 py-1 rounded text-white`}>{order.orderStatus}</span></p>
                  <p className="text-sm text-gray-600 mb-2">Type: {order.orderType}</p>
                  <p className="text-sm text-gray-600 mb-2">Time: {order.orderTime}</p>
                  <p className="text-sm text-gray-600 mb-2">Waiter: {order.waiterName || 'N/A'}</p>
                  <ul className="list-disc list-inside mb-4">
                    {order.orderDetails.map(detail => (
                      <li key={detail.productID} className="text-gray-700">{detail.quantity} x {detail.product.productName}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleUpdateOrderStatus(order.orderID, order.orderStatus)}
                    className={`w-full text-white font-bold py-2 px-4 rounded ${getStatusButtonClass(order.orderStatus)}`}
                    disabled={order.orderStatus === 'Completed'}
                  >
                    {getNextStatusText(order.orderStatus)}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-red-500">You do not have permission to view the kitchen.</p>
      )}
    </div>
  );
}
