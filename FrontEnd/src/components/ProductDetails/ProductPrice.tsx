// components/ProductDetails/ProductPrice.tsx
import { FC } from 'react';
import { Typography, Box, useTheme } from '@mui/material';
import { ProductPriceProps } from '@/data/types';
import { calculateDiscountedPrice } from '@/utils/calculateDiscount'; // ایمپورت تابع محاسبه تخفیف

const ProductPrice: FC<ProductPriceProps> = ({ price, discount }) => {
  const discountedPrice = calculateDiscountedPrice(price, discount); // استفاده از تابع محاسبه تخفیف
  const theme = useTheme(); // دسترسی به theme

  return (
    <Box>
      {discountedPrice ? (
        <>
          {/* قیمت اصلی با استایل خط خورده */}
          <Typography
            variant="h6"
            color="textSecondary"
            sx={{
              textDecoration: 'line-through',
              marginRight: theme.spacing(1), // استفاده از theme برای فاصله‌دهی
            }}
          >
            ${price.toLocaleString()}
          </Typography>
          
          {/* قیمت تخفیف‌خورده */}
          <Typography variant="h5" color="primary">
            ${discountedPrice.toLocaleString()}
          </Typography>

          {/* درصد تخفیف */}
          <Typography variant="body2" color="secondary" sx={{ marginTop: theme.spacing(1) }}>
            {discount}% Off
          </Typography>
        </>
      ) : (
        <Typography variant="h5" color="primary">
          ${price.toLocaleString()}
        </Typography>
      )}
    </Box>
  );
};

export default ProductPrice;
