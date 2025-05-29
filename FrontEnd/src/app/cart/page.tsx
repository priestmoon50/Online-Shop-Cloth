'use client';

import React from 'react';
import Cart from '@/components/Cart';
import { Box, Container, Typography, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const CartPage: React.FC = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width:600px)');

  return (
    <Container>
      <Box
        sx={{
          pt: isMobile ? 3 : 5,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center', // 👈 مرکز چین
          gap: 1.5,
        }}
      >
        <ShoppingCartIcon
          sx={{
            fontSize: isMobile ? 26 : 32,
            color: '#e91e63',
          }}
        />
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          fontWeight={600}
          sx={{ color: '#000' }}
        >
          {t('shoppingCart')}
        </Typography>
      </Box>

      <Cart />
    </Container>
  );
};

export default CartPage;
