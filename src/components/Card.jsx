import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Card as MuiCard, CardContent, Typography, Box } from '@mui/material';

export default function Card({ title, value, percentage, icon }) {
  return (
    <MuiCard sx={{ display: 'flex', alignItems: 'center', p: 2, minHeight: 110 }}>
      <Box sx={{ width: 64, height: 64, mr: 2 }}>
        <CircularProgressbarWithChildren
          value={percentage}
          strokeWidth={10}
          styles={buildStyles({
            pathColor: "#1abc9c", // Teal from theme
            trailColor: "#ecf0f1" // Light Grey from theme
          })}
        >
          <Typography variant="h5" component="div">
            {icon}
          </Typography>
        </CircularProgressbarWithChildren>
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 0, '&:last-child': { pb: 0 } }}>
        <Typography color="text.secondary" variant="subtitle2">
          {title}
        </Typography>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </CardContent>
    </MuiCard>
  );
}