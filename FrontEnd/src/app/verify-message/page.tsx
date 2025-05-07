"use client";

import { useSearchParams } from "next/navigation";
import { Box, Typography, Paper } from "@mui/material";

export default function VerifyMessagePage() {
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") ?? "";

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" px={2}>
      <Paper elevation={4} sx={{ p: 4, maxWidth: 500, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Verify Your Email
        </Typography>
        <Typography>
          {email
            ? `We sent a verification email to ${email}. Please check your inbox and click the link to activate your account.`
            : "Please check your email to complete verification."}
        </Typography>
      </Paper>
    </Box>
  );
}
