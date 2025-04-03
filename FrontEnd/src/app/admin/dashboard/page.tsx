// src/admin/dashboard/page.tsx
'use client';

import React from 'react';
import { Container, Typography } from '@mui/material';
import Dashboard from './Dashboard';
import withAdminAccess from '@/hoc/withAdminAccess';

// یاد آوری مهم  بعدا این بخش رو اگر نیاز بود اضافه میکنم


const AdminDashboardPage: React.FC = () => {
  // این داده‌ها می‌توانند به‌صورت داینامیک از API خوانده شوند
  const totalOrders = 120;
  const totalSales = 25999.99;
  const totalProducts = 35;
  const pendingOrders = 15;
  const shippedOrders = 60;
  const deliveredOrders = 45;

  return (
    <Container sx={{ marginTop: '100px' }}>
      <Typography variant="h4"  gutterBottom>
        Admin Dashboard
      </Typography>
      <Dashboard
        totalOrders={totalOrders}
        totalSales={totalSales}
        totalProducts={totalProducts}
        pendingOrders={pendingOrders}
        shippedOrders={shippedOrders}
        deliveredOrders={deliveredOrders}
      />
    </Container>
  );
};

export default withAdminAccess (AdminDashboardPage);
