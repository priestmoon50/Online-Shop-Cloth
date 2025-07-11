"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
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
      onAddImage(selectedImage);
    }
  };

  const handleDeleteImage = async (image: GalleryImage) => {
    try {
      await axios.delete(`/api/gallery?public_id=${image.public_id}`);
      setImages((prev) => prev.filter((img) => img.public_id !== image.public_id));
    } catch (error) {
      console.error("❌ Error deleting image:", error);
    }
  };

  return (
    <Box
      sx={{
        mt: 3,
        p: 2,
        backgroundColor: "#f5f5f5",
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        {t("select_image_gallery")}
      </Typography>

      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          maxHeight: 300,
          flexWrap: "wrap",
          gap: 1,
          pb: 1,
        }}
      >
        {images.map((image, index) => (
          <Box
            key={image.public_id}
            sx={{
              minWidth: 100,
              flex: "0 0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transition: "transform 0.3s",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            <Image
              src={image.url}
              alt={`Image ${index}`}
              width={85}
              height={85}
              style={{
                cursor: "pointer",
                border:
                  selectedImage?.public_id === image.public_id
                    ? "2px solid blue"
                    : "none",
                borderRadius: 4,
                objectFit: "cover",
                marginBottom: 4,
              }}
              onClick={() => handleImageSelect(image)}
            />
            <Button
              variant="contained"
              color="error"
              size="small"
              sx={{ fontSize: 10, px: 1, py: 0.5, minWidth: 60 }}
              onClick={() => handleDeleteImage(image)}
            >
              {t("delete")}
            </Button>
          </Box>
        ))}
      </Box>

      {selectedImage && (
        <Box mt={3}>
          <Typography variant="h6">{t("selected_image")}</Typography>
          <Image
            src={selectedImage.url}
            alt="Selected"
            width={300}
            height={300}
            style={{ borderRadius: 8 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddImage}
            sx={{ ml: 2, mt: 2 }}
          >
            {t("add")}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default GalleryImageSelector;
