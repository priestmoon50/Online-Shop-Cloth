import React, { useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next'; // استفاده از useTranslation

interface ProductCategoriesProps {
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
}

const ProductCategories: React.FC<ProductCategoriesProps> = ({ setSelectedCategory }) => {
  const { t } = useTranslation(); // دسترسی به تابع ترجمه
  const [category, setCategory] = useState<string>('all'); // مقدار پیش‌فرض

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const selectedValue = event.target.value;
    setCategory(selectedValue); // ذخیره دسته‌بندی انتخاب‌شده
    setSelectedCategory(selectedValue); // انتقال دسته‌بندی انتخاب‌شده به کامپوننت والد
  };

  return (
    <FormControl fullWidth>
      <InputLabel>{t('category')}</InputLabel> {/* ترجمه برچسب دسته‌بندی */}
      <Select
        label={t('category')}
        value={category} // مقدار پیش‌فرض
        onChange={handleCategoryChange} // تغییرات در دسته‌بندی را مدیریت می‌کند
      >
        <MenuItem value="all">{t('all')}</MenuItem>
        <MenuItem value="pants">{t('pants')}</MenuItem>
        <MenuItem value="shoes">{t('shoes')}</MenuItem>
        <MenuItem value="dress">{t('dress')}</MenuItem>
        <MenuItem value="accessory">{t('accessory')}</MenuItem>
      </Select>
    </FormControl>
  );
};

export default ProductCategories;
