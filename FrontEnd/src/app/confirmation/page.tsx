"use client";

import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function ConfirmationPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"success" | "error" | "">("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  useEffect(() => {
    const token = searchParams?.get("token");
 // همان orderId از PayPal

    if (!token) {
      setStatus("error");
      setLoading(false);
      return;
    }

    const confirmPayment = async () => {
      try {
        // مرحله 1: تایید پرداخت در PayPal
        const res = await fetch("/api/paypal/complete-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: token }),
        });

        if (!res.ok) throw new Error("Payment capture failed");

        // مرحله 2: ذخیره سفارش در دیتابیس
        const name = localStorage.getItem("fullname");
        const email = localStorage.getItem("email");
        const phone = localStorage.getItem("phone");
        const address = localStorage.getItem("address");
        const cart = localStorage.getItem("cart");

        if (!name || !email || !address || !cart) {
          throw new Error("Missing localStorage data");
        }

        const order = {
          name,
          email,
          phone,
          address,
          items: JSON.parse(cart),
          createdAt: new Date().toISOString(),
        };

        const saveRes = await fetch("/api/orders/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        });

        if (!saveRes.ok) throw new Error("Order save failed");

        // موفقیت‌آمیز: پاک‌سازی داده‌ها
        clearCart();
        localStorage.removeItem("fullname");
        localStorage.removeItem("email");
        localStorage.removeItem("phone");
        localStorage.removeItem("address");

        setStatus("success");
      } catch (err) {
        console.error("❌", err);
        setStatus("error");
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, []);

  return (
    <Box sx={{ padding: 4, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        تایید پرداخت
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : status === "success" ? (
        <>
          <Typography variant="h6" color="green" gutterBottom>
            سفارش شما با موفقیت ثبت شد ✅
          </Typography>
          <Typography variant="body1">
            پرداخت تایید شده و سفارش شما در حال پردازش است.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ marginTop: 3 }}
            onClick={() => router.push("/")}
          >
            بازگشت به صفحه اصلی
          </Button>
        </>
      ) : (
        <Typography color="error" variant="h6">
          خطا در تایید پرداخت یا ثبت سفارش. لطفاً با پشتیبانی تماس بگیرید.
        </Typography>
      )}
    </Box>
  );
}
