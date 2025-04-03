import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Grid, Typography, Button } from '@mui/material';
import Image from 'next/image'; // ایمپورت کامپوننت Image

interface GalleryImageSelectorProps {
  onAddImage: (imageUrl: string) => void; // Function to add the selected image to the product
}

const GalleryImageSelector: React.FC<GalleryImageSelectorProps> = ({ onAddImage }) => {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch images from the backend
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('http://localhost:3001/gallery');
        setImages(response.data); // Store the list of image URLs
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  const handleImageSelect = (image: string) => {
    setSelectedImage(image); // Store the selected image
  };

  const handleAddImage = () => {
    if (selectedImage) {
      onAddImage(selectedImage); // Add the selected image to the product
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    const filename = imageUrl.split('/').pop(); // Extract the filename from the URL
    try {
      await axios.delete(`http://localhost:3001/gallery/${filename}`);
      setImages(images.filter(img => img !== imageUrl)); // Remove the image from the local list
      console.log(`Image ${filename} deleted successfully`);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  return (
    <Box sx={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <Typography variant="h6" gutterBottom>
        Select an Image from Gallery
      </Typography>

      <Grid container spacing={1}> {/* Reduced spacing between images */}
        {images.map((image, index) => (
          <Grid item xs={6} sm={4} md={3} lg={1} key={index}>
            <Box 
              sx={{ 
                position: 'relative', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.05)' } 
              }}
            >
              {/* استفاده از کامپوننت Image به جای img */}
              <Image
                src={image}
                alt={`Gallery Image ${index}`}
                width={85} // عرض دقیق تصویر
                height={85} // ارتفاع دقیق تصویر
                style={{
                  cursor: 'pointer',
                  border: selectedImage === image ? '2px solid blue' : 'none',
                  borderRadius: '4px',
                  marginBottom: '4px', // Small margin between the image and button
                  objectFit: 'cover',
                }}
                onClick={() => handleImageSelect(image)} 
              />
              <Button
                variant="contained"
                color="error"
                size="small"
                sx={{ fontSize: '10px', padding: '2px 4px' }} // Smaller delete button
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
          {/* استفاده از Image برای تصویر انتخاب شده */}
          <Image 
            src={selectedImage}
            alt="Selected"
            width={300}
            height={300}
            style={{ borderRadius: '8px' }}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAddImage}
            sx={{ marginLeft: '20px', marginTop: '10px' }}
          >
            Add
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default GalleryImageSelector;
