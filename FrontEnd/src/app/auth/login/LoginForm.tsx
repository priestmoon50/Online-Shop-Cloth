"use client";

import styles from "./LoginForm.module.css";
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
import { useTranslation } from "react-i18next";

export default function LoginForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleLogin = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError(t("invalidEmail"));
      setLoading(false);
      return;
    }

    if (!password) {
      setError(t("enterPassword"));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("loginFailed"));
        return;
      }

      localStorage.setItem("token", data.token);
      setSuccess(t("loginSuccess"));
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch {
      setError(t("serverError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className={styles.wrapper}>
      <Paper
        elevation={4}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.8)",
        }}
      >
 <Typography
  variant="h5"
  mb={2}
  sx={{ color: "#fff", textAlign: "center" }}  // ← این خط اضافه شده
>
  {t("login")}
</Typography>


        <TextField
          fullWidth
          label={t("email")}
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            mb: 2,
            input: { color: "#fff" },
            label: { color: "#ccc" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#aaa" },
              "&:hover fieldset": { borderColor: "#fff" },
              "&.Mui-focused fieldset": { borderColor: "#fff" },
            },
          }}
        />

        <TextField
          fullWidth
          label={t("password")}
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            mb: 2,
            input: { color: "#fff" },
            label: { color: "#ccc" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#aaa" },
              "&:hover fieldset": { borderColor: "#fff" },
              "&.Mui-focused fieldset": { borderColor: "#fff" },
            },
          }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : t("login")}
        </Button>

        <Box mt={2} textAlign="center">
          <Button
            variant="text"
            href="/forgot-password"
            sx={{ color: "#90caf9", fontSize: "0.9rem" }}
          >
            {t("forgotPassword")}
          </Button>

          <Box mt={1}>
            <Typography variant="body2" sx={{ color: "#f3f3f3" }}>
              {t("noAccount")}
            </Typography>
            <Button
              variant="text"
              href="/auth/register"
              sx={{ color: "#90caf9", fontSize: "1rem" }}
            >
              {t("signUp")}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
