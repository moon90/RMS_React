import React, { useState, useEffect } from 'react';
import { hasPermission } from '../utils/permissionUtils';
import useSignalR from '../useSignalR'; // Import the custom hook

export default function Inventory() {
  const canViewInventory = hasPermission('INVENTORY_VIEW');
  const { connection, isConnected, error } = useSignalR('https://localhost:7083/rmshub'); // Use your backend SignalR URL
  const [inventoryUpdates, setInventoryUpdates] = useState([]);

  useEffect(() => {
    if (isConnected && connection) {
      connection.on("InventoryUpdate", (updateDto) => {
        console.log("Received InventoryUpdate:", updateDto);
        setInventoryUpdates((prevUpdates) => [...prevUpdates, updateDto]);
      });

      // Clean up the event listener when the component unmounts or connection changes
      return () => {
        connection.off("InventoryUpdate");
      };
    }
  }, [isConnected, connection]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold">Inventory Page</h2>
      {canViewInventory ? (
        <>
          <p>You have permission to view inventory. This is the content for the Inventory page.</p>
          <div className="mt-4">
            <h3 className="text-xl font-semibold">Real-time Inventory Updates:</h3>
            {!isConnected && <p className="text-yellow-600">Connecting to real-time updates...</p>}
            {error && <p className="text-red-500">Connection Error: {error.message}</p>}
            {isConnected && inventoryUpdates.length === 0 && <p>Waiting for inventory updates...</p>}
            <ul className="list-disc pl-5">
              {inventoryUpdates.map((update, index) => (
                <li key={index}>
                  <strong>{update.productName}</strong>: {update.changeType} from {update.oldQuantity} to {update.newQuantity} ({update.message}) - {new Date(update.timestamp).toLocaleTimeString()}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <p className="text-red-500">You do not have permission to view inventory.</p>
      )}
    </div>
  );
}