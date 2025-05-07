"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";

export default function VerifyMessagePage() {
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";

  const [timer, setTimer] = useState(60);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);

  const handleResend = async () => {
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Failed to resend email.");
        return;
      }

      setStatus("success");
      setMessage("Verification email resent successfully.");
      setTimer(60);
    } catch (err) {
      setStatus("error");
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" px={2}>
      <Paper elevation={4} sx={{ p: 4, maxWidth: 480, width: "100%", textAlign: "center" }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Verify Your Email
        </Typography>
        <Typography mb={2}>
          We sent a verification email to <strong>{email}</strong>. <br />
          Please check your inbox and click the link to activate your account.
        </Typography>

        {message && (
          <Alert severity={status === "error" ? "error" : "success"} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleResend}
          disabled={timer > 0 || status === "loading"}
        >
          {status === "loading"
            ? <CircularProgress size={22} color="inherit" />
            : timer > 0
              ? `Resend available in ${timer}s`
              : "Resend Verification Email"}
        </Button>
      </Paper>
    </Box>
  );
}
