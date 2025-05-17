'use client';

import React, { useState, useMemo } from 'react';
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
  TextField,
} from '@mui/material';
import dayjs from 'dayjs';
import { convertToEuro } from '@/utils/convertCurrency';
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
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const term = searchTerm.toLowerCase();
    return orders.filter(
      (order) =>
        order.name.toLowerCase().includes(term) ||
        order.email.toLowerCase().includes(term) ||
        order.phone.toLowerCase().includes(term)
    );
  }, [orders, searchTerm]);

  return (
    <Box className={styles.tableContainer}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        mb={3}
      >
        <Typography variant="h5" fontWeight="bold">
          {t('ordersListTitle')}
        </Typography>

        <TextField
          size="small"
          placeholder={t('search') || 'Search by name, email, phone'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </Stack>

      {filteredOrders.length === 0 ? (
        <Typography variant="body1" mt={2}>
          {t('noOrders')}
        </Typography>
      ) : (
        filteredOrders.map((order) => (
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
                <Box className={styles.sectionWrapper}>
                  <Typography className={styles.sectionLabel}>
                    {t('customerInfo')}
                  </Typography>
                  <Box className={styles.infoBox}>
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
                </Box>
              </Grid>

              {/* Order Items */}
              <Grid item xs={12} md={6}>
                <Box className={styles.sectionWrapper}>
                  <Typography className={styles.sectionLabel}>
                    {t('items')}
                  </Typography>
                  <Box className={styles.infoBox}>
                    <List dense disablePadding>
                      {order.items.map((item) => (
                        <ListItem key={item.id} className={styles.itemRow}>
                          <ListItemText
                            primary={
                              <Typography className={styles.itemTitle}>
                                {item.name} × {item.quantity}
                              </Typography>
                            }
                            secondary={
                              <Box className={styles.itemDetails}>
                                <Typography variant="body2" className={styles.itemField}>
                                  <strong>{t('color')}:</strong> {item.color || t('unknown')}
                                </Typography>
                                <Typography variant="body2" className={styles.itemField}>
                                  <strong>{t('size')}:</strong> {item.size || t('unknown')}
                                </Typography>
                                <Typography variant="body2" className={styles.itemField}>
                                  <strong>{t('price')}:</strong> €{convertToEuro(item.price)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Divider sx={{ my: 1 }} />
                    <Typography className={styles.field}>
                      <strong>{t('totalPrice')}:</strong> €{convertToEuro(order.totalPrice || 0)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Order Status */}
              <Grid item xs={12}>
                <Box mt={2}>
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
                    MenuProps={{
                      PaperProps: {
                        elevation: 4,
                        style: { maxHeight: 200 },
                      },
                      disableScrollLock: true,
                    }}
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
