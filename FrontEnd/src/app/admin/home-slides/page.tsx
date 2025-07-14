'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardActions,
  IconButton,
} from '@mui/material';
import axios from 'axios';
import Image from 'next/image';
import { HomeSlide } from '@/data/types';
import GalleryImageSelector from '../products/GalleryImageSelector';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

export default function ManageHomeSlidesPage() {
  const [slides, setSlides] = useState<HomeSlide[]>([]);
  const [showSelector, setShowSelector] = useState(false);

  const fetchSlides = async () => {
    const res = await axios.get('/api/home-slides');
    setSlides(res.data || []);
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleAddSlide = async (img: { url: string }) => {
    await axios.post('/api/home-slides', { imageUrl: img.url });
    setShowSelector(false);
    fetchSlides();
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    await axios.delete('/api/home-slides', { data: { id } });
    fetchSlides();
  };

  return (
    <Box sx={{ mt: 4, px: 2 }}>
      <Box display="flex" justifyContent="center" sx={{ mb: 4 }}>
        <Button variant="contained" color="warning" href="/admin">
          Back
        </Button>
      </Box>

      <Typography variant="h4" align="center" gutterBottom>
        مدیریت اسلایدر صفحه اصلی
      </Typography>

      <Box textAlign="center" mb={4}>
        <Button
          variant="contained"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={() => setShowSelector(true)}
        >
          افزودن تصویر جدید
        </Button>
      </Box>

      {showSelector && (
        <Box mb={4}>
          <GalleryImageSelector onAddImage={handleAddSlide} />
        </Box>
      )}

      <Grid container spacing={2} justifyContent="center">
        {slides.map((slide) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={slide._id}>
            <Card>
              <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                <Image
                  src={slide.imageUrl}
                  alt="slider"
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                />
              </Box>

              <CardActions>
                <IconButton color="error" onClick={() => handleDelete(slide._id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
