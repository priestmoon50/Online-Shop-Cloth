'use client';

import { Box, Grid, Typography } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';  // اضافه کردن i18n

const categories = [
  { id: 1, title: 'accessory', image: '/images/Accessory.webp', filter: 'pants' },
  { id: 2, title: 'dress', image: '/images/piran.webp', filter: 'dress' },
  { id: 3, title: 'shoes', image: '/images/shos.webp', filter: 'jackets' },
  { id: 4, title: 'pants', image: '/images/shalvar.webp', filter: 'footwear' },
];

export default function CategoryLinks() {
  const { t } = useTranslation();  // استفاده از hook ترجمه
  const router = useRouter();

  const handleCategoryClick = (filter: string) => {
    router.push(`/products?category=${filter}`);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={3} key={category.id}>
            <Box
              onClick={() => handleCategoryClick(category.filter)}
              sx={{
                cursor: 'pointer',
                position: 'relative',
                height: '300px',
                background: 'cover',
                overflow: 'hidden',
                borderRadius: '12px',
                boxShadow: '0px 2px 12px rgba(0, 221, 250, 0.637)',
                border: '1px solid rgba(11, 14, 209, 0.829)', 
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
                },
              }}
            >
              <Image
                src={category.image}
                alt={t(category.title)}  // استفاده از ترجمه برای عنوان‌ها
                fill
                style={{ objectFit: 'cover' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  width: '100%',
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  textAlign: 'center',
                  py: 1,
                }}
              >
                <Typography variant="h6">
                  {t(category.title)}  {/* استفاده از ترجمه */}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
