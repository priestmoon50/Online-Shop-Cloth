"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  List,
  Grid,
  Avatar,
  Divider,
  Container,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  LocationOn as LocationOnIcon,
  LocalPostOffice as LocalPostOfficeIcon,
  ShoppingCartCheckout as ShoppingCartCheckoutIcon,
  ReceiptLong as ReceiptLongIcon,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Stack } from "@mui/material";

/* --------------------------------- Types --------------------------------- */
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  address: string;
  postalCode: string;
}



const toNum = (v: unknown): number => {
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};


/* ------------------------------- Validators ------------------------------- */
const validationSchema: yup.ObjectSchema<FormData> = yup
  .object({
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    phone: yup.string().required("Phone is required"),
    address: yup.string().required("Address is required"),
    postalCode: yup
      .string()
      .required("Postal code is required")
      .matches(/^[0-9]{4,10}$/, "Invalid postal code"),
    street: yup.string().required("Street is required"),
  })
  .required();

/* --------------------------- Safe JSON fetch helper ----------------------- */
async function safeFetchJSON<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Request failed:", url, res.status, text);
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    console.error("Non-JSON response:", url, text);
    throw new Error("Server did not return JSON");
  }
  return res.json();
}

/* -------------------------------- Component ------------------------------- */
const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const { cart, discountPercent, couponCode } = useCart();
  const { token, isAuthenticated, ready } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(false);

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      street: "",
      address: "",
      postalCode: "",
    },
  });

  /* -------------------------- Prefill user information -------------------------- */
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!ready || !isAuthenticated || !token) return;
      setPrefillLoading(true);
      try {
        const res = await fetch("/api/user/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!ignore && data?.user) {
          const { firstName, lastName, email, phone } = data.user;
          if (firstName) setValue("firstName", firstName);
          if (lastName) setValue("lastName", lastName);
          if (email) setValue("email", email);
          if (phone) setValue("phone", phone);
        }
      } catch {
        toast.error(t("failedToLoadUser", { defaultValue: "Failed to load user info." }));
      } finally {
        setPrefillLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [ready, isAuthenticated, token, setValue, t]);

  /* ------------------------------ Price helpers ------------------------------ */
  const calculateRawTotal = useMemo(() => {
    return cart.items.reduce((acc, item) => {
      const price = toNum(item.price);
      const add = item.variants.reduce(
        (sum, variant) => sum + price * Number(variant.quantity || 0),
        0
      );
      return acc + add;
    }, 0);
  }, [cart.items]);

  const calculateDiscountedItemsTotal = useMemo(() => {
    return cart.items.reduce((acc, item) => {
      const price = toNum(item.price);
      const discount = item.discountPrice != null ? toNum(item.discountPrice) : undefined;
      const basePrice = discount !== undefined && discount < price ? discount : price;
      const add = item.variants.reduce(
        (sum, variant) => sum + basePrice * Number(variant.quantity || 0),
        0
      );
      return acc + add;
    }, 0);
  }, [cart.items]);

  const discountedTotal = useMemo(() => {
    const val = calculateDiscountedItemsTotal * (1 - discountPercent / 100);
    return Number(val.toFixed(2));
  }, [calculateDiscountedItemsTotal, discountPercent]);

  const shippingFee = useMemo(() => (discountedTotal < 60 ? 3.99 : 0), [discountedTotal]);

  const totalPriceWithShipping = useMemo(() => {
    return Number((discountedTotal + shippingFee).toFixed(2));
  }, [discountedTotal, shippingFee]);

  /* ---------------------------- Field render helper --------------------------- */
  const renderField = (
    name: keyof FormData,
    label: string,
    icon: React.ReactNode,
    readOnly = false
  ) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          label={label}
          error={!!errors[name]}
          helperText={(errors[name]?.message as string) || ""}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">{icon}</InputAdornment>
            ),
            readOnly,
          }}
        />
      )}
    />
  );

  /* --------------------------------- Submit --------------------------------- */
  const handlePlaceOrder = async (data: FormData) => {
    if (cart.items.length === 0) {
      toast.error(t("emptyCart", { defaultValue: "Your cart is empty!" }));
      return;
    }

    setSubmitting(true);
    try {
      // Normalize per-variant unit prices with two decimals (client-side snapshot)
      const itemsWithAdjustedPrices = cart.items.map((item) => {
        const price = toNum(item.price);
        const discount = item.discountPrice != null ? toNum(item.discountPrice) : undefined;
        const isDiscounted = discount !== undefined && discount < price;
        const base = isDiscounted ? discount : price;
        const finalUnit = base * (1 - discountPercent / 100);

        return {
          ...item,
          priceBeforeDiscount: Number(price.toFixed(2)),
          variants: item.variants.map((variant) => ({
            ...variant,
            price: Number(finalUnit.toFixed(2)),
          })),
        };
      });


      const rawTotal = calculateRawTotal;
      const totalPrice = totalPriceWithShipping; // number
      const totalForGateway = totalPriceWithShipping.toFixed(2); // string (PayPal wants string)

      const orderData = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        street: data.street,
        discountCode: couponCode,
        discountPercent,
        address: data.address,
        postalCode: data.postalCode,
        totalPrice, // number (backend آن را به صورت عدد می‌پذیرد و نرمال می‌کند)
        rawTotal,
        items: itemsWithAdjustedPrices,
        createdAt: new Date().toISOString(),
        status: "Pending",
      };

      // 1) Save order
      const saveResult = await safeFetchJSON<{ insertedId: string; success: boolean }>(
        "/api/orders/save",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(orderData),
        }
      );

      if (!saveResult?.insertedId) {
        toast.error(t("orderSaveError", { defaultValue: "Failed to save order" }));
        return;
      }

      localStorage.setItem("orderId", saveResult.insertedId);
      localStorage.setItem("savedOrderData", JSON.stringify(orderData));

      // 2) Create PayPal order (amount as string with 2 decimals)
      const paypalResult = await safeFetchJSON<{ approvalUrl: string; paypalOrderId?: string }>(
        "/api/paypal/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ totalPrice: totalForGateway }),
        }
      );

      if (!paypalResult?.approvalUrl) {
        toast.error(t("paypalError", { defaultValue: "Error connecting to payment gateway" }));
        return;
      }

      toast.success(t("redirectingToPaypal", { defaultValue: "Redirecting to PayPal..." }));
      if (paypalResult.paypalOrderId) {
        localStorage.setItem("paypalOrderId", paypalResult.paypalOrderId);
      }

      // 3) Redirect to PayPal
      router.push(paypalResult.approvalUrl);
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(
        t("checkoutError", { defaultValue: "Checkout failed" }) +
        (error?.message ? `: ${error.message}` : "")
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* --------------------------------- Render -------------------------------- */
  if (!ready) {
    return <p>{t("loadingUser", { defaultValue: "Loading user info..." })}</p>;
  }

  const readOnly = isAuthenticated && !prefillLoading;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Toaster position="bottom-center" />

      <Box textAlign="center" mb={4}>
        <Typography
          variant="h4"
          fontWeight="bold"
          display="flex"
          justifyContent="center"
          alignItems="center"
          gap={1}
          gutterBottom
        >
          <ShoppingCartCheckoutIcon sx={{ color: "#1976d2", fontSize: 32 }} />
          {t("checkoutTitle", { defaultValue: "Checkout" })}
        </Typography>

        <Typography variant="body1">
          {isAuthenticated
            ? t("userInfoLoaded", {
              defaultValue: "Your account information has been loaded.",
            })
            : t("enterInfoOrLogin", {
              defaultValue:
                "To complete your purchase, enter your information or log in.",
            })}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <form onSubmit={handleSubmit(handlePlaceOrder)}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                {renderField(
                  "firstName",
                  t("firstName", { defaultValue: "First Name" }),
                  <PersonIcon sx={{ color: "#1976d2" }} />,
                  readOnly
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField(
                  "lastName",
                  t("lastName", { defaultValue: "Last Name" }),
                  <PersonIcon sx={{ color: "#1976d2" }} />,
                  readOnly
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField(
                  "email",
                  t("email", { defaultValue: "Email" }),
                  <EmailIcon sx={{ color: "#d81b60" }} />,
                  readOnly
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField(
                  "phone",
                  t("phone", { defaultValue: "Phone" }),
                  <PhoneIcon sx={{ color: "#43a047" }} />,
                  readOnly
                )}
              </Grid>

              <Grid item xs={12}>
                {renderField(
                  "street",
                  t("street", { defaultValue: "Street" }),
                  <LocationOnIcon sx={{ color: "#5c6bc0" }} />
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField(
                  "postalCode",
                  t("postalCode", { defaultValue: "Postal Code" }),
                  <LocalPostOfficeIcon sx={{ color: "#fbc02d" }} />
                )}
              </Grid>
              <Grid item xs={12}>
                {renderField(
                  "address",
                  t("address", { defaultValue: "Address" }),
                  <HomeIcon sx={{ color: "#6d4c41" }} />
                )}
              </Grid>
            </Grid>

            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={submitting || prefillLoading || cart.items.length === 0}
              sx={{
                mt: 3,
                backgroundColor: "#ffc439",
                color: "#003087",
                fontWeight: "bold",
                fontSize: "16px",
                py: 1.5,
                "&:hover": { backgroundColor: "#ffb347" },
              }}
              startIcon={
                submitting ? <CircularProgress size={20} color="inherit" /> : undefined
              }
            >
              {submitting
                ? t("processing", { defaultValue: "Processing..." })
                : t("payWithPaypal", { defaultValue: "PAY WITH PAYPAL" })}
            </Button>
          </form>
        </Grid>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ display: { xs: "none", md: "block" }, mx: 2 }}
        />

        <Grid item xs={12} md={4}>
          <Typography
            variant="h5"
            gutterBottom
            display="flex"
            alignItems="center"
            gap={1}
          >
            <ReceiptLongIcon sx={{ color: "#1976d2" }} />
            {t("orderSummary", { defaultValue: "Order Summary" })}
          </Typography>

          {cart.items.length === 0 ? (
            <Typography variant="h6">
              {t("cartEmpty", { defaultValue: "Your cart is currently empty." })}
            </Typography>
          ) : (
            <List>
              {cart.items.map((item) => (
                <Box
                  key={item.id}
                  display="flex"
                  gap={2}
                  mb={2}
                  p={2}
                  border="1px solid #e0e0e0"
                  borderRadius="8px"
                  bgcolor="#fafafa"
                >
                  <Avatar
                    src={item.image || "/placeholder.jpg"}
                    variant="rounded"
                    sx={{ width: 64, height: 64 }}
                  />
                  <Box ml={1}>
                    {item.variants.map((variant, idx) => {
                      const base = (item.discountPrice !== undefined && toNum(item.discountPrice) < toNum(item.price))
                        ? toNum(item.discountPrice)
                        : toNum(item.price);

                      const unit = Number((base * (1 - discountPercent / 100)).toFixed(2));

                      return (
                        <Box key={`${item.id}-${idx}`} mb={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            €{unit.toFixed(2)} × {variant.quantity}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t("size", { defaultValue: "Size" })}: {variant.size || "N/A"} |{" "}
                            {t("color", { defaultValue: "Color" })}: {variant.color || "N/A"}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </List>
          )}

          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              border: "2px solid #e0e0e0",
              backgroundColor: "#fff",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              mt: 3,
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ display: "flex", justifyContent: "space-between" }}>
                <span>{t("itemsTotal", { defaultValue: "Items Total" })}</span>
                <span>€{discountedTotal.toFixed(2)}</span>
              </Typography>

              <Typography variant="h6" sx={{ display: "flex", justifyContent: "space-between" }}>
                <span>{t("shipping", { defaultValue: "Shipping" })}</span>
                <span>€{shippingFee.toFixed(2)}</span>
              </Typography>

              <Divider />

              <Typography
                variant="h5"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "bold",
                  mt: 1,
                  color: "#1976d2",
                }}
              >
                <span>{t("total", { defaultValue: "Total" })}</span>
                <span>€{totalPriceWithShipping.toFixed(2)}</span>
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  color: discountedTotal < 60 ? "#d84315" : "#388e3c",
                  fontStyle: "italic",
                }}
              >
                {discountedTotal < 60
                  ? `+ €3.99 ${t("addedShippingCost", { defaultValue: "shipping cost added" })}`
                  : `✅ ${t("freeShipping", {
                    defaultValue: "Free shipping applied (orders over €60).",
                  })}`}
              </Typography>
            </Stack>
          </Box>

          <Link href="/cart" passHref legacyBehavior>
            <Button variant="outlined" color="secondary" sx={{ mt: 2 }} fullWidth>
              {t("backToCart", { defaultValue: "Back to Cart" })}
            </Button>
          </Link>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;
