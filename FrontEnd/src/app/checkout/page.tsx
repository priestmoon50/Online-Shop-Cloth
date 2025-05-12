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
import SignInModal from "@/components/SignInModal";
import { convertToEuro } from "@/utils/convertCurrency";

const validationSchema = yup.object().shape({
  address: yup.string().required("Address is required"),
});

interface FormData {
  address: string;
}

const CheckoutPage: React.FC = () => {
  const { cart } = useCart();
  const router = useRouter();
  const { token, isAuthenticated, ready } = useAuth();

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    userId: "",
  });

  const [openModal, setOpenModal] = useState(false);

  const {
    handleSubmit,
    control,
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
          const { firstName, lastName, email, phone, _id } = data.user;
          setUserData({ firstName, lastName, email, phone, userId: _id });
        }
      })
      .catch((err) => console.error("Failed to fetch user data", err));
  }, [ready, isAuthenticated, token]);

  const handlePlaceOrder = async (data: FormData) => {
    if (!isAuthenticated) {
      setOpenModal(true);
      return;
    }

    if (cart.items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const { firstName, lastName, email, phone } = userData;
    if (!firstName || !lastName || !email || !phone) {
      alert("Incomplete user profile. Please complete your account info.");
      return;
    }

    const totalPrice = cart.items.reduce(
      (acc, item) => acc + Number(item.price) * item.quantity,
      0
    );

    const orderData = {
      name: `${firstName} ${lastName}`,
      email,
      phone,
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

      <SignInModal open={openModal} onClose={() => setOpenModal(false)} />

      <form onSubmit={handleSubmit(handlePlaceOrder)}>
        <Box sx={{ marginBottom: "20px" }}>
          <TextField
            fullWidth
            label="First Name"
            value={userData.firstName}
            InputProps={{ readOnly: true }}
            sx={{ marginBottom: "10px" }}
          />
          <TextField
            fullWidth
            label="Last Name"
            value={userData.lastName}
            InputProps={{ readOnly: true }}
            sx={{ marginBottom: "10px" }}
          />
          <TextField
            fullWidth
            label="Email"
            value={userData.email}
            InputProps={{ readOnly: true }}
            sx={{ marginBottom: "10px" }}
          />
          <TextField
            fullWidth
            label="Phone"
            value={userData.phone}
            InputProps={{ readOnly: true }}
            sx={{ marginBottom: "10px" }}
          />
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
                <Button variant="outlined" color="secondary" sx={{ marginLeft: "10px" }}>
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
