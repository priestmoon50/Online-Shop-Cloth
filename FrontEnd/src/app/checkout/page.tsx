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

const validationSchema = yup.object().shape({
  address: yup.string().required("Address is required"),
});

interface FormData {
  address: string;
}

const CheckoutPage: React.FC = () => {
  const { cart } = useCart();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [userData, setUserData] = useState({
    name: "",
    phone: "",
    email: "",
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
    if (typeof window !== "undefined" && isAuthenticated) {
      const storedPhone = localStorage.getItem("phone");
      const userId = localStorage.getItem("userId");

      setUserData({
        name: "",
        phone: storedPhone || "",
        email: "",
        userId: userId || "",
      });
    }
  }, [isAuthenticated]);

  const handlePlaceOrder = async (data: FormData) => {
    if (!isAuthenticated) {
      setOpenModal(true);
      return;
    }

    if (cart.items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (!userData.name || !userData.phone) {
      alert("Please complete all required fields.");
      return;
    }

    const totalPrice = cart.items.reduce(
      (acc, item) => acc + Number(item.price) * item.quantity,
      0
    );

    const orderData = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: data.address,
      totalPrice,
      items: cart.items,
      createdAt: new Date().toISOString(),
      status: "Pending",
    };

    try {
      // 1. ذخیره سفارش در دیتابیس
      const saveRes = await fetch("/api/orders/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!saveRes.ok) {
        const err = await saveRes.json();
        console.error("❌ Error saving order:", err);
        alert("خطا در ذخیره سفارش. لطفاً دوباره تلاش کنید.");
        return;
      }

      const saveResult = await saveRes.json();
      const insertedId = saveResult.insertedId;

      if (!insertedId) {
        alert("خطا در دریافت شناسه سفارش.");
        return;
      }

      localStorage.setItem("orderId", insertedId);

      // 2. ساخت سفارش در PayPal
      const paypalRes = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalPrice: orderData.totalPrice })
      });

      if (!paypalRes.ok) {
        const err = await paypalRes.json();
        console.error("❌ PayPal error:", err);
        alert("خطا در ارتباط با درگاه پرداخت.");
        return;
      }

      const { approvalUrl } = await paypalRes.json();
      if (!approvalUrl) {
        alert("درگاه پرداخت یافت نشد.");
        return;
      }

      router.push(approvalUrl);
    } catch (error) {
      console.error("🔥 Unexpected checkout error:", error);
      alert("مشکلی در ثبت سفارش یا ارتباط با درگاه رخ داد.");
    }
  };

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
            label="Name"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            sx={{ marginBottom: "10px" }}
          />
          <TextField
            fullWidth
            label="Email"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
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
                sx={{ marginBottom: "10px" }}
              />
            )}
          />
          <TextField
            fullWidth
            label="Phone"
            value={userData.phone}
            InputProps={{ readOnly: isAuthenticated }}
            sx={{ marginBottom: "20px" }}
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
                    primary={`${item.name} - $${item.price} x ${item.quantity}`}
                    secondary={`Size: ${item.size || "N/A"}, Color: ${
                      item.color || "N/A"
                    }`}
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
