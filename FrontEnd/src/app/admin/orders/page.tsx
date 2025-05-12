'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Snackbar,
  Alert,
  Button,
  Box,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import OrdersList, { OrdersListProps } from './OrdersList';
import withAdminAccess from '@/hoc/withAdminAccess';
import Link from 'next/link';

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
  totalPrice: number;
  paid?: boolean;
  paypalCaptureId?: string;
}

const fetchOrders = async (): Promise<Order[]> => {
  const res = await fetch('/api/orders', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
};

const OrdersPage: React.FC = () => {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const [orderList, setOrderList] = useState<Order[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (orders) setOrderList(orders);
  }, [orders]);

  const handleUpdateStatus = async (_id: string, newStatus: Order['status']) => {
    const updatedOrders = orderList.map((order) =>
      order._id === _id ? { ...order, status: newStatus } : order
    );
    setOrderList(updatedOrders);

    try {
      const res = await fetch(`/api/orders/${_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error();
      setSnackbarMessage('وضعیت سفارش با موفقیت تغییر یافت');
      setSnackbarSeverity('success');
    } catch {
      setSnackbarMessage('خطا در تغییر وضعیت سفارش');
      setSnackbarSeverity('error');
    }

    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  if (isLoading) return <div>در حال بارگذاری...</div>;
  if (error) return <div>خطا در بارگذاری سفارش‌ها</div>;

  return (
    <Container sx={{ mt: 6 }}>
      <Box sx={{ mb: 3 }}>
        <Link href="/admin" passHref>
          <Button variant="outlined" color="primary">
            ← Back to Admin Dashboard
          </Button>
        </Link>
      </Box>

      <Typography variant="h4" gutterBottom color="white">
        مدیریت سفارش‌ها
      </Typography>

      <OrdersList
        orders={orderList}
        onUpdateStatus={handleUpdateStatus as OrdersListProps['onUpdateStatus']}
      />

      <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default withAdminAccess(OrdersPage);