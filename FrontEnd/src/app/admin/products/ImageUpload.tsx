"use client";

import React, { useState } from "react";
import { Box, Button, Input, Snackbar, Alert } from "@mui/material";
import Image from "next/image";
import axios from "axios";

interface UploadResult {
  url: string;
  public_id: string;
}

const ImageUpload: React.FC = () => {
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
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { url, public_id } = response.data;
      setUploaded({ url, public_id });
      setSnackbarMessage("Image uploaded successfully!");
      setOpenSnackbar(true);
      window.dispatchEvent(new Event("gallery-updated"));

      console.log("✅ Image uploaded:", { url, public_id });
    } catch (error) {
      setSnackbarMessage("Error uploading image.");
      setOpenSnackbar(true);
      console.error("❌ Upload error:", error);
    }
  };

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  return (
    <Box
      sx={{
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <Input type="file" onChange={handleFileChange} />

      {previewUrl && (
        <Box sx={{ marginTop: "20px" }}>
          <Image
            src={previewUrl}
            alt="Preview"
            width={300}
            height={300}
            style={{ objectFit: "cover" }}
          />
        </Box>
      )}

      <Button
        onClick={handleUpload}
        variant="contained"
        color="primary"
        sx={{ marginTop: "10px" }}
        disabled={!selectedFile}
      >
        Upload Image
      </Button>

      {uploaded && (
        <Box sx={{ marginTop: "20px" }}>
          <strong>Final Image URL:</strong>
          <div>{uploaded.url}</div>
          <strong>Public ID:</strong>
          <div>{uploaded.public_id}</div>
          <Image
            src={uploaded.url}
            alt="Uploaded"
            width={300}
            height={300}
            style={{ objectFit: "cover" }}
          />
        </Box>
      )}

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarMessage.includes("successfully") ? "success" : "error"}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ImageUpload;
