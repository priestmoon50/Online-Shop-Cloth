import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import dayjs from 'dayjs';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

interface Order {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  status: 'Pending' | 'Processing' | 'Completed';
  createdAt: string;
  totalPrice?: number;
}

interface OrdersListProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: 'Pending' | 'Processing' | 'Completed') => void;
}

const OrdersList: React.FC<OrdersListProps> = ({ orders, onUpdateStatus }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        لیست سفارش‌ها
      </Typography>

      {orders.length === 0 ? (
        <Typography variant="h6">هیچ سفارشی وجود ندارد.</Typography>
      ) : (
        <List>
          {orders.map((order) => (
            <Box key={order._id} sx={{ border: '1px solid #ccc', borderRadius: 2, mb: 3, p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                سفارش #{order._id}
              </Typography>
              <Typography variant="body2">
                تاریخ: {dayjs(order.createdAt).format('YYYY/MM/DD - HH:mm')}
              </Typography>
              <Typography variant="body2">نام: {order.name}</Typography>
              <Typography variant="body2">ایمیل: {order.email}</Typography>
              <Typography variant="body2">تلفن: {order.phone}</Typography>
              <Typography variant="body2">آدرس: {order.address}</Typography>

              <Box mt={2}>
                <Typography variant="subtitle2">آیتم‌ها:</Typography>
                <List dense>
                  {order.items.map((item) => (
                    <ListItem key={item.id} sx={{ pl: 0 }}>
                      <ListItemText
                        primary={`${item.name} - ${item.quantity} عدد`}
                        secondary={`رنگ: ${item.color || 'نامشخص'} | سایز: ${item.size || 'نامشخص'} | قیمت: $${item.price}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Typography variant="body2" mt={1}>
                وضعیت سفارش:
              </Typography>
              <Select
                value={order.status}
                onChange={(e) =>
                  onUpdateStatus(order._id, e.target.value as 'Pending' | 'Processing' | 'Completed')
                }
                size="small"
                sx={{ mt: 1, mb: 1 }}
              >
                <MenuItem value="Pending">در انتظار</MenuItem>
                <MenuItem value="Processing">در حال پردازش</MenuItem>
                <MenuItem value="Completed">تکمیل‌شده</MenuItem>
              </Select>
            </Box>
          ))}
        </List>
      )}
    </Box>
  );
};

export default OrdersList;
export type { OrdersListProps };
