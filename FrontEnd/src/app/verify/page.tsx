// 📁 src/app/verify/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper,
} from "@mui/material";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification token.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        } else {
          setStatus("success");
          setMessage(data.message || "Email verified successfully.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("An unexpected error occurred.");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      px={2}
    >
      <Paper elevation={4} sx={{ p: 4, maxWidth: 480, width: "100%" }}>
        {status === "loading" ? (
          <Box display="flex" flexDirection="column" alignItems="center">
            <CircularProgress />
            <Typography mt={2}>Verifying your email...</Typography>
          </Box>
        ) : (
          <>
            <Alert severity={status} sx={{ mb: 3 }}>
              {message}
            </Alert>

            {status === "success" && (
              <Button variant="contained" fullWidth href="/auth/login">
                Continue to Login
              </Button>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}
