import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function RevenueChart() {
  const data = {
    labels: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'],
    datasets: [
      {
        label: "Revenue",
        data: [22, 27, 21, 30, 24, 29, 32],
        fill: true,
        backgroundColor: 'rgba(255, 112, 67, 0.2)',
        borderColor: '#ff5722',
        tension: 0.5,
        pointRadius: 0,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: false }, beginAtZero: true }
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow mt-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">Today's Revenue</h2>
          <p className="text-sm text-gray-400">Lorem ipsum dolor sit amet</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-800">$240.45</h2>
          <p className="text-sm text-green-500">↑ 0.5% than last day</p>
        </div>
      </div>

      <Line data={data} options={options} height={100} />
    </div>
  );
}
