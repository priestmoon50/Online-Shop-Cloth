"use client";

import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
} from "@mui/material";
import styles from "./RegisterForm.module.css";
import { useTranslation } from "react-i18next";

export default function RegisterForm() {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName.trim() || !lastName.trim()) {
      setError(t("nameRequired"));
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setError(t("invalidEmail"));
      return;
    }

    if (!phone.startsWith("+") || phone.length < 7) {
      setError(t("invalidPhone"));
      return;
    }

    if (password.length < 6) {
      setError(t("shortPassword"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordsMismatch"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password: password.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.status === "pending-verification") {
          setError(t("emailNotVerified"));
          return;
        }

        if (response.status === 409) {
          setError(t("accountExists"));
        } else {
          setError(result.error || t("registerFailed"));
        }
        return;
      }

      window.location.href = `/verify-message?email=${encodeURIComponent(email.trim().toLowerCase())}`;
    } catch (err) {
      setError(t("serverError"));
    } finally {
      setLoading(false);
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const textFieldSx = {
    mb: 2,
    input: { color: "#fff" },
    label: { color: "#ccc" },
    "& label.Mui-focused": { color: "#fff" },
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "#aaa" },
      "&:hover fieldset": { borderColor: "#fff" },
      "&.Mui-focused fieldset": { borderColor: "#fff" },
    },
  };

  return (
    <Box className={styles.wrapper} sx={{ mt: isMobile ? 4 : 8 }}>
      <Paper
        elevation={4}
        className={styles.paper}
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.8)",
        }}
      >
        <Typography variant="h5" className={styles.header} mb={3} sx={{ color: "#fff" }}>
          {t("register")}
        </Typography>

        <TextField
          fullWidth
          label={t("firstName")}
          variant="outlined"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          sx={textFieldSx}
        />

        <TextField
          fullWidth
          label={t("lastName")}
          variant="outlined"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          sx={textFieldSx}
        />

        <TextField
          fullWidth
          label={t("email")}
          type="email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={textFieldSx}
        />

        <Box mb={2}>
          <PhoneInput
            country={"de"}
            value={phone}
            onChange={(value) => setPhone("+" + value)}
            inputProps={{ name: "phone", required: true }}
            inputStyle={{
              width: "100%",
              height: "56px",
              fontSize: "16px",
              borderRadius: "4px",
              backgroundColor: "transparent",
              color: "#fff",
              border: "1px solid #aaa",
              paddingLeft: "48px",
            }}
            buttonStyle={{
              backgroundColor: "transparent",
              border: "1px solid #aaa",
              borderTopLeftRadius: "4px",
              borderBottomLeftRadius: "4px",
            }}
            containerStyle={{ width: "100%", marginBottom: "16px" }}
          />
        </Box>

        <TextField
          fullWidth
          label={t("password")}
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={textFieldSx}
        />

        <TextField
          fullWidth
          label={t("confirmPassword")}
          type="password"
          variant="outlined"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={textFieldSx}
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
          color="primary"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : t("register")}
        </Button>
      </Paper>
    </Box>
  );
}
