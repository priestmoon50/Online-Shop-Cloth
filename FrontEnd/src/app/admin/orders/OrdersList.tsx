'use client';

import React from 'react';
import styles from './OrdersList.module.css';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  Divider,
  Paper,
  Grid,
  Chip,
  Stack,
} from '@mui/material';
import dayjs from 'dayjs';
import { convertToEuro } from '@/utils/convertCurrency';
import { useTranslation } from 'react-i18next';

import Image from 'next/image';

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
  paid?: boolean;
  paypalCaptureId?: string;
}

interface OrdersListProps {
  orders: Order[];
  onUpdateStatus: (
    orderId: string,
    newStatus: 'Pending' | 'Processing' | 'Completed'
  ) => void;
}

const OrdersList: React.FC<OrdersListProps> = ({ orders, onUpdateStatus }) => {
  const { t } = useTranslation();

  return (
    <Box className={styles.tableContainer}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {t('ordersListTitle')}
      </Typography>

      {orders.length === 0 ? (
        <Typography variant="body1" mt={2}>
          {t('noOrders')}
        </Typography>
      ) : (
        orders.map((order) => (
          <Paper key={order._id} className={styles.orderCard} elevation={3}>
            <Grid container spacing={3}>
              {/* Header */}
              <Grid item xs={12}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={1}
                >
                  <Typography className={styles.orderId}>
                    {t('orderId')} #{order._id}
                  </Typography>
                  <Typography className={styles.orderDate}>
                    {t('date')}: {dayjs(order.createdAt).format('YYYY/MM/DD - HH:mm')}
                  </Typography>
                </Stack>
              </Grid>

              {/* Customer Info */}
              <Grid item xs={12} md={6}>
                <Box className={styles.infoBox}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('customerInfo')}
                  </Typography>
                  <Stack spacing={1}>
                    <Typography className={styles.field}>
                      <strong>{t('name')}:</strong> {order.name}
                    </Typography>
                    <Typography className={styles.field}>
                      <strong>{t('email')}:</strong> {order.email}
                    </Typography>
                    <Typography className={styles.field}>
                      <strong>{t('phone')}:</strong> {order.phone}
                    </Typography>
                    <Typography className={styles.field}>
                      <strong>{t('address')}:</strong> {order.address}
                    </Typography>
                    <Typography className={styles.field}>
                      <strong>{t('payment')}:</strong>{' '}
                      <Chip
                        label={order.paid ? t('paid') : t('notPaid')}
                        color={order.paid ? 'success' : 'warning'}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    {order.paypalCaptureId && (
                      <Typography className={styles.field}>
                        <strong>PayPal ID:</strong> {order.paypalCaptureId}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Grid>

              {/* Order Items */}
              <Grid item xs={12} md={6}>
                <Box className={styles.infoBox}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('items')}
                  </Typography>
                  <List dense disablePadding>
                    {order.items.map((item) => (
                      <ListItem key={item.id} className={styles.itemRow}>
                        <ListItemText
                          primary={`${item.name} × ${item.quantity}`}
                          secondary={`${t('color')}: ${item.color || t('unknown')} | ${t('size')}: ${item.size || t('unknown')} | ${t('price')}: €${convertToEuro(item.price)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 1 }} />
                  <Typography className={styles.field}>
                    <strong>{t('totalPrice')}:</strong> €{convertToEuro(order.totalPrice || 0)}
                  </Typography>
                </Box>
              </Grid>

              {/* Order Status */}
              <Grid item xs={12}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    {t('orderStatus')}:
                  </Typography>
                  <Select
                    value={order.status}
                    onChange={(e) =>
                      onUpdateStatus(order._id, e.target.value as Order['status'])
                    }
                    size="small"
                    className={styles.statusSelect}
                  >
                    <MenuItem value="Pending">{t('pending')}</MenuItem>
                    <MenuItem value="Processing">{t('processing')}</MenuItem>
                    <MenuItem value="Completed">{t('completed')}</MenuItem>
                  </Select>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default OrdersList;
export type { OrdersListProps };
