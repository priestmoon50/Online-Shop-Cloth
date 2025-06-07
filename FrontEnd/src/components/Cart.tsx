"use client";

import React, { useState, useEffect } from "react";
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
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { CartItem } from "@/data/types";
import { convertToEuro } from "@/utils/convertCurrency";

const Cart: React.FC = () => {
  const { cart, removeItem } = useCart();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [validProducts, setValidProducts] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const checkProducts = async () => {
      const results: { [key: string]: boolean } = {};

      await Promise.all(
        cart.items.map(async (item) => {
          try {
            const res = await fetch(`/api/products?id=${item.id}`);
            const data = await res.json();
            results[item.id] = !!data?.id;
          } catch {
            results[item.id] = false;
          }
        })
      );

      setValidProducts(results);
    };

    if (cart.items.length > 0) {
      checkProducts();
    }
  }, [cart.items]);

  const handleRemoveItem = async (id: string, size: string, color?: string) => {
    setLoading(true);
    try {
      await removeItem(id, size, color);
    } catch {
      setError(t("error.failedToRemoveItem"));
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    window.location.href = "/checkout";
  };

const handleApplyDiscount = async () => {
  const hasDiscountedItem = cart.items.some(
    (item) =>
      typeof item.discountPrice === "number" &&
      item.discountPrice > 0 &&
      item.discountPrice < item.price
  );

  if (hasDiscountedItem) {
    setDiscountPercent(0);
    setError(t("discountErrorHasDiscountedItem"));

    return;
  }

  try {
    const res = await fetch(`/api/discounts/validate?code=${couponCode}`);
    const data = await res.json();

    if (data.valid) {
      setDiscountPercent(data.percentage);
      setError(null);
    } else {
      setDiscountPercent(0);
setError(data.error || t("invalidDiscountCode"));

    }
  } catch {
    setDiscountPercent(0);
   setError(t("error.validatingDiscountCode"));

  }
};


const totalAmount = cart.items.reduce((total, item) => {
  const variants = Array.isArray(item.variants) ? item.variants : [];
  const rawPrice = item.discountPrice ?? item.price;
const euroPrice = rawPrice;

  const itemTotal = variants.reduce(
    (sum, variant) => sum + euroPrice * variant.quantity,
    0
  );
  return total + itemTotal;
}, 0);

  const discountedAmount = totalAmount * (1 - discountPercent / 100);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {loading ? (
        <Skeleton variant="rectangular" width="100%" height={200} />
      ) : cart.items.length === 0 ? (
        <Typography variant="h6">{t("emptyCart")}</Typography>
      ) : (
        <>
          {cart.items.map((item: CartItem) => {
            const isValid = validProducts[item.id];
            const unitPrice = item.discountPrice ?? item.price;

            return (
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
                        opacity: isValid === false ? 0.5 : 1,
                        filter: isValid === false ? "grayscale(100%)" : "none",
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={9}>
                    {isValid === false && (
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => handleRemoveItem(String(item.id), "", undefined)}
                        >
                          {t("remove")}
                        </Button>
                      </Stack>
                    )}

                    {isValid === false && (
                      <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                        ❌ {t("productNoLongerAvailable")}
                      </Typography>
                    )}

{typeof item.discountPrice === "number" &&
 item.discountPrice > 0 &&
 item.discountPrice < item.price ? (
  <>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ textDecoration: "line-through" }}
    >
      €{Number(item.price).toFixed(2)}
    </Typography>
    <Typography variant="body2" color="error">
      {t("discountedPrice")}: €{Number(item.discountPrice).toFixed(2)}
    </Typography>
  </>
) : (
  <Typography variant="body2" color="text.secondary">
    €{Number(item.price).toFixed(2)}
  </Typography>
)}


                    {Array.isArray(item.variants) &&
                      item.variants.map((variant, idx) => (
                        <Box key={idx} mt={1} p={2} border="1px solid #ddd" borderRadius={2}>
                          <Typography variant="body2" color="text.secondary">
                            {t("quantity")}: {variant.quantity}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t("size")}: {variant.size || "N/A"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {t("color")}: {variant.color || "N/A"}
                          </Typography>

                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              onClick={() =>
                                handleRemoveItem(
                                  String(item.id),
                                  String(variant.size),
                                  variant.color ? String(variant.color) : undefined
                                )
                              }
                            >
                              {t("remove")}
                            </Button>
                          </Stack>
                        </Box>
                      ))}
                  </Grid>
                </Grid>
              </Box>
            );
          })}

          {error && (
            <Typography color="error" sx={{ my: 2 }}>
              {error}
            </Typography>
          )}

          <Divider sx={{ my: 4 }} />

          <Box sx={{ my: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {t("discountCode")}
            </Typography>
            <Stack direction="row" spacing={2}>
              <input
                type="text"
                placeholder={t("enterDiscountCode")}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  minWidth: "0",
                }}
              />
              <Button
                variant="contained"
                onClick={handleApplyDiscount}
                sx={{
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  fontWeight: "bold",
                  px: 3,
                  "&:hover": {
                    backgroundColor: "#1565c0",
                  },
                }}
              >
                {t("apply")}
              </Button>
            </Stack>
          </Box>

          {discountPercent > 0 && (
            <Typography color="success.main" sx={{ mb: 1 }}>
              ✅ {discountPercent}% تخفیف اعمال شد!
            </Typography>
          )}

          <Typography variant="h6" sx={{ mb: 2 }}>
      
{t("total")}: €{discountedAmount.toFixed(2)}

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
