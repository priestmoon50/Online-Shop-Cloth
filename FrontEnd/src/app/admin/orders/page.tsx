'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Snackbar,
  Alert,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import OrdersList, { OrdersListProps } from './OrdersList';
import withAdminAccess from '@/hoc/withAdminAccess';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const [orderList, setOrderList] = useState<Order[]>([]);
  const [visibleCount, setVisibleCount] = useState(5);
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
      setSnackbarMessage(t('orderStatusSuccess'));
      setSnackbarSeverity('success');
    } catch {
      setSnackbarMessage(t('orderStatusError'));
      setSnackbarSeverity('error');
    }

    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const handleLoadMore = () => setVisibleCount((prev) => prev + 5);

  if (isLoading) {
    return (
      <Box mt={4} textAlign="center">
        <CircularProgress />
        <Typography mt={2}>{t('loadingOrders')}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4} textAlign="center">
        <Typography color="error">{t('errorLoadingOrders')}</Typography>
      </Box>
    );
  }

  const visibleOrders = orderList.slice(0, visibleCount);

  return (
    <Container sx={{ mt: 6 }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
  <Link href="/admin" passHref>
    <Button
      variant="contained"
      sx={{
        backgroundColor: "#FFD700",
        color: "#000",
        fontWeight: 600,
        px: 3,
        borderRadius: "8px",
        boxShadow: "none",
        '&:hover': {
          backgroundColor: "#FFC107",
        },
      }}
    >
      ← Back
    </Button>
  </Link>
</Box>

      <Typography variant="h4" gutterBottom color="white">
        {t('adminOrders')}
      </Typography>

      <OrdersList
        orders={visibleOrders}
        onUpdateStatus={handleUpdateStatus as OrdersListProps['onUpdateStatus']}
      />

      {visibleCount < orderList.length && (
        <Box textAlign="center" mt={3}>
          <Button variant="contained" onClick={handleLoadMore}>
            {t('loadMore')}
          </Button>
        </Box>
      )}

      <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default withAdminAccess(OrdersPage);
