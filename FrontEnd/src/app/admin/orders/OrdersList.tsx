'use client';

import React from 'react';
import styles from './OrdersList.module.css';
import {
  Box,
  Typography,
  List,
  ListItem,
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

  if (!orders.length) {
    return (
      <Typography variant="body1" mt={2}>
        {t('noOrders')}
      </Typography>
    );
  }

  return (
    <Box className={styles.tableContainer}>
      {orders.map((order) => (
        <Paper key={order._id} className={styles.orderCard} elevation={3} sx={{ mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={1}
              >
                <Typography component="div" className={styles.orderId}>
                  {t('orderId')} #{order._id}
                </Typography>
                <Typography component="div" className={styles.orderDate}>
                  {t('date')}: {dayjs(order.createdAt).format('YYYY/MM/DD - HH:mm')}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box className={styles.sectionWrapper}>
                <Typography component="div" className={styles.sectionLabel}>
                  {t('customerInfo')}
                </Typography>
                <Box className={styles.infoBox}>
                  <Stack spacing={1}>
                    {[
                      ['name', order.name],
                      ['email', order.email],
                      ['phone', order.phone],
                      ['address', order.address],
                      ['street', order.street],
                      ['postalCode', order.postalCode],
                    ].map(([label, value]) => (
                      <Typography key={label} component="div" className={styles.field}>
                        <strong>{t(label)}:</strong> {value || t('unknown')}
                      </Typography>
                    ))}
                    <Box className={styles.field} display="flex" alignItems="center" gap={1}>
                      <Typography component="span">
                        <strong>{t('payment')}:</strong>
                      </Typography>
                      <Chip
                        label={order.paid ? t('paid') : t('notPaid')}
                        color={order.paid ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                    {order.paypalCaptureId && (
                      <Typography component="div" className={styles.field}>
                        <strong>PayPal ID:</strong> {order.paypalCaptureId}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box className={styles.sectionWrapper}>
                <Typography component="div" className={styles.sectionLabel}>
                  {t('items')}
                </Typography>
                <Box className={styles.infoBox}>
                  <List dense disablePadding>
                    {order.items.map((item) => (
                      <ListItem key={item.id} className={styles.itemRow}>
                        <Box>
                          <Typography component="div" className={styles.itemTitle}>
                            {item.name} × {item.quantity}
                          </Typography>
                          <Typography component="div" className={styles.itemField}>
                            <strong>{t('color')}:</strong> {item.color || t('unknown')}
                          </Typography>
                          <Typography component="div" className={styles.itemField}>
                            <strong>{t('size')}:</strong> {item.size || t('unknown')}
                          </Typography>
              <Typography component="div" className={styles.itemField}>
              <strong>{t('price')}:</strong> €{convertToEuro(item.price)}
              {item.priceBeforeDiscount && item.priceBeforeDiscount > item.price && (
                <span style={{ textDecoration: 'line-through', marginLeft: '8px', color: '#999' }}>
                  €{convertToEuro(item.priceBeforeDiscount)}
                </span>
              )}
            </Typography>

                        </Box>
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 1 }} />
                  <Typography component="div" className={styles.field}>
                    <strong>{t('totalPrice')}:</strong> €{convertToEuro(order.totalPrice || 0)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

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
                    PaperProps: { elevation: 4, style: { maxHeight: 200 } },
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
      ))}
    </Box>
  );
};

export default OrdersList;
export type { OrdersListProps };
