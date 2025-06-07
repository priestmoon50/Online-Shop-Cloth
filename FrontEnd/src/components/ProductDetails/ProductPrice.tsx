// components/ProductDetails/ProductPrice.tsx
import { FC } from 'react';
import { Typography, Box, useTheme } from '@mui/material';
import { ProductPriceProps } from '@/data/types';
import { calculateDiscountedPrice } from '@/utils/calculateDiscount';

const ProductPrice: FC<ProductPriceProps> = ({ price, discount, discountPrice }) => {
  const theme = useTheme();

  const hasDiscountPrice = typeof discountPrice === 'number' && discountPrice < price;
  const hasCodeDiscount = typeof discount === 'number' && discount > 0;

  let finalPrice: number = price;
  let showOriginalPrice = false;
  let showPercent = false;

  if (hasDiscountPrice) {
    finalPrice = discountPrice!;
    showOriginalPrice = true;
  } else if (hasCodeDiscount) {
    const discounted = calculateDiscountedPrice(price, discount);
    if (typeof discounted === 'number') {
      finalPrice = discounted;
      showOriginalPrice = true;
      showPercent = true;
    }
  }

  return (
    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
      {showOriginalPrice && (
        <Typography
          variant="h6"
          color="error"
          sx={{ textDecoration: 'line-through', marginRight: theme.spacing(1) }}
        >
          €{Number(price).toLocaleString()}
        </Typography>
      )}

      <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
        €{Number(finalPrice).toLocaleString()}
      </Typography>

      {showPercent && discount && (
        <Typography
          variant="body2"
          color="secondary"
          sx={{ marginTop: theme.spacing(1) }}
        >
          {discount}% Off
        </Typography>
      )}
    </Box>
  );
};

export default ProductPrice;
