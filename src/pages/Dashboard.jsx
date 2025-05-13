// src/pages/Dashboard.jsx
import MainLayout from '../layouts/MainLayout';
import Card from '../components/Card';
import RevenueChart from '../components/RevenueChart';
import MenuTrends from '../components/MenuTrends';
import CustomerMap from '../components/CustomerMap';

export default function Dashboard() {
  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card title="Total Menus" value="459" percentage={76} icon="🍽️" />
        <Card title="Total Revenue" value="$87,561" percentage={50} icon="💵" />
        <Card title="Total Orders" value="247" percentage={60} icon="🛒" />
        <Card title="Total Customers" value="872" percentage={70} icon="👥" />
      </div>

      {/* Revenue */}
      <RevenueChart />

      {/* Menu & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <MenuTrends />
        <CustomerMap />
      </div>
    </MainLayout>
  );
}

