"use client";
import { useState } from "react";
import { Button, TextField, Typography } from "@mui/material";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) setSent(true);
  };

  return (
    <div>
      <Typography variant="h5">Forgot your password?</Typography>
      {!sent ? (
        <>
          <TextField
            label="Email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={handleSubmit} variant="contained">Send Reset Link</Button>
        </>
      ) : (
        <Typography>Password reset link sent to your email.</Typography>
      )}
    </div>
  );
}
