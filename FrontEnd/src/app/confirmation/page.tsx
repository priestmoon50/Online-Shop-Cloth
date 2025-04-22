"use client";

import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function ConfirmationPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"success" | "error" | "">("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  useEffect(() => {
    const paypalToken = searchParams?.get("token");
    const localOrderId = localStorage.getItem("orderId");

    if (!paypalToken || !localOrderId) {
      setStatus("error");
      setErrorMessage("شناسه پرداخت یا سفارش پیدا نشد.");
      setLoading(false);
      return;
    }

    const confirmPayment = async () => {
      try {
        // ▶ مرحله ۱: تایید پرداخت در PayPal
        const res = await fetch("/api/paypal/complete-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: paypalToken }),
        });

        const resData = await res.json();

        if (!res.ok || resData?.data?.status !== "COMPLETED") {
          console.error("❌ PayPal capture failed:", resData);
          throw new Error("تایید پرداخت با شکست مواجه شد.");
        }

        const paypalCaptureId = resData.data.purchase_units?.[0]?.payments?.captures?.[0]?.id;
        if (!paypalCaptureId) {
          throw new Error("شناسه پرداخت PayPal موجود نیست.");
        }

        // ▶ مرحله ۲: به‌روزرسانی وضعیت سفارش
        const updateRes = await fetch("/api/orders/update-payment", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: localOrderId,
            paypalCaptureId,
          }),
        });

        if (!updateRes.ok) {
          const updateError = await updateRes.json();
          console.error("❌ Order update failed:", updateError);
          throw new Error("به‌روزرسانی سفارش با مشکل مواجه شد.");
        }

        // ▶ پاک‌سازی localStorage
        clearCart();
        localStorage.removeItem("orderId");

        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "خطای ناشناخته‌ای رخ داده است.");
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
            سفارش شما با موفقیت ثبت و پرداخت شد ✅
          </Typography>
          <Typography variant="body1">
            سفارش شما در حال پردازش است.
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
        <>
          <Typography color="error" variant="h6" gutterBottom>
            خطا در تایید پرداخت یا به‌روزرسانی سفارش
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {errorMessage}
          </Typography>
        </>
      )}
    </Box>
  );
}
