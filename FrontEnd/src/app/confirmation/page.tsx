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
    const confirmPayment = async () => {
      try {
        // 1) PayPal روی لایو با ?token=<paypalOrderId> برمی‌گرده
        const tokenFromUrl = searchParams?.get("token") || undefined;

        // 2) Fallback به localStorage
        const paypalOrderId =
          tokenFromUrl || localStorage.getItem("paypalOrderId") || undefined;
        const localOrderId = localStorage.getItem("orderId") || undefined;
        const savedOrder = localStorage.getItem("savedOrderData") || undefined;

        if (!paypalOrderId) throw new Error("شناسه پرداخت (PayPal token) یافت نشد.");
        if (!localOrderId) throw new Error("شناسه سفارش محلی یافت نشد.");
        if (!savedOrder) throw new Error("داده سفارش در حافظه موجود نیست.");

        // 3) CAPTURE پرداخت
        const res = await fetch("/api/paypal/complete-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ orderId: paypalOrderId }),
        });

        const resData = await res.json();
        if (!res.ok) {
          throw new Error(
            resData?.error || "خطا در تایید پرداخت (Capture failed)"
          );
        }

        const statusStr: string | undefined = resData?.data?.status;
        if (statusStr !== "COMPLETED") {
          throw new Error("پرداخت نهایی نشد (COMPLETED نیست).");
        }

        const paypalCaptureId =
          resData?.data?.purchase_units?.[0]?.payments?.captures?.[0]?.id;
        if (!paypalCaptureId) {
          throw new Error("شناسه کپچر از پی‌پال دریافت نشد.");
        }

        // 4) آپدیت سفارش لوکال (paid=true و ذخیره captureId)
        const updateRes = await fetch("/api/orders/update-payment", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ orderId: localOrderId, paypalCaptureId }),
        });
        if (!updateRes.ok) {
          const errText = await updateRes.text().catch(() => "");
          throw new Error(
            `به‌روزرسانی سفارش با خطا مواجه شد.${errText ? ` (${errText})` : ""}`
          );
        }

        // 5) موفقیت → پاکسازی
        clearCart();
        localStorage.removeItem("orderId");
        localStorage.removeItem("paypalOrderId");
        localStorage.removeItem("savedOrderData");

        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err?.message || "خطای ناشناخته‌ای رخ داده است.");
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <Typography variant="body1">سفارش شما در حال پردازش است.</Typography>
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
          <Button
            variant="outlined"
            sx={{ marginTop: 2 }}
            onClick={() => router.push("/checkout")}
          >
            بازگشت به پرداخت
          </Button>
        </>
      )}
    </Box>
  );
}
