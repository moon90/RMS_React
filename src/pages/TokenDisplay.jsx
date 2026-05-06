import React, { useState, useEffect } from 'react';
import useSignalR from '../useSignalR';
import kitchenService from '../services/kitchenService';
import config from '../config';

export default function TokenDisplay() {
  const { connection, isConnected } = useSignalR(config.SIGNALR_HUB_URL);
  const [preparingOrders, setPreparingOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [recentlyCalled, setRecentlyCalled] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await kitchenService.getKitchenOrders(['Pending', 'Preparing', 'Ready']);
      if (response.data && response.data.items) {
        const items = response.data.items;
        setPreparingOrders(items.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Preparing'));
        
        const readyItems = items.filter(o => o.orderStatus === 'Ready');
        setReadyOrders(readyItems);

        // Optional: flash the most recent ready order
        if (readyItems.length > 0) {
          setRecentlyCalled(readyItems[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching orders for token display:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10 seconds as backup
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isConnected && connection) {
      connection.on("KitchenOrderUpdate", () => {
        fetchOrders();
      });
      return () => {
        connection.off("KitchenOrderUpdate");
      };
    }
  }, [isConnected, connection]);

  const renderToken = (order) => {
    return order.tokenNumber || `#${order.orderID}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-inter overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-black/50 p-6 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-4xl font-black text-white tracking-tighter">
          ORDER <span className="text-[#DA291C]">STATUS</span>
        </h1>
        <div className="text-right">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Now Serving</p>
          <div className="text-5xl font-black text-[#FFC72C] animate-pulse">
            {recentlyCalled ? renderToken(recentlyCalled) : '---'}
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 grid grid-cols-2 gap-px bg-gray-800">
        
        {/* Preparing Section */}
        <div className="bg-gray-900 flex flex-col">
          <div className="bg-gray-800/50 p-6 text-center border-b border-gray-800">
            <h2 className="text-3xl font-black text-gray-300 uppercase tracking-widest">Preparing</h2>
          </div>
          <div className="flex-1 p-8">
            <div className="grid grid-cols-2 gap-6 content-start">
              {preparingOrders.map(order => (
                <div key={order.orderID} className="bg-gray-800 rounded-2xl p-6 text-center border border-gray-700 shadow-lg">
                  <span className="text-4xl font-bold text-gray-100">{renderToken(order)}</span>
                </div>
              ))}
              {preparingOrders.length === 0 && (
                <div className="col-span-2 text-center text-gray-600 mt-20 font-bold text-2xl">
                  No orders preparing
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ready Section */}
        <div className="bg-gray-900 flex flex-col">
          <div className="bg-green-900/20 p-6 text-center border-b border-green-900/30">
            <h2 className="text-3xl font-black text-green-400 uppercase tracking-widest">Please Collect</h2>
          </div>
          <div className="flex-1 p-8">
            <div className="grid grid-cols-2 gap-6 content-start">
              {readyOrders.map(order => (
                <div key={order.orderID} className="bg-green-600 rounded-2xl p-6 text-center border border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-in zoom-in duration-500">
                  <span className="text-5xl font-black text-white">{renderToken(order)}</span>
                </div>
              ))}
              {readyOrders.length === 0 && (
                <div className="col-span-2 text-center text-gray-600 mt-20 font-bold text-2xl">
                  No orders ready
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer ticker */}
      <div className="bg-[#DA291C] p-3 overflow-hidden whitespace-nowrap">
        <p className="text-white font-bold tracking-widest text-lg inline-block animate-[marquee_20s_linear_infinite]">
          WELCOME TO RESTAURANT BRNO • PLEASE HAVE YOUR TOKEN NUMBER READY • FRESH FOOD PREPARED DAILY
        </p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
      `}} />
    </div>
  );
}
