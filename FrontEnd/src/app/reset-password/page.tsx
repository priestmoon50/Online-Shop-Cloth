"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, TextField, Typography } from "@mui/material";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const handleSubmit = async () => {
    if (!token) return;

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) setSuccess(true);
  };

  if (!token) {
    return <Typography color="error">Invalid reset link</Typography>;
  }

  return success ? (
    <Typography>Password changed successfully. You may log in now.</Typography>
  ) : (
    <>
      <TextField
        type="password"
        label="New Password"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
      />
      <Button onClick={handleSubmit} variant="contained">
        Set New Password
      </Button>
    </>
  );
}
