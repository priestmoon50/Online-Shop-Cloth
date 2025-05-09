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

export default function RegisterForm() {
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
      setError("First name and last name are required.");
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!phone.startsWith("+") || phone.length < 7) {
      setError("Please enter a valid phone number including country code.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
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
          setError(
            "You already registered but haven't verified your email. Check your inbox."
          );
          return;
        }

        if (response.status === 409) {
          setError("An account with this phone or email already exists! Please login.");
        } else {
          setError(result.error || "Something went wrong. Please try again.");
        }
        return;
      }

      window.location.href = `/verify-message?email=${encodeURIComponent(email.trim().toLowerCase())}`;
    } catch (err) {
      setError("Server error. Please try again later.");
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
          Register
        </Typography>

        <TextField
          fullWidth
          label="First Name"
          variant="outlined"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          sx={textFieldSx}
        />

        <TextField
          fullWidth
          label="Last Name"
          variant="outlined"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          sx={textFieldSx}
        />

        <TextField
          fullWidth
          label="Email"
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
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={textFieldSx}
        />

        <TextField
          fullWidth
          label="Confirm Password"
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
          {loading ? <CircularProgress size={24} color="inherit" /> : "Register"}
        </Button>
      </Paper>
    </Box>
  );
}
