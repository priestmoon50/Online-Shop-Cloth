"use client";

import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!phone.startsWith("+") || phone.length < 6) {
      setError("Please enter a valid phone number with country code.");
      return;
    }

    setError("");
    localStorage.setItem("token", "mock-token");
    localStorage.setItem("phone", phone);
    window.location.href = "/account";
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box className={styles.wrapper} sx={{ mt: isMobile ? 4 : 8 }}>
      <Paper elevation={4} className={styles.paper}>
        <Typography variant="h5" className={styles.header}>
          Login with Phone
        </Typography>

        <PhoneInput
          country={"de"}
          value={phone}
          onChange={(value) => setPhone("+" + value)}
          inputProps={{
            name: "phone",
            required: true,
            autoFocus: true,
          }}
          inputStyle={{
            width: "100%",
            height: "45px",
            fontSize: "16px",
            borderRadius: "4px",
          }}
          containerStyle={{
            marginBottom: error ? 0 : "16px",
          }}
        />

        {error && <Typography className={styles.errorText}>{error}</Typography>}

        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          disabled={!phone.trim()}
          onClick={handleLogin}
        >
          Login
        </Button>
      </Paper>
    </Box>
  );
}
