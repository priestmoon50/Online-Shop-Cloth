"use client";

import React, { useEffect, useState } from "react";
import { Box, Grid, Typography, Button } from "@mui/material";
import Image from "next/image";
import axios from "axios";

interface GalleryImageSelectorProps {
  onAddImage: (imageUrl: string) => void;
}

const GalleryImageSelector: React.FC<GalleryImageSelectorProps> = ({
  onAddImage,
}) => {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get("/api/gallery");
        setImages(response.data || []);
      } catch (error) {
        console.error("Error fetching gallery images:", error);
      }
    };

    fetchImages();
  }, []);

  const handleImageSelect = (image: string) => {
    setSelectedImage(image);
  };

  const handleAddImage = () => {
    if (selectedImage) {
      onAddImage(selectedImage);
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    const filename = imageUrl.split("/").pop();
    try {
      await axios.delete(`/api/gallery?filename=${filename}`);
      setImages(images.filter((img) => img !== imageUrl));
      console.log(`Image ${filename} deleted successfully`);
    } catch (error) {
      console.error("Error deleting image:", error);
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
          <Grid item xs={6} sm={4} md={3} lg={1} key={index}>
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
                src={image}
                alt={`Gallery Image ${index}`}
                width={85}
                height={85}
                style={{
                  cursor: "pointer",
                  border: selectedImage === image ? "2px solid blue" : "none",
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
            src={selectedImage}
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
