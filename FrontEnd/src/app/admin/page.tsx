// src/app/admin/page.tsx
"use client";

import React from "react";
import { Container, Grid, Paper, Typography, Button } from "@mui/material";
import Link from "next/link";
import withAdminAccess from "@/hoc/withAdminAccess";

const AdminDashboard: React.FC = () => {
  return (
    <Container sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Orders Management
            </Typography>
            <Link href="/admin/orders" passHref>
              <Button variant="contained" color="primary">
                Go to Orders
              </Button>
            </Link>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Products Management
            </Typography>
            <Link href="/admin/products" passHref>
              <Button variant="contained" color="primary">
                Go to Products
              </Button>
            </Link>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Discount Codes
            </Typography>
            <Link href="/admin/discounts" passHref>
              <Button variant="contained" color="secondary">
                Go to Discounts
              </Button>
            </Link>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Category Links
            </Typography>
            <Link href="/admin/category-links" passHref>
              <Button variant="contained" color="info">
                Edit Category Links
              </Button>
            </Link>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Home Slider
            </Typography>
            <Link href="/admin/home-slides" passHref>
              <Button variant="contained" color="warning">
                Manage Home Slider
              </Button>
            </Link>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default withAdminAccess(AdminDashboard);

