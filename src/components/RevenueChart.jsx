import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function RevenueChart() {
  const theme = useTheme();

  const data = {
    labels: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'],
    datasets: [
      {
        label: "Revenue",
        data: [22, 27, 21, 30, 24, 29, 32],
        fill: true,
        backgroundColor: theme.palette.secondary.light,
        borderColor: theme.palette.secondary.main,
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
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" component="div">
              Today's Revenue
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lorem ipsum dolor sit amet
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
              $240.45
            </Typography>
            <Typography variant="body2" color="success.main">
              ↑ 0.5% than last day
            </Typography>
          </Box>
        </Box>
        <Line data={data} options={options} height={100} />
      </CardContent>
    </Card>
  );
}