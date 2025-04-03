// src/admin/dashboard/Dashboard.tsx
'use client';

import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import styles from './Dashboard.module.css'; // اضافه کردن CSS Module

interface DashboardProps {
  totalOrders: number;
  totalSales: number;
  totalProducts: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
}

const Dashboard: React.FC<DashboardProps> = ({
  totalOrders,
  totalSales,
  totalProducts,
  pendingOrders,
  shippedOrders,
  deliveredOrders,
}) => {
  return (
    <Box className={styles.dashboardContainer}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Total Orders</Typography>
            <Typography variant="h4">{totalOrders}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Total Sales</Typography>
            <Typography variant="h4">${totalSales.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Total Products</Typography>
            <Typography variant="h4">{totalProducts}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Pending Orders</Typography>
            <Typography variant="h4">{pendingOrders}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Shipped Orders</Typography>
            <Typography variant="h4">{shippedOrders}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className={styles.paper}>
            <Typography variant="h6">Delivered Orders</Typography>
            <Typography variant="h4">{deliveredOrders}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
