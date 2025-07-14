'use client';

import { Box, Grid, Typography } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import axios from 'axios';

const staticCategories = [
  { id: 0, title: 'all', filter: 'all' },
  { id: 1, title: 'accessory', filter: 'accessory' },
  { id: 2, title: 'dress', filter: 'dress' },
  { id: 3, title: 'shoes', filter: 'shoes' },
  { id: 4, title: 'pants', filter: 'pants' },
  { id: 5, title: 'sale', filter: 'sale' },
];

export default function CategoryLinks() {
  const { t } = useTranslation();
  const router = useRouter();
  const [imageMap, setImageMap] = useState<Record<string, string>>({});

  useEffect(() => {
    axios.get('/api/category-links').then((res) => {
      const map: Record<string, string> = {};
      res.data.forEach((item: { title: string; imageUrl: string }) => {
        map[item.title] = item.imageUrl;
      });
      setImageMap(map);
    });
  }, []);

  const handleCategoryClick = (filter: string) => {
    router.push(`/products?category=${filter}`);
  };

  return (
    <Box
      sx={{
        mt: { xs: 0, md: 4 },
        px: { xs: 1, sm: 2 },
        pt: 0,
        pb: { xs: 1, md: 2 },
        overflowX: { xs: 'auto', md: 'unset' },
        overflowY: 'hidden',
      }}
    >


      <Grid
        container
        spacing={2}
        sx={{
          flexWrap: { xs: 'nowrap', md: 'wrap' },
          width: 'max-content',
          minWidth: '100%',
          justifyContent: { xs: 'flex-start', md: 'center' },
        }}
      >


        {staticCategories.map((category) => (
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
                aspectRatio: '1 / 1',
                borderRadius: '50%',
                p: '2px',
                background:
                  'conic-gradient(red, orange, yellow, green, cyan, blue, violet, red)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Box
                sx={{
                  borderRadius: '50%',
                  overflow: 'hidden',
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                }}
              >
                <Image
                  src={imageMap[category.title] || '/placeholder.jpg'}
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
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
