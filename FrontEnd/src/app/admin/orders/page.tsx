// src/admin/orders/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Snackbar, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import OrdersList, { OrdersListProps } from './OrdersList';
import { Order } from '@/data/types';
import withAdminAccess from '@/hoc/withAdminAccess';

const fetchOrders = async (): Promise<Order[]> => {
  const response = await fetch('/api/orders'); // فرض می‌کنیم API داریم
  return response.json();
};

const OrdersPage: React.FC = () => {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],  // تغییر به استفاده از شیء
    queryFn: fetchOrders,
  });

  const [orderList, setOrderList] = useState<Order[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    console.log("Orders data:", orders);  
    if (orders) {
      setOrderList(orders);
    }
  }, [orders]);

  const handleUpdateStatus = (id: string, newStatus: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled') => {
    const updatedOrders = orderList.map((order) =>
      order.id === id ? { ...order, status: newStatus } : order
    );
    setOrderList(updatedOrders);
    setSnackbarMessage('Order status updated successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading orders</div>;
  
  return (
    <Container sx={{ marginTop: '100px' }}>
      <Typography color='white' variant="h4" gutterBottom>
        Orders Management
      </Typography>
      <OrdersList orders={orderList} onUpdateStatus={handleUpdateStatus as OrdersListProps['onUpdateStatus']} />
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default withAdminAccess(OrdersPage);
