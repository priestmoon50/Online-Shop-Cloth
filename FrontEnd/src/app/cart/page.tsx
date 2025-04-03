'use client';

import React from 'react';
import Cart from '@/components/Cart';
import { Box, Container, Typography } from '@mui/material';

const CartPage: React.FC = () => {
  return (
    <Container>
      <Box sx={{ paddingTop: '20px' }}>
        <Typography variant="h3" gutterBottom>
          Shopping Cart
        </Typography>
        <Cart />
      </Box>
    </Container>
  );
};

export default CartPage;