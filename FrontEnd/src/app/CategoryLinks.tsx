'use client';

import { Box, Grid, Typography } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const categories = [
  { id: 1, title: 'accessory', image: '/images/Accessory.webp', filter: 'accessory' },
  { id: 2, title: 'dress', image: '/images/piran.webp', filter: 'dress' },
  { id: 3, title: 'shoes', image: '/images/shos.webp', filter: 'shoes' },
  { id: 4, title: 'pants', image: '/images/shalvar.webp', filter: 'pants' },
];

export default function CategoryLinks() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleCategoryClick = (filter: string) => {
    router.push(`/products?category=${filter}`);
  };

  return (
<Box sx={{ mt: 4, overflowX: { xs: 'auto', md: 'unset' } }}>
  <Grid
    container
    spacing={2}
    sx={{
      flexWrap: { xs: 'nowrap', md: 'wrap' },
      width: '100%',
    }}
  >
    {categories.map((category) => (
      <Grid
        item
        key={category.id}
        sx={{
          flex: { xs: '0 0 auto', md: '1 1 0' },
          minWidth: { xs: 100, sm: 110, md: 120 },
          maxWidth: { md: 140 },
        }}
      >
        <Box
          onClick={() => handleCategoryClick(category.filter)}
          sx={{
            cursor: 'pointer',
            position: 'relative',
            width: '100%',
            aspectRatio: '1 / 1', // مربع
            overflow: 'hidden',
            borderRadius: '8px',
            boxShadow: '0px 1px 5px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        >
          <Image
            src={category.image}
            alt={t(category.title)}
            fill
            sizes="(max-width: 600px) 25vw, 140px"
            style={{ objectFit: 'cover' }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              bgcolor: 'rgba(0, 0, 0, 0.45)',
              color: 'white',
              textAlign: 'center',
              py: 0.5,
            }}
          >
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              {t(category.title)}
            </Typography>
          </Box>
        </Box>
      </Grid>
    ))}
  </Grid>
</Box>

  );
}
