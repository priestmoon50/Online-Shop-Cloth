"use client";

import React, { useEffect, useState } from "react";
import { Box, Grid, Typography, Button } from "@mui/material";
import Image from "next/image";
import axios from "axios";
import { useTranslation } from "react-i18next";


interface GalleryImageSelectorProps {
  onAddImage: (image: { url: string; public_id: string }) => void;
}


interface GalleryImage {
  url: string;
  public_id: string;
}

const GalleryImageSelector: React.FC<GalleryImageSelectorProps> = ({
  onAddImage,
}) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
const { t } = useTranslation();
  const fetchImages = async () => {
    try {
      const response = await axios.get("/api/gallery");
      setImages(response.data || []);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
    }
  };

  useEffect(() => {
    fetchImages();

    // 👂 گوش دادن برای event رفرش
    const refreshHandler = () => fetchImages();
    window.addEventListener("gallery-updated", refreshHandler);

    return () => {
      window.removeEventListener("gallery-updated", refreshHandler);
    };
  }, []);

  const handleImageSelect = (image: GalleryImage) => {
    setSelectedImage(image);
  };

const handleAddImage = () => {
  if (selectedImage) {
    onAddImage(selectedImage); // ✅ حالا کل شیء را پاس می‌دیم
  }
};


  const handleDeleteImage = async (image: GalleryImage) => {
    try {
      await axios.delete(`/api/gallery?public_id=${image.public_id}`);
      setImages(images.filter((img) => img.public_id !== image.public_id));
      console.log(`✅ Image deleted from Cloudinary: ${image.public_id}`);
    } catch (error) {
      console.error("❌ Error deleting image:", error);
    }
  };

  return (
    <Box
      sx={{
        marginTop: "20px",
        padding: "10px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
      }}
    >
  <Typography variant="h6" gutterBottom>
  {t("select_image_gallery")}
</Typography>


      <Grid container spacing={1}>
        {images.map((image, index) => (
          <Grid item xs={6} sm={4} md={3} lg={1} key={image.public_id}>
            <Box
              sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <Image
                src={image.url}
                alt={`Gallery Image ${index}`}
                width={85}
                height={85}
                style={{
                  cursor: "pointer",
                  border:
                    selectedImage?.public_id === image.public_id
                      ? "2px solid blue"
                      : "none",
                  borderRadius: "4px",
                  marginBottom: "4px",
                  objectFit: "cover",
                }}
                onClick={() => handleImageSelect(image)}
              />
    <Button
  variant="contained"
  color="error"
  size="small"
  sx={{ fontSize: "10px", padding: "2px 4px" }}
  onClick={() => handleDeleteImage(image)}
>
  {t("delete")}
</Button>

            </Box>
          </Grid>
        ))}
      </Grid>

{selectedImage && (
  <Box mt={2}>
    <Typography variant="h6">{t("selected_image")}</Typography>
    <Image
      src={selectedImage.url}
      alt="Selected"
      width={300}
      height={300}
      style={{ borderRadius: "8px" }}
    />
    <Button
      variant="contained"
      color="primary"
      onClick={handleAddImage}
      sx={{ marginLeft: "20px", marginTop: "10px" }}
    >
      {t("add")}
    </Button>
  </Box>
)}

    </Box>
  );
};

export default GalleryImageSelector;
