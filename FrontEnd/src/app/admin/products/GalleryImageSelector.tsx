"use client";

import React, { useEffect, useState } from "react";
import { Box, Grid, Typography, Button } from "@mui/material";
import Image from "next/image";
import axios from "axios";

interface GalleryImageSelectorProps {
  onAddImage: (imageUrl: string) => void;
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

  useEffect(() => {
    const fetchImages = async () => {
      try {
        // 📌 فعلاً داده‌های فرضی چون API GET gallery هنوز نداره
        const mockImages = JSON.parse(localStorage.getItem("gallery") || "[]");
        setImages(mockImages);
      } catch (error) {
        console.error("Error fetching gallery images:", error);
      }
    };

    fetchImages();
  }, []);

  const handleImageSelect = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const handleAddImage = () => {
    if (selectedImage) {
      onAddImage(selectedImage.url); // فقط URL برای محصول لازمه
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
        Select an Image from Gallery
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
                Delete
              </Button>
            </Box>
          </Grid>
        ))}
      </Grid>

      {selectedImage && (
        <Box mt={2}>
          <Typography variant="h6">Selected Image:</Typography>
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
            Add
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default GalleryImageSelector;
