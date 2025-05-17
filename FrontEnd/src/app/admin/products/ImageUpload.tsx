"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Input,
  Snackbar,
  Alert,
  Typography,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Trans } from "react-i18next";

interface UploadResult {
  url: string;
  public_id: string;
}

const ImageUpload: React.FC = () => {
  const { t } = useTranslation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<UploadResult | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setUploaded(null);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await axios.post("/api/gallery", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { url, public_id } = response.data;
      setUploaded({ url, public_id });
      setSnackbarMessage(t("upload_success"));
      setOpenSnackbar(true);
      window.dispatchEvent(new Event("gallery-updated"));
    } catch (error) {
      setSnackbarMessage(t("upload_error"));
      setOpenSnackbar(true);
      console.error("❌ Upload error:", error);
    }
  };

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  return (
    <Box
      sx={{
        maxWidth: "900px",
        mx: "auto",
        width: "100%",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 4,
        mt: 5,
        px: 2,
      }}
    >
      {/* Left Side: Form */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: "#f9f9f9",
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: 3,
        }}
      >
        <Typography variant="h6" mb={2}>
          {t("upload_new_image")}
        </Typography>

        <Input
          type="file"
          onChange={handleFileChange}
          fullWidth
          disableUnderline
          sx={{
            backgroundColor: "#fff",
            borderRadius: "6px",
            border: "1px solid #ccc",
            padding: "8px",
            fontSize: "0.95rem",
            mb: 2,
          }}
        />

        {previewUrl && (
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Image
              src={previewUrl}
              alt="Preview"
              width={250}
              height={250}
              style={{ objectFit: "cover", borderRadius: "8px" }}
            />
          </Box>
        )}

        <Button
          onClick={handleUpload}
          variant="contained"
          color="primary"
          fullWidth
          disabled={!selectedFile}
          sx={{ mt: 3, py: 1.2, fontWeight: "bold" }}
        >
          {t("upload_button")}
        </Button>

        {uploaded && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t("final_url")}
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
              {uploaded.url}
            </Typography>

            <Typography variant="subtitle2" mt={2}>
              {t("public_id")}
            </Typography>
            <Typography variant="body2">{uploaded.public_id}</Typography>

            <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
              <Image
                src={uploaded.url}
                alt="Uploaded"
                width={250}
                height={250}
                style={{ objectFit: "cover", borderRadius: "8px" }}
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* Right Side: Instructions */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "block" },
          paddingTop: 1,
        }}
      >
        <Typography variant="h6" mb={2}>
          {t("instructions_title")}
        </Typography>
        <Typography variant="body1" sx={{ color: "#555", lineHeight: 1.8 }}>
          {t("instructions_text")}
        </Typography>

        <ul
          style={{
            paddingLeft: "18px",
            marginTop: "8px",
            color: "#555",
            lineHeight: "1.8",
          }}
        >
          <li>{t("instruction_1")}</li>
 <li>
   <strong>{t("upload_button")}</strong>
</li>

          <li>{t("instruction_3")}</li>
        </ul>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarMessage.includes(t("upload_success")) ? "success" : "error"}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ImageUpload;
