import React, { useState, useEffect } from 'react';
import alertService from '../../services/alertService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const LowStockAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    const canView = user?.permissions?.includes('LOW_STOCK_ALERT_VIEW');

    useEffect(() => {
        if (!canView) {
            navigate('/access-denied');
            return;
        }

        const fetchAlerts = async () => {
            try {
                const response = await alertService.getAlerts();
                setAlerts(response.data);
            } catch (error) {
                toast.error('An error occurred while fetching alerts.');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAlerts();
    }, [canView, navigate]);

    const handleAcknowledge = async (id) => {
        try {
            await alertService.acknowledgeAlert(id);
            setAlerts(alerts.filter(alert => alert.alertId !== id));
            toast.success('Alert acknowledged.');
        } catch (error) {
            toast.error('An error occurred while acknowledging the alert.');
            console.error(error);
        }
    };

    if (!canView) {
        return null; // Or a loading spinner/message
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Alerts</h1>
            {isLoading ? (
                <p>Loading alerts...</p>
            ) : alerts.length === 0 ? (
                <p>No alerts at this time.</p>
            ) : (
                <div className="bg-white shadow-md rounded my-6">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Message</th>
                                <th className="py-3 px-6 text-left">Type</th>
                                <th className="py-3 px-6 text-left">Date</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {alerts.map((alert) => (
                                <tr key={alert.alertId} className="border-b border-gray-200 hover:bg-gray-100">
                                    <td className="py-3 px-6 text-left whitespace-nowrap">{alert.message}</td>
                                    <td className="py-3 px-6 text-left">{alert.type === 0 ? 'Low Stock' : 'Expiry'}</td>
                                    <td className="py-3 px-6 text-left">{new Date(alert.alertDate).toLocaleString()}</td>
                                    <td className="py-3 px-6 text-center">
                                        <button
                                            onClick={() => handleAcknowledge(alert.alertId)}
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        >
                                            Acknowledge
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LowStockAlerts;