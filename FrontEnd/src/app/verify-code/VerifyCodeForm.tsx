"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface VerifyCodeFormProps {
  email: string;
}

export default function VerifyCodeForm({ email }: VerifyCodeFormProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || "/account";
  
  const { login } = useAuth();

  const handleVerify = async () => {
    setError("");

    if (!/^\d{6}$/.test(code)) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid code. Please try again.");
        return;
      }

      login(data.token); // ثبت توکن
      router.push(redirectTo); // ریدایرکت شرطی
    } catch {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" px={2}>
      <Paper elevation={4} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h6" gutterBottom textAlign="center">
          Enter the 6-digit code sent to your email
        </Typography>

        <TextField
          fullWidth
          label="Verification Code"
          variant="outlined"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          sx={{ mb: 2 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleVerify}
          disabled={loading || code.length !== 6}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Verify"}
        </Button>
      </Paper>
    </Box>
  );
}
