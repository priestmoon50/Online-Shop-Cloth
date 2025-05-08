// 📁 src/app/login/LoginForm.tsx
"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleRequestCode = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          setError("No account found with this email.");
        } else if (res.status === 403) {
          setError("Your account is not verified. Please check your email.");
        } else {
          setError(data.error || "Failed to send code.");
        }
        return;
      }
      

      setSuccess("Verification code sent to your email.");
      setTimeout(() => {
        window.location.href = `/verify-code?email=${encodeURIComponent(email.trim())}`;
      }, 1500);
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper elevation={4} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
        <Typography variant="h5" mb={2}>Login with Email</Typography>
        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Button
          fullWidth
          variant="contained"
          onClick={handleRequestCode}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Send Code"}
        </Button>
      </Paper>
    </Box>
  );
}
