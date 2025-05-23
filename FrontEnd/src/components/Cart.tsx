"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Divider,
  Skeleton,
  Modal,
  Stack,
  Container,
} from "@mui/material";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { CartItem } from "@/data/types";
import { convertToEuro } from "@/utils/convertCurrency";

const Cart: React.FC = () => {
  const { cart, removeItem, updateItem } = useCart();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const handleUpdateItem = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      setError(t("error.quantityTooLow"));
      return;
    }
    setLoading(true);
    try {
      await updateItem(id, newQuantity);
      setError(null);
    } catch {
      setError(t("error.updateFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (id: string) => {
    setLoading(true);
    try {
      await removeItem(id);
    } catch {
      setError(t("error.failedToRemoveItem"));
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    window.location.href = "/checkout";
  };

  const totalAmount = cart.items.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {loading ? (
        <Skeleton variant="rectangular" width="100%" height={200} />
      ) : cart.items.length === 0 ? (
        <Typography variant="h6">{t("emptyCart")}</Typography>
      ) : (
        <>
          {cart.items.map((item: CartItem) => (
            <Box
              key={item.id}
              sx={{
                borderBottom: "1px solid #eee",
                pb: 3,
                mb: 4,
              }}
            >
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={3}>
                  <Box
                    component="img"
                    src={item.image || "/placeholder.jpg"}
                    alt={item.name}
                    sx={{
                      width: "100%",
                      height: { xs: 200, md: 240 },
                      objectFit: "cover",
                      borderRadius: 2,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={9}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("price")}: €{convertToEuro(item.price)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("quantity")}: {item.quantity}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("size")}: {item.size || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t("color")}: {item.color || "N/A"}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleUpdateItem(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleUpdateItem(item.id, Math.max(1, item.quantity - 1))}
                    >
                      -
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      {t("remove")}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          ))}

          {error && (
            <Typography color="error" sx={{ my: 2 }}>
              {error}
            </Typography>
          )}

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" sx={{ mb: 2 }}>
            {t("total")}: €{convertToEuro(totalAmount)}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                onClick={handleProceedToCheckout}
                sx={{
                  backgroundColor: "#ffc439",
                  color: "#003087",
                  fontWeight: "bold",
                  fontSize: "16px",
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "#ffb347",
                  },
                }}
              >
                {t("proceedToCheckout")}
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Link href="/products" passHref legacyBehavior>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    py: 1.5,
                  }}
                >
                  {t("backToProducts")}
                </Button>
              </Link>
            </Grid>
          </Grid>

          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "white",
                padding: 4,
                borderRadius: 2,
                boxShadow: 24,
              }}
            >
              <Typography variant="h6" mb={2}>
                {t("Please Login To Continue")}
              </Typography>
              <Link href="/auth/login" passHref legacyBehavior>
                <Button variant="contained" color="primary">
                  {t("goToLogin")}
                </Button>
              </Link>
            </Box>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default Cart;
