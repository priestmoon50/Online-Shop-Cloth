"use client";

import React, { useEffect } from "react";
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
import { convertToEuro } from "@/utils/convertCurrency";

const validationSchema = yup.object().shape({
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
});

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  address: string;
  postalCode: string;
}

const CheckoutPage: React.FC = () => {
  const { cart, discountPercent, couponCode } = useCart();
  const router = useRouter();
  const { token, isAuthenticated, ready } = useAuth();
  const { t } = useTranslation();

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

  const calculateRawTotal = () =>
    cart.items.reduce(
      (acc, item) =>
        acc +
        item.variants.reduce(
          (sum, variant) => sum + item.price * variant.quantity,
          0
        ),
      0
    );

  const calculateTotal = () =>
    cart.items.reduce((acc, item) => {
      const isDiscounted =
        item.discountPrice !== undefined && item.discountPrice < item.price;
      const basePrice = isDiscounted
        ? item.discountPrice!
        : item.price;

      return (
        acc +
        item.variants.reduce(
          (sum, variant) => sum + basePrice * variant.quantity,
          0
        )
      );
    }, 0);


  const shippingFee = calculateTotal() < 60 ? 3.99 : 0;

  const totalPriceWithShipping = Number((
    calculateTotal() * (1 - discountPercent / 100) + shippingFee
  ).toFixed(2));


  const renderField = (
    name: keyof FormData,
    label: string,
    icon: React.ReactNode,
    readOnly = false
  ) => (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          label={label}
          error={!!errors[name]}
          helperText={errors[name]?.message}
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

  const handlePlaceOrder = async (data: FormData) => {
    if (cart.items.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    const itemsWithAdjustedPrices = cart.items.map((item) => {
      const isDiscounted =
        item.discountPrice !== undefined && item.discountPrice < item.price;
      const basePrice = isDiscounted
        ? item.discountPrice!
        : item.price * (1 - discountPercent / 100);

      return {
        ...item,
        priceBeforeDiscount: item.price,
        variants: item.variants.map((variant) => ({
          ...variant,
          price: basePrice,
        })),
      };
    });


    const rawTotal = calculateRawTotal();
    const totalPrice = totalPriceWithShipping;



    const orderData = {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      street: data.street,
      discountCode: couponCode,
      discountPercent,
      address: data.address,
      postalCode: data.postalCode,
      totalPrice,
      rawTotal,
      items: itemsWithAdjustedPrices,
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
        toast.error(t("orderSaveError", "Failed to save order"));
        return;
      }

      localStorage.setItem("orderId", saveResult.insertedId);
      localStorage.setItem("savedOrderData", JSON.stringify(orderData));

      const paypalRes = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalPrice }),
      });

      const paypalResult = await paypalRes.json();

      if (!paypalRes.ok || !paypalResult.approvalUrl) {
        toast.error(t("paypalError", "Error connecting to payment gateway"));
        return;
      }

      toast.success(t("redirectingToPaypal", "Redirecting to PayPal..."));
      localStorage.setItem("paypalOrderId", paypalResult.paypalOrderId);
      router.push(paypalResult.approvalUrl);
    } catch (error) {
      toast.error(t("checkoutError", "Checkout failed"));
    }
  };

  if (!ready) return <p>{t("loadingUser", "Loading user info...")}</p>;

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
          {t("checkoutTitle", "Checkout")}
        </Typography>

        <Typography variant="body1">
          {isAuthenticated
            ? t("userInfoLoaded", "Your account information has been loaded.")
            : t(
              "enterInfoOrLogin",
              "To complete your purchase, enter your information or log in."
            )}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <form onSubmit={handleSubmit(handlePlaceOrder)}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                {renderField(
                  "firstName",
                  t("firstName", "First Name"),
                  <PersonIcon sx={{ color: "#1976d2" }} />,
                  isAuthenticated
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField(
                  "lastName",
                  t("lastName", "Last Name"),
                  <PersonIcon sx={{ color: "#1976d2" }} />,
                  isAuthenticated
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField(
                  "email",
                  t("email", "Email"),
                  <EmailIcon sx={{ color: "#d81b60" }} />,
                  isAuthenticated
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField(
                  "phone",
                  t("phone", "Phone"),
                  <PhoneIcon sx={{ color: "#43a047" }} />,
                  isAuthenticated
                )}
              </Grid>
              <Grid item xs={12}>
                {renderField(
                  "address",
                  t("address", "Address"),
                  <HomeIcon sx={{ color: "#6d4c41" }} />
                )}
              </Grid>
              <Grid item xs={12}>
                {renderField(
                  "street",
                  t("street", "Street"),
                  <LocationOnIcon sx={{ color: "#5c6bc0" }} />
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderField(
                  "postalCode",
                  t("postalCode", "Postal Code"),
                  <LocalPostOfficeIcon sx={{ color: "#fbc02d" }} />
                )}
              </Grid>
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
                py: 1.5,
                "&:hover": {
                  backgroundColor: "#ffb347",
                },
              }}
            >
              {t("payWithPaypal", "PAY WITH PAYPAL")}
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
            {t("orderSummary", "Order Summary")}
          </Typography>

          {cart.items.length === 0 ? (
            <Typography variant="h6">
              {t("cartEmpty", "Your cart is currently empty.")}
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
                  {item.variants.map((variant, idx) => (
                    <Box key={idx} ml={1}>
                      <Typography variant="body2" color="text.secondary">
                        €{(item.discountPrice !== undefined && item.discountPrice < item.price ? item.discountPrice : item.price).toFixed(2)} × {variant.quantity}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("size", "Size")}: {variant.size || "N/A"} |{" "}
                        {t("color", "Color")}: {variant.color || "N/A"}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ))}
            </List>
          )}

          <Box mt={2}>
            <Typography
              variant="h6"
              sx={{
                backgroundColor: "#f1f8e9",
                padding: "12px 16px",
                borderRadius: "8px",
                fontWeight: "bold",
                fontSize: "18px",
                color: "#2e7d32",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {t("total", "Total")}:
              <span>€{totalPriceWithShipping.toFixed(2)}</span>
            </Typography>

            {shippingFee > 0 && (
              <Typography
                variant="body2"
                sx={{ mt: 1, color: "#f44336", fontStyle: "italic" }}
              >
                + €{shippingFee.toFixed(2)} {t("addedShippingCost", "shipping cost added")}
              </Typography>
            )}



            {shippingFee > 0 ? (
              <>
                <Typography
                  variant="body2"
                  sx={{ mt: 1, color: "#999", fontStyle: "italic" }}
                >
                  {t("shippingFee", { value: shippingFee.toFixed(2) })}

                </Typography>
              </>
            ) : (
              <>
                <Typography
                  variant="body2"
                  sx={{ mt: 1, color: "#4caf50", fontWeight: "medium" }}
                >
                  ✅ {t("freeShipping", "Free shipping applied (orders over €60).")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 0.5, color: "#999", fontStyle: "italic" }}
                >
                  {t("normalShipping", `Normal shipping fee: €3.99`)}
                </Typography>
              </>
            )}

          </Box>

          <Link href="/cart" passHref legacyBehavior>
            <Button
              variant="outlined"
              color="secondary"
              sx={{ mt: 2 }}
              fullWidth
            >
              {t("backToCart", "Back to Cart")}
            </Button>
          </Link>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;
