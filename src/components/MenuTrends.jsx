import { Card, CardContent, Typography, Box, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider } from '@mui/material';

export default function MenuTrends() {
  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" component="div" sx={{ mb: 1 }}>
          Daily Trending Menus
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Lorem ipsum dolor sit amet, consectetur
        </Typography>
        
        <List>
          <ListItem disablePadding>
            <ListItemText 
              primary={
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                  #1 <Box component="span" sx={{ ml: 1, fontWeight: 'bold' }}>Medium Spicy Spaghetti Italiano</Box>
                </Typography>
              }
              secondary={
                <Typography variant="body2" color="text.secondary">
                  $5.60 · Order 89x
                </Typography>
              }
            />
            <ListItemAvatar>
              <Avatar src="https://source.unsplash.com/40x40/?spaghetti" alt="Spaghetti" variant="rounded" />
            </ListItemAvatar>
          </ListItem>
          <Divider variant="inset" component="li" sx={{ my: 1 }} />
          <ListItem disablePadding>
            <ListItemText 
              primary={
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                  #2 <Box component="span" sx={{ ml: 1, fontWeight: 'bold' }}>Classic Beef Burger</Box>
                </Typography>
              }
              secondary={
                <Typography variant="body2" color="text.secondary">
                  $7.50 · Order 75x
                </Typography>
              }
            />
            <ListItemAvatar>
              <Avatar src="https://source.unsplash.com/40x40/?burger" alt="Burger" variant="rounded" />
            </ListItemAvatar>
          </ListItem>
          <Divider variant="inset" component="li" sx={{ my: 1 }} />
          <ListItem disablePadding>
            <ListItemText 
              primary={
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                  #3 <Box component="span" sx={{ ml: 1, fontWeight: 'bold' }}>Caesar Salad</Box>
                </Typography>
              }
              secondary={
                <Typography variant="body2" color="text.secondary">
                  $6.00 · Order 60x
                </Typography>
              }
            />
            <ListItemAvatar>
              <Avatar src="https://source.unsplash.com/40x40/?salad" alt="Salad" variant="rounded" />
            </ListItemAvatar>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
}