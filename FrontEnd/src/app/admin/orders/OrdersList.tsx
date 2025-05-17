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
  Chip,
} from "@mui/material";
import dayjs from "dayjs";
import { convertToEuro } from "@/utils/convertCurrency";
import { useTranslation } from "react-i18next";

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
  paid?: boolean;
  paypalCaptureId?: string;
}

interface OrdersListProps {
  orders: Order[];
  onUpdateStatus: (
    orderId: string,
    newStatus: "Pending" | "Processing" | "Completed"
  ) => void;
}

const OrdersList: React.FC<OrdersListProps> = ({ orders, onUpdateStatus }) => {
  const { t } = useTranslation();

  return (
    <Box className={styles.tableContainer}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        {t("ordersListTitle")}
      </Typography>

      {orders.length === 0 ? (
        <Typography variant="body1">{t("noOrders")}</Typography>
      ) : (
        orders.map((order) => (
          <Paper key={order._id} className={styles.orderCard} elevation={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} className={styles.orderHeader}>
                <Typography className={styles.orderId}>
                  {t("orderId")} #{order._id}
                </Typography>
                <Typography variant="caption" className={styles.orderDate}>
                  {t("date")}: {dayjs(order.createdAt).format("YYYY/MM/DD - HH:mm")}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} className={styles.customerInfo}>
                <Typography>{t("name")}: {order.name}</Typography>
                <Typography>{t("email")}: {order.email}</Typography>
                <Typography>{t("phone")}: {order.phone}</Typography>
                <Typography>{t("address")}: {order.address}</Typography>
                <Typography>
                  {t("payment")}:
                  <Chip
                    label={order.paid ? t("paid") : t("notPaid")}
                    color={order.paid ? "success" : "warning"}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                {order.paypalCaptureId && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    PayPal ID: {order.paypalCaptureId}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6} className={styles.itemsSection}>
                <Typography variant="subtitle2">{t("items")}:</Typography>
                <List dense>
                  {order.items.map((item) => (
                    <ListItem key={item.id} className={styles.itemRow}>
                      <ListItemText
                        primary={`${item.name} × ${item.quantity}`}
                        secondary={`${t("color")}: ${item.color || t("unknown")} | ${t("size")}: ${item.size || t("unknown")} | ${t("price")}: €${convertToEuro(item.price)}`}
                      />
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 1 }} />
                <Typography>
                  {t("totalPrice")}: €{convertToEuro(order.totalPrice || 0)}
                </Typography>
              </Grid>

              <Grid item xs={12} className={styles.statusSection}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" gutterBottom>
                  {t("orderStatus")}:
                </Typography>
                <Select
                  value={order.status}
                  onChange={(e) =>
                    onUpdateStatus(order._id, e.target.value as Order["status"])
                  }
                  size="small"
                  className={styles.statusSelect}
                >
                  <MenuItem value="Pending">{t("pending")}</MenuItem>
                  <MenuItem value="Processing">{t("processing")}</MenuItem>
                  <MenuItem value="Completed">{t("completed")}</MenuItem>
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
