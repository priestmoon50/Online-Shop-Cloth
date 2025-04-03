import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Select, MenuItem } from '@mui/material';
import { Order } from '@/data/types';
import dayjs from 'dayjs';

interface OrdersListProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: 'Pending' | 'Processing' | 'Completed') => void;
}

const OrdersList: React.FC<OrdersListProps> = ({ orders, onUpdateStatus }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Orders List
      </Typography>
      {orders.length === 0 ? (
        <Typography variant="h6">No orders available.</Typography>
      ) : (
        <List>
          {orders.map((order) => (
            <ListItem key={order.id} sx={{ marginBottom: '10px' }}>
              <ListItemText
                primary={`Order #${order.id} - Total: $${order.totalPrice}`}
                secondary={`Status: ${order.status} | Placed on: ${dayjs(order.createdAt).format('DD/MM/YYYY')}`}
              />
              <Select
                value={order.status}
                onChange={(e) => onUpdateStatus(order.id, e.target.value as 'Pending' | 'Processing' | 'Completed')}
                sx={{ marginRight: '10px' }}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Processing">Processing</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default OrdersList;
export type { OrdersListProps };