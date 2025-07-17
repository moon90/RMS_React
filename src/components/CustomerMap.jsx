import { Card, CardContent, Typography, Box, ButtonGroup, Button } from '@mui/material';

export default function CustomerMap() {
  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            Customer Map
          </Typography>
          <ButtonGroup variant="outlined" aria-label="outlined button group">
            <Button>Year</Button>
            <Button>Monthly</Button>
            <Button>Week</Button>
          </ButtonGroup>
        </Box>
        <Box sx={{ height: 200, backgroundColor: '#ecf0f1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
          <Typography variant="body1" color="text.secondary">
            [ Map Placeholder ]
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}