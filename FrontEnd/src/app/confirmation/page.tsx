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
    const token = searchParams?.get("token");
    console.log("📦 PayPal token (orderId):", token);

    if (!token) {
      setStatus("error");
      setErrorMessage("کد سفارش نامعتبر است.");
      setLoading(false);
      return;
    }

    const confirmPayment = async () => {
      try {
        // ▶ مرحله 1: تایید پرداخت در PayPal
        const res = await fetch("/api/paypal/complete-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: token }),
        });

        const resData = await res.json();

        if (!res.ok || resData?.data?.status !== "COMPLETED") {
          console.error("❌ PayPal capture error:", resData);
          throw new Error("تایید پرداخت موفق نبود.");
        }

        // ▶ مرحله 2: دریافت اطلاعات کاربر از localStorage
        const name = localStorage.getItem("fullname");
        const email = localStorage.getItem("email");
        const phone = localStorage.getItem("phone");
        const address = localStorage.getItem("address");
        const cart = localStorage.getItem("cart");

        if (!name || !email || !address || !cart) {
          throw new Error("اطلاعات سفارش ناقص است.");
        }

        const order = {
          name,
          email,
          phone,
          address,
          items: JSON.parse(cart),
          createdAt: new Date().toISOString(),
        };

        // ▶ مرحله 3: ذخیره سفارش
        const saveRes = await fetch("/api/orders/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        });

        const saveData = await saveRes.json();

        if (!saveRes.ok) {
          console.error("❌ Order saving error:", saveData);
          throw new Error("ذخیره سفارش با خطا مواجه شد.");
        }

        // ▶ موفقیت نهایی
        clearCart();
        localStorage.removeItem("fullname");
        localStorage.removeItem("email");
        localStorage.removeItem("phone");
        localStorage.removeItem("address");

        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "خطای نامشخصی رخ داده است.");
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
        <>
          <Typography color="error" variant="h6" gutterBottom>
            خطا در تایید پرداخت یا ثبت سفارش.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {errorMessage}
          </Typography>
        </>
      )}
    </Box>
  );
}
