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
} from "@mui/material";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "@/context/AuthContext";
import { convertToEuro } from "@/utils/convertCurrency";

const validationSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email().required("Email is required"),
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

  const [userData, setUserData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

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
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          const { firstName, lastName, email, phone } = data.user;
          setUserData({ firstName, lastName, email, phone, address: "" });
          setValue("firstName", firstName);
          setValue("lastName", lastName);
          setValue("email", email);
          setValue("phone", phone);
        }
      })
      .catch((err) => console.error("Failed to fetch user data", err));
  }, [ready, isAuthenticated, token, setValue]);

  const handlePlaceOrder = async (data: FormData) => {
    if (cart.items.length === 0) {
      alert("Your cart is empty!");
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
        console.error("❌ Error saving order:", saveResult);
        alert("خطا در ذخیره سفارش. لطفاً دوباره تلاش کنید.");
        return;
      }

      localStorage.setItem("orderId", saveResult.insertedId);

      const paypalRes = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalPrice }),
      });

      const paypalResult = await paypalRes.json();

      if (!paypalRes.ok || !paypalResult.approvalUrl || !paypalResult.paypalOrderId) {
        console.error("❌ PayPal error:", paypalResult);
        alert("خطا در ارتباط با درگاه پرداخت.");
        return;
      }

      localStorage.setItem("paypalOrderId", paypalResult.paypalOrderId);
      router.push(paypalResult.approvalUrl);
    } catch (error) {
      console.error("🔥 Unexpected checkout error:", error);
      alert("مشکلی در ثبت سفارش یا ارتباط با درگاه رخ داد.");
    }
  };

  if (!ready) return <p>در حال بارگذاری اطلاعات کاربر...</p>;

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        {isAuthenticated
          ? "اطلاعات شما از حساب کاربری بارگذاری شده است."
          : "برای تکمیل خرید، اطلاعات خود را وارد کنید یا وارد حساب کاربری شوید."}
      </Typography>

      <form onSubmit={handleSubmit(handlePlaceOrder)}>
        <Box sx={{ marginBottom: "20px" }}>
          {["firstName", "lastName", "email", "phone"].map((field) => (
            <Controller
              key={field}
              name={field as keyof FormData}
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={field.name === "firstName"
                    ? "First Name"
                    : field.name === "lastName"
                    ? "Last Name"
                    : field.name === "email"
                    ? "Email"
                    : "Phone"}
                  error={!!errors[field.name as keyof FormData]}
                  helperText={
                    errors[field.name as keyof FormData]?.message || ""
                  }
                  sx={{ marginBottom: "10px" }}
                  InputProps={
                    isAuthenticated ? { readOnly: true } : undefined
                  }
                />
              )}
            />
          ))}

          <Controller
            name="address"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Address"
                error={!!errors.address}
                helperText={errors.address?.message}
                sx={{ marginBottom: "20px" }}
              />
            )}
          />
        </Box>

        <Typography variant="h5" gutterBottom>
          Order Summary
        </Typography>

        {cart.items.length === 0 ? (
          <Typography variant="h6">Your cart is currently empty.</Typography>
        ) : (
          <>
            <List>
              {cart.items.map((item) => (
                <ListItem key={item.id}>
                  <ListItemText
                    primary={`${item.name} - €${convertToEuro(item.price)} x ${item.quantity}`}
                    secondary={`Size: ${item.size || "N/A"}, Color: ${item.color || "N/A"}`}
                  />
                </ListItem>
              ))}
            </List>

            <Box sx={{ marginTop: "20px", textAlign: "center" }}>
              <Button variant="contained" color="primary" type="submit">
                Pay with PayPal
              </Button>
              <Link href="/cart" passHref>
                <Button
                  variant="outlined"
                  color="secondary"
                  sx={{ marginLeft: "10px" }}
                >
                  Back to Cart
                </Button>
              </Link>
            </Box>
          </>
        )}
      </form>
    </Box>
  );
};

export default CheckoutPage;
