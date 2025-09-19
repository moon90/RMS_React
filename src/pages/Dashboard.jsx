import React, { useState, useEffect } from 'react';
import { getLowStockAlerts } from '../services/low-stock.service';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [lowStockAlertCount, setLowStockAlertCount] = useState(0);

  useEffect(() => {
    const fetchLowStockAlerts = async () => {
      try {
        const response = await getLowStockAlerts();
        if (response.isSuccess) {
          setLowStockAlertCount(response.data.length);
        }
      } catch (error) {
        console.error("Error fetching low stock alerts for dashboard:", error);
      }
    };

    fetchLowStockAlerts();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold">Dashboard Page</h2>
      <p>This is the content for the Dashboard page.</p>

      <div className="mt-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
        <p className="font-bold">Low Stock Alerts: {lowStockAlertCount}</p>
        {lowStockAlertCount > 0 && (
          <Link to="/low-stock-alerts" className="text-sm text-yellow-800 hover:underline">
            View all low stock alerts
          </Link>
        )}
      </div>
    </div>
  );
}