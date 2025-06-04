// src/app/admin/page.tsx
"use client";
import React, { Suspense } from "react";
import { Container, Grid, Paper, Typography, Button } from "@mui/material";
import Link from "next/link";
import withAdminAccess from "@/hoc/withAdminAccess";

const OrdersPage = React.lazy(() => import("./orders/page"));
const ProductsPage = React.lazy(() => import("./products/page"));

const AdminDashboard: React.FC = () => {
  return (
    <Container sx={{ marginTop: "100px" }}>
      <Typography variant="h3" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: "16px" }}>
            <Typography variant="h6">Orders Management</Typography>
            <Link href="/admin/orders" passHref>
              <Button
                variant="contained"
                color="primary"
                style={{ marginBottom: "16px" }}
              >
                Go to Orders
              </Button>
            </Link>
            <Suspense fallback={<div>Loading Orders...</div>}>
              <OrdersPage />
            </Suspense>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: "16px" }}>
            <Typography variant="h6">Products Management</Typography>
            <Link href="/admin/products" passHref>
              <Button
                variant="contained"
                color="primary"
                style={{ marginBottom: "16px" }}
              >
                Go to Products
              </Button>
            </Link>
            <Suspense fallback={<div>Loading Products...</div>}>
              <ProductsPage />
            </Suspense>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: "16px" }}>
            <Typography variant="h6">Discount Codes</Typography>
            <Link href="/admin/discounts" passHref>
              <Button
                variant="contained"
                color="secondary"
                style={{ marginBottom: "16px" }}
              >
                Go to Discounts
              </Button>
            </Link>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default withAdminAccess(AdminDashboard);
