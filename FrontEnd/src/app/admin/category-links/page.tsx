'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
} from '@mui/material';
import Image from 'next/image';
import axios from 'axios';
import { CategoryLink } from '@/data/types';
import GalleryImageSelector from '../products/GalleryImageSelector';
import { useTranslation } from 'react-i18next';
import { Edit } from '@mui/icons-material';

export default function EditCategoryLinksPage() {
  const [categories, setCategories] = useState<CategoryLink[]>([]);
  const [editingCategory, setEditingCategory] = useState<CategoryLink | null>(null);
  const { t } = useTranslation();

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/category-links');
      setCategories(res.data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSelectImage = async (image: { url: string; public_id: string }) => {
    if (!editingCategory) return;

    try {
      await axios.put('/api/category-links', {
        id: editingCategory._id,
        imageUrl: image.url,
      });

      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error('Error saving image:', err);
    }
  };

  const handleSeedCategories = async () => {
    const fixedCategories = ['all', 'accessory', 'dress', 'shoes', 'pants', 'sale'];

await Promise.all(
  fixedCategories.map(async (title) => {
    try {
      const res = await axios.get(`/api/category-links?title=${title}`);
      if (!res.data?.exists) {
        await axios.post('/api/category-links', { title, imageUrl: '' });
      }
    } catch (err) {
      console.error("Seed error:", err);
    }
  })
);

    fetchCategories();
  };

  return (
    <Box sx={{ mt: 4, px: { xs: 2, md: 6 } }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        {t('edit_category_links')}
      </Typography>

      <Box textAlign="center" mb={4}>
        <Button variant="contained" color="secondary" onClick={handleSeedCategories}>
          {t('seed_category_links') || 'مقداردهی اولیه دسته‌ها'}
        </Button>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        {categories.map((cat) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={cat._id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <CardMedia sx={{ width: '100%', height: 180, position: 'relative' }}>
                <Image
                  src={cat.imageUrl || '/placeholder.jpg'}
                  alt={cat.title}
                  fill
                  style={{ objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
                />
              </CardMedia>

              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {cat.title}
                </Typography>
              </CardContent>

              <CardActions sx={{ pb: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setEditingCategory(cat)}
                  endIcon={<Edit />}
                >
                  {t('change_image') || 'تغییر عکس'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {editingCategory && (
        <Box mt={6}>
          <Typography variant="h5" gutterBottom textAlign="center">
            {t('select_new_image')} - <strong>{editingCategory.title}</strong>
          </Typography>

          <GalleryImageSelector onAddImage={handleSelectImage} />
        </Box>
      )}
    </Box>
  );
}
