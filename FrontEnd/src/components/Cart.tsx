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
  const { cart, removeItem, updateItem } = useCart();
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
  const shippingFee = discountedAmount < 60 ? 3.99 : 0;


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
















                <Box
                  display="flex"
                  flexDirection={{ xs: "column", md: "row" }}
                  gap={3}
                  p={2}
                  border="1px solid #e0e0e0"
                  borderRadius={3}
                  boxShadow="0 1px 6px rgba(0,0,0,0.05)"
                  alignItems="center"
                >
                  <Box
                    component="img"
                    src={item.image?.trim() ? item.image : "/placeholder.jpg"}
                    alt={item.name}
                    sx={{
                      width: { xs: "100%", sm: "100%", md: 160 },
                      height: "auto",
                      maxHeight: { xs: 260, sm: 300 },
                      objectFit: "contain",
                      borderRadius: 2,
                      opacity: isValid === false ? 0.5 : 1,
                      filter: isValid === false ? "grayscale(100%)" : "none",
                    }}
                  />


                  <Box flex="1">
                    <Typography fontWeight={600} fontSize="1.1rem" color="text.primary" mb={1}>
                      {item.name}
                    </Typography>

                    <Typography fontWeight="bold" color="text.secondary" mb={1}>
                      {typeof item.discountPrice === "number" &&
                        item.discountPrice > 0 &&
                        item.discountPrice < item.price ? (
                        <>
                          <span style={{ textDecoration: "line-through", marginRight: 8 }}>
                            €{Number(item.price || 0).toFixed(2)}

                          </span>
                          <span style={{ color: "#d32f2f" }}>
                            €{Number(item.discountPrice || 0).toFixed(2)}

                          </span>
                        </>
                      ) : (
                        <>€{Number(item.price || 0).toFixed(2)}</>

                      )}
                    </Typography>

                    {isValid === false && (
                      <>
                        <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                          ❌ {t("productNoLongerAvailable")}
                        </Typography>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => handleRemoveItem(String(item.id), "", undefined)}
                          sx={{ mb: 2 }}
                        >
                          {t("remove")}
                        </Button>
                      </>
                    )}

                    {Array.isArray(item.variants) &&
                      item.variants.map((variant, idx) => (
                        <Box
                          key={`${item.id}-${variant.size}-${variant.color}`}
                          mt={2}
                          p={2}
                          border="1px solid #ddd"
                          borderRadius={2}
                          bgcolor="#f9f9f9"
                        >
                          <Typography variant="body2">
                            <strong>{t("quantity")}:</strong>{" "}
                            {Math.min(variant.quantity, variant.stock ?? variant.quantity)}
                          </Typography>

                          {variant.stock !== undefined && variant.quantity > variant.stock && (
                            <Typography variant="caption" color="error">
                              {t("error.stockExceededShort", { stock: variant.stock })}
                            </Typography>
                          )}

                          <Typography variant="body2">
                            <strong>{t("size")}:</strong> {variant.size || "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>{t("color")}:</strong> {variant.color || "N/A"}
                          </Typography>

                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            sx={{ mt: 1 }}
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
                        </Box>
                      ))}
                  </Box>
                </Box>


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





          <Box
            sx={{
              mt: 2,
              mb: 3,
              p: 2,
              borderRadius: 2,
              backgroundColor: discountedAmount < 60 ? "#fff3e0" : "#e8f5e9",
              border: "1px solid",
              borderColor: discountedAmount < 60 ? "#ffb74d" : "#66bb6a",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: "bold",
                color: discountedAmount < 60 ? "#ef6c00" : "#2e7d32",
              }}
            >
              {discountedAmount < 60
                ? `+ €3.99 ${t("addedShippingCost", "shipping cost added")}`
                : `✅ ${t("freeShipping", "Free shipping applied (orders over €60).")}`}
            </Typography>

            <Typography
              variant="body2"
              sx={{ mt: 0.5, color: "#666", fontStyle: "italic" }}
            >
              {discountedAmount < 60
                ? t("shippingFee", { value: "3.99" })
                : t("normalShipping", `Normal shipping fee: €3.99`)}
            </Typography>
          </Box>






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
