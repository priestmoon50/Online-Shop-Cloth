import React, { useState } from "react";
import { Box, Button, Input, Snackbar, Alert } from "@mui/material";
import axios from "axios";
import Image from 'next/image'; // وارد کردن Image از Next.js

const ImageUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // برای ذخیره URL پیش‌نمایش
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);

      // تولید URL برای پیش‌نمایش
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await axios.post(
        "http://localhost:3001/gallery",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSnackbarMessage("Image uploaded successfully!");
      setOpenSnackbar(true);
      console.log("Image uploaded successfully:", response.data);
    } catch (error) {
      setSnackbarMessage("Error uploading image.");
      setOpenSnackbar(true);
      console.error("Error uploading image:", error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
      <Input type="file" onChange={handleFileChange} />
      
      {/* پیش‌نمایش تصویر قبل از ارسال */}
      {previewUrl && (
        <Box sx={{ marginTop: "20px" }}>
          <Image
            src={previewUrl}
            alt="Preview"
            width={300} // تعیین عرض تصویر
            height={300} // تعیین ارتفاع تصویر
            objectFit="cover" // نمایش مناسب تصویر
          />
        </Box>
      )}
      
      <Button 
        onClick={handleUpload} 
        variant="contained" 
        color="primary"
        sx={{ marginTop: "10px" }}
        disabled={!selectedFile} // غیرفعال کردن دکمه اگر فایلی انتخاب نشده باشد
      >
        Upload Image
      </Button>

      {/* Snackbar برای نمایش پیام‌ها */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarMessage.includes("successfully") ? "success" : "error"}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ImageUpload;
