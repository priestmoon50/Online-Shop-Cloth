'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Snackbar,
  Alert,
  Button,
  Box,
  CircularProgress,
  Stack,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import OrdersList from './OrdersList';
import withAdminAccess from '@/hoc/withAdminAccess';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface OrderItem {
  id: string;
  name: string;
  price: number;
   priceBeforeDiscount?: number;
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
  street: string;
  postalCode: string;
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
  const { data: orders, isLoading, error } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders });

  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Processing' | 'Completed'>('all');
  const [visibleCount, setVisibleCount] = useState(5);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleUpdateStatus = async (_id: string, newStatus: Order['status']) => {
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

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    const term = searchTerm.toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        order.name.toLowerCase().includes(term) ||
        order.email.toLowerCase().includes(term) ||
        order.phone.toLowerCase().includes(term);

      const matchesPayment =
        paymentFilter === 'all' ||
        (paymentFilter === 'paid' && order.paid) ||
        (paymentFilter === 'unpaid' && !order.paid);

      const matchesStatus =
        statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesPayment && matchesStatus;
    });
  }, [orders, searchTerm, paymentFilter, statusFilter]);

  const visibleOrders = filteredOrders.slice(0, visibleCount);

  if (isLoading) {
    return (
      <Box mt={4} display="flex" flexDirection="column" alignItems="center">
        <CircularProgress />
        <Typography mt={2}>{t('loadingOrders')}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4} textAlign="center">
        <Typography color="error.main">{t('errorLoadingOrders')}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 6 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
        <Link href="/admin" passHref>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#FFD700',
              color: '#000',
              fontWeight: 600,
              px: 3,
              borderRadius: 2,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#FFC107',
              },
            }}
          >
            ← {t('back')}
          </Button>
        </Link>
      </Box>

      <Typography variant="h4" gutterBottom color="white">
        {t('adminOrders')}
      </Typography>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems="stretch"
        justifyContent="space-between"
        mb={4}
        flexWrap="wrap"
      >
        <TextField
          size="small"
          placeholder={t('Search by name, phone, email') || 'Search'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 200, maxWidth: 400 }}
        />

        <ToggleButtonGroup
          value={paymentFilter}
          exclusive
          onChange={(e, val) => val && setPaymentFilter(val)}
          size="small"
          color="primary"
        >
          <ToggleButton value="all">{t('all')}</ToggleButton>
          <ToggleButton value="paid">{t('paid')}</ToggleButton>
          <ToggleButton value="unpaid">{t('notPaid')}</ToggleButton>
        </ToggleButtonGroup>

        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(e, val) => val && setStatusFilter(val)}
          size="small"
          color="secondary"
        >
          <ToggleButton value="all">{t('allStatuses')}</ToggleButton>
          <ToggleButton value="Pending">{t('pending')}</ToggleButton>
          <ToggleButton value="Processing">{t('processing')}</ToggleButton>
          <ToggleButton value="Completed">{t('completed')}</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <OrdersList orders={visibleOrders} onUpdateStatus={handleUpdateStatus} />

      {visibleCount < filteredOrders.length && (
        <Box textAlign="center" mt={4}>
          <Button variant="outlined" onClick={handleLoadMore} sx={{ borderRadius: 2 }}>
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