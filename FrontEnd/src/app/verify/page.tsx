"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Alert,
  Button,
} from "@mui/material";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams?.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing or invalid.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Your email has been verified.");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      } catch {
        setStatus("error");
        setMessage("Something went wrong. Please try again later.");
      }
    };

    verify();
  }, [searchParams]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      px={2}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          maxWidth: 500,
          width: "100%",
          textAlign: "center",
          borderRadius: 2,
        }}
      >
        {status === "loading" ? (
          <>
            <CircularProgress />
            <Typography mt={2}>Verifying your email...</Typography>
          </>
        ) : (
          <>
            <Alert severity={status} sx={{ mb: 3 }}>
              {message}
            </Alert>

            {status === "success" && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                href="/login"
              >
                Continue to Login
              </Button>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}
