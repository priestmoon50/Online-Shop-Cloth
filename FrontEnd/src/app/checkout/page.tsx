"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Grid,
  Avatar,
  Divider,
} from "@mui/material";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "@/context/AuthContext";
import { convertToEuro } from "@/utils/convertCurrency";
import toast, { Toaster } from "react-hot-toast";

const validationSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().required("Phone is required"),
  address: yup.string().required("Address is required"),
});

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

const CheckoutPage: React.FC = () => {
  const { cart } = useCart();
  const router = useRouter();
  const { token, isAuthenticated, ready } = useAuth();

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (!ready || !isAuthenticated || !token) return;

    fetch("/api/user/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          const { firstName, lastName, email, phone } = data.user;
          setValue("firstName", firstName);
          setValue("lastName", lastName);
          setValue("email", email);
          setValue("phone", phone);
        }
      })
      .catch(() => toast.error("Failed to load user info."));
  }, [ready, isAuthenticated, token, setValue]);

  const handlePlaceOrder = async (data: FormData) => {
    if (cart.items.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    const totalPrice = cart.items.reduce(
      (acc, item) => acc + Number(item.price) * item.quantity,
      0
    );

    const orderData = {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      address: data.address,
      totalPrice,
      items: cart.items,
      createdAt: new Date().toISOString(),
      status: "Pending",
    };

    try {
      const saveRes = await fetch("/api/orders/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const saveResult = await saveRes.json();

      if (!saveRes.ok || !saveResult.insertedId) {
        toast.error("خطا در ذخیره سفارش");
        return;
      }

      localStorage.setItem("orderId", saveResult.insertedId);

      const paypalRes = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalPrice }),
      });

      const paypalResult = await paypalRes.json();

      if (!paypalRes.ok || !paypalResult.approvalUrl) {
        toast.error("خطا در ارتباط با درگاه پرداخت.");
        return;
      }

      toast.success("در حال هدایت به PayPal...");
      localStorage.setItem("paypalOrderId", paypalResult.paypalOrderId);
      router.push(paypalResult.approvalUrl);
    } catch (error) {
      toast.error("مشکل در ثبت سفارش یا اتصال به درگاه");
    }
  };

  if (!ready) return <p>در حال بارگذاری اطلاعات کاربر...</p>;

  return (
    <Box sx={{ px: { xs: 2, sm: 4 }, py: 4 }}>
      <Toaster position="top-right" />
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {isAuthenticated
              ? "اطلاعات شما از حساب کاربری بارگذاری شده است."
              : "برای تکمیل خرید، اطلاعات خود را وارد کنید یا وارد حساب کاربری شوید."}
          </Typography>

          <form onSubmit={handleSubmit(handlePlaceOrder)}>
            <Grid container spacing={2}>
              {["firstName", "lastName", "email", "phone", "address"].map((fieldName) => (
                <Grid item xs={12} sm={fieldName === "address" ? 12 : 6} key={fieldName}>
                  <Controller
                    name={fieldName as keyof FormData}
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={
                          fieldName === "firstName" ? "First Name" :
                          fieldName === "lastName" ? "Last Name" :
                          fieldName === "email" ? "Email" :
                          fieldName === "phone" ? "Phone" : "Address"
                        }
                        error={!!errors[fieldName as keyof FormData]}
                        helperText={errors[fieldName as keyof FormData]?.message || ""}
                        InputProps={isAuthenticated && fieldName !== "address" ? { readOnly: true } : undefined}
                      />
                    )}
                  />
                </Grid>
              ))}
            </Grid>

            <Button
              variant="contained"
              type="submit"
              fullWidth
              sx={{
                mt: 3,
                backgroundColor: "#ffc439",
                color: "#003087",
                fontWeight: "bold",
                fontSize: "16px",
                padding: "12px",
                "&:hover": {
                  backgroundColor: "#ffb347",
                },
              }}
            >
              PAY WITH PAYPAL
            </Button>
          </form>
        </Grid>

        {/* جداکننده ظریف */}
        <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" }, mx: 2 }} />

        <Grid item xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            Order Summary
          </Typography>

          {cart.items.length === 0 ? (
            <Typography variant="h6">Your cart is currently empty.</Typography>
          ) : (
            <List>
              {cart.items.map((item) => (
                <ListItem key={item.id} alignItems="flex-start">
                  <Avatar
                    src={item.image || "/placeholder.jpg"}
                    variant="rounded"
                    sx={{ width: 64, height: 64, mr: 2 }}
                  />
                  <ListItemText
                    primary={`${item.name} - €${convertToEuro(item.price)} x ${item.quantity}`}
                    secondary={`Size: ${item.size || "N/A"} | Color: ${item.color || "N/A"}`}
                  />
                </ListItem>
              ))}
            </List>
          )}

          <Typography variant="h6" sx={{ mt: 2 }}>
            Total: €{convertToEuro(cart.items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0))}
          </Typography>

          <Link href="/cart" passHref>
            <Button variant="outlined" color="secondary" sx={{ mt: 2 }} fullWidth>
              Back to Cart
            </Button>
          </Link>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CheckoutPage;
