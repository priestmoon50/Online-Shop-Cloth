import React, { useState } from 'react';
import { Slider, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next'; // اضافه کردن useTranslation

const ProductFilters: React.FC<{ setPriceRange: (range: number[]) => void }> = ({ setPriceRange }) => {
  const { t } = useTranslation(); // استفاده از useTranslation برای ترجمه‌ها
  const [value, setValue] = useState<number[]>([100, 1000]); // مقدار پیش‌فرض

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number[]);
    setPriceRange(newValue as number[]);
  };

  return (
    <>
      <Typography>{t('priceRange')}</Typography> {/* ترجمه متن "Price Range" */}
      <Slider
        value={value}
        onChange={handlePriceChange}
        valueLabelDisplay="auto"
        min={0}
        max={5000} // حداکثر قیمت به 5000 دلار افزایش یافت
      />
      <Typography>{`${value[0]}${t('currency')} - ${value[1]}${t('currency')}`}</Typography> {/* ترجمه و نمایش واحد پول */}
    </>
  );
};

export default ProductFilters;
