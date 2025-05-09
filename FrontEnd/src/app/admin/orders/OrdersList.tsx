"use client";

import React from "react";
import styles from "./OrdersList.module.css";
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
} from "@mui/material";
import dayjs from "dayjs";
import { convertToEuro } from "@/utils/convertCurrency";

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
  status: "Pending" | "Processing" | "Completed";
  createdAt: string;
  totalPrice?: number;
}

interface OrdersListProps {
  orders: Order[];
  onUpdateStatus: (
    orderId: string,
    newStatus: "Pending" | "Processing" | "Completed"
  ) => void;
}

const OrdersList: React.FC<OrdersListProps> = ({ orders, onUpdateStatus }) => {
  return (
    <Box className={styles.tableContainer}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        لیست سفارش‌ها
      </Typography>

      {orders.length === 0 ? (
        <Typography variant="body1">هیچ سفارشی وجود ندارد.</Typography>
      ) : (
        orders.map((order) => (
          <Paper key={order._id} className={styles.orderCard} elevation={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} className={styles.orderHeader}>
                <Typography className={styles.orderId}>
                  سفارش #{order._id}
                </Typography>

                <Typography variant="caption" className={styles.orderDate}>
                  تاریخ: {dayjs(order.createdAt).format("YYYY/MM/DD - HH:mm")}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} className={styles.customerInfo}>
                <Typography>نام: {order.name}</Typography>
                <Typography>ایمیل: {order.email}</Typography>
                <Typography>تلفن: {order.phone}</Typography>
                <Typography>آدرس: {order.address}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} className={styles.itemsSection}>
                <Typography variant="subtitle2">آیتم‌ها:</Typography>
                <List dense>
                  {order.items.map((item) => (
                    <ListItem key={item.id} className={styles.itemRow}>
                      <ListItemText
                        primary={`${item.name} × ${item.quantity}`}
                        secondary={`رنگ: ${item.color || "نامشخص"} | سایز: ${
                          item.size || "نامشخص"
                        } | قیمت: €${convertToEuro(item.price)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              <Grid item xs={12} className={styles.statusSection}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" gutterBottom>
                  وضعیت سفارش:
                </Typography>
                <Select
                  value={order.status}
                  onChange={(e) =>
                    onUpdateStatus(order._id, e.target.value as Order["status"])
                  }
                  size="small"
                  className={styles.statusSelect}
                >
                  <MenuItem value="Pending">در انتظار</MenuItem>
                  <MenuItem value="Processing">در حال پردازش</MenuItem>
                  <MenuItem value="Completed">تکمیل‌شده</MenuItem>
                </Select>
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
