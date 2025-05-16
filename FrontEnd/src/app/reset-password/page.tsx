"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Button,
  TextField,
  Typography,
  Box,
  Alert,
} from "@mui/material";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const validatePassword = (pwd: string) => {
    if (pwd.length < 6) return "Password must be at least 6 characters.";
    if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pwd)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(pwd)) return "Password must contain at least one number.";
    return "";
  };

  const handleSubmit = async () => {
    setError("");

    if (!token) {
      setError("Invalid or missing token.");
      return;
    }

    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Password reset failed.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <Typography color="error">Invalid reset link.</Typography>;
  }

  return (
    <Box maxWidth={400} mx="auto" mt={5}>
      {success ? (
        <Alert severity="success">
          Password changed successfully. You may log in now.
        </Alert>
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            Set a New Password
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            type="password"
            label="New Password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
          />

          <TextField
            type="password"
            label="Confirm Password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
          />

          <Button
            onClick={handleSubmit}
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? "Submitting..." : "Set New Password"}
          </Button>
        </>
      )}
    </Box>
  );
}
