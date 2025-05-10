"use client";
import { useState } from "react";
import { Box, Typography, TextField, Button, Alert } from "@mui/material";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email) return setError("Email is required");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to send reset email.");
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8, p: 3 }}>
      <Typography variant="h5" mb={2}>
        Forgot Password
      </Typography>

      {sent ? (
        <Alert severity="success">Reset link sent to your email.</Alert>
      ) : (
        <>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Button variant="contained" fullWidth onClick={handleSubmit}>
            Send Reset Link
          </Button>
        </>
      )}
    </Box>
  );
}
