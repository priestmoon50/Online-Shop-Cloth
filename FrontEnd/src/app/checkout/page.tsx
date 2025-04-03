"use client";

import React, { useState, useEffect, useMemo } from "react";
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

// تعریف schema برای اعتبارسنجی فرم
const validationSchema = yup.object().shape({
  address: yup.string().required("Address is required"),
});

interface FormData {
  address: string;
}

const CheckoutPage: React.FC = () => {
  const { cart, removeItem, updateItem } = useCart();
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
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (typeof window !== "undefined" && isAuthenticated) {
      const storedPhone = window.localStorage.getItem("phone");
      const userId = window.localStorage.getItem("userId");

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

    try {
      const orderData = {
        userId: userData.userId,
        items: cart.items,
        totalPrice: cart.items.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        ),
        name: userData.name,
        address: data.address,
        phone: userData.phone,
        status: "Pending",
      };

      window.localStorage.setItem("fullname", userData.name);
      window.localStorage.setItem("email", userData.email);
      window.localStorage.setItem("address", data.address);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        router.push("/confirmation");
      } else {
        alert("There was an error placing your order. Please try again.");
      }
    } catch (error) {
      alert("An unexpected error occurred. Please try again later.");
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
                helperText={errors.address ? errors.address.message : ""}
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
                    secondary={`Size: ${item.size || "N/A"}, Color: ${item.color || "N/A"}`}
                  />
                </ListItem>
              ))}
            </List>

            <Box sx={{ marginTop: "20px", textAlign: "center" }}>
              <Button variant="contained" color="primary" type="submit">
                Place Order
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
