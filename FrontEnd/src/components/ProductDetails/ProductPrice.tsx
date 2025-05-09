// components/ProductDetails/ProductPrice.tsx
import { FC } from 'react';
import { Typography, Box, useTheme } from '@mui/material';
import { ProductPriceProps } from '@/data/types';
import { calculateDiscountedPrice } from '@/utils/calculateDiscount'; // ایمپورت تابع محاسبه تخفیف
import { convertToEuro } from "@/utils/convertCurrency";

const ProductPrice: FC<ProductPriceProps> = ({ price, discount }) => {
  const discountedPrice = calculateDiscountedPrice(price, discount); // استفاده از تابع محاسبه تخفیف
  const theme = useTheme(); // دسترسی به theme

  return (
    <Box>
    {discountedPrice ? (
      <>
        <Typography
          variant="h6"
          color="textSecondary"
          sx={{
            textDecoration: 'line-through',
            marginRight: theme.spacing(1),
          }}
        >
          €{Number(convertToEuro(price)).toLocaleString()}
        </Typography>
  
        <Typography variant="h5" color="primary">
          €{Number(convertToEuro(discountedPrice)).toLocaleString()}
        </Typography>
  
        <Typography variant="body2" color="secondary" sx={{ marginTop: theme.spacing(1) }}>
          {discount}% Off
        </Typography>
      </>
    ) : (
      <Typography variant="h5" color="primary">
        €{Number(convertToEuro(price)).toLocaleString()}
      </Typography>
    )}
  </Box>
  );
};

export default ProductPrice;
