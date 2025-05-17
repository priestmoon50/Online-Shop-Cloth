'use client';

import React from 'react';
import Cart from '@/components/Cart';
import { Box, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const CartPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <Box sx={{ paddingTop: '20px' }}>
        <Typography variant="h3" gutterBottom>
          {t('shoppingCart')}
        </Typography>
        <Cart />
      </Box>
    </Container>
  );
};

export default CartPage;
