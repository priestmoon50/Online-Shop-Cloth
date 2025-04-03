"use client";

import React from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from "@mui/material";
import Link from "next/link";

interface SignInModalProps {
  open: boolean;
  onClose: () => void; // prop برای بستن مودال
}

const SignInModal: React.FC<SignInModalProps> = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="sign-in-dialog-title"
      aria-describedby="sign-in-dialog-description"
    >
      <DialogTitle id="sign-in-dialog-title">Sign In Required</DialogTitle>
      <DialogContent>
        <DialogContentText id="sign-in-dialog-description">
          To complete your purchase, please sign in.
        </DialogContentText>
        <Box sx={{ marginBottom: "20px" }}>
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            If you have an account, please{" "}
            <Link href="/auth/phone-verification" style={{ color: "blue", fontWeight: "bold" }}>
              log in
            </Link>.
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            If you don&apos;t have an account, please{" "}
            <Link href="/auth/phone-verification" style={{ color: "blue", fontWeight: "bold" }}>
              register
            </Link>.
          </Typography>
        </Box>
        <Button variant="outlined" onClick={onClose} sx={{ marginTop: "10px" }}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SignInModal;
