'use client';

import React, { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Select,
  MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Product } from '@/data/types';
import axios from 'axios';
import styles from './AddProductForm.module.css';
import GalleryImageSelector from './GalleryImageSelector';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface AddProductFormProps {
  onAddProduct: (product: Product, mode: 'add' | 'edit') => void;
  initialProduct?: Product;
}

type GalleryImage = {
  url: string;
  public_id: string;
};

const CATEGORY_OPTIONS = ['all', 'pants', 'shoes', 'dress', 'accessory'];

const AddProductForm: React.FC<AddProductFormProps> = ({
  initialProduct,
  onAddProduct,
}) => {
  const { control, handleSubmit, reset } = useForm<Product>({
    defaultValues: {
      name: '',
      price: undefined,
      description: '',
      colors: [],
      sizes: [],
      category: '',
      images: [],
      isNew: false,
    },
  });

  const [addedImages, setAddedImages] = useState<GalleryImage[]>([]);
  const [deletedImagePublicIds, setDeletedImagePublicIds] = useState<string[]>([]);
  const { t } = useTranslation();
  const [customColor, setCustomColor] = useState<string>('');
  const [availableColors, setAvailableColors] = useState<string[]>([
    'Red',
    'Blue',
    'Green',
    'Yellow',
  ]);

  const [sizeStockList, setSizeStockList] = useState<{ size: string; stock: number }[]>([]);
  const [newSize, setNewSize] = useState('');
  const [newStock, setNewStock] = useState<number>(0);

  useEffect(() => {
    if (initialProduct) {
      reset(initialProduct);
      setAddedImages((initialProduct.images || []).map((url) => ({ url, public_id: '' })));
      if (initialProduct.sizes) {
        setSizeStockList(initialProduct.sizes as any);
      }
    }
  }, [initialProduct, reset]);

  const handleAddImage = (image: { url: string; public_id: string }) => {
    setAddedImages([...addedImages, image]);
  };

  
  const onSubmit = async (data: Product) => {
    try {
      await Promise.all(
        deletedImagePublicIds.map((public_id) =>
          axios.delete('/api/gallery', { params: { public_id } })
        )
      );

      const productData = {
        ...data,
        colors: Array.isArray(data.colors) ? data.colors : [],
        sizes: sizeStockList,
        images: addedImages.map((img) => img.url),
      };

      const response = initialProduct
        ? await axios.put(`/api/products/${initialProduct.id}`, productData)
        : await axios.post('/api/products', productData);

      onAddProduct(response.data, initialProduct ? 'edit' : 'add');
      reset();
      setAddedImages([]);
      setDeletedImagePublicIds([]);
      setSizeStockList([]);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}>
      {/* Product Name + Price */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Product name is required' }}
            render={({ field }) => (
              <TextField {...field} label={t('product_name')} required fullWidth />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="price"
            control={control}
            rules={{ required: 'Price is required', min: 0 }}
            render={({ field }) => (
              <TextField {...field} label={t('price')} type="number" required fullWidth />
            )}
          />
        </Grid>
      </Grid>

<Grid item xs={12} md={6}>
  <Controller
    name="discountPrice"
    control={control}
    rules={{ min: 0 }}
    render={({ field }) => (
      <TextField
        {...field}
        label={t('discount_price') || 'Discount Price (optional)'}
        type="number"
        fullWidth
      />
    )}
  />
</Grid>


      {/* Description */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField {...field} label={t('description')} multiline rows={4} fullWidth />
        )}
      />

      {/* Colors */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Controller
            name="colors"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                fullWidth
                multiple
                displayEmpty
                value={field.value || []}
                onChange={(event) => field.onChange(event.target.value as string[])}
                renderValue={(selected) =>
                  selected.length === 0 ? t('select_colors') : (selected as string[]).join(', ')
                }
                MenuProps={{ disableScrollLock: true }}
              >
                {availableColors.map((color) => (
                  <MenuItem key={color} value={color}>
                    <Box
                      sx={{
                        display: 'inline-block',
                        width: '20px',
                        height: '20px',
                        backgroundColor: color.toLowerCase(),
                        marginRight: '8px',
                        borderRadius: '50%',
                        border: '1px solid #ddd',
                      }}
                    />
                    {color}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </Grid>

        <Grid item xs={6} md={4}>
          <TextField
            label={t('add_custom_color')}
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={6} md={2}>
          <Button
            onClick={() => {
              if (customColor && !availableColors.includes(customColor)) {
                setAvailableColors([...availableColors, customColor]);
                setCustomColor('');
              }
            }}
            variant="contained"
            color="secondary"
            fullWidth
            sx={{ height: '100%' }}
          >
            {t('add')}
          </Button>
        </Grid>
      </Grid>

      {/* Sizes + Stock */}
      <Grid container spacing={2} sx={{ marginTop: '20px' }}>
        <Grid item xs={4}>
          <TextField
            label={t('size')}
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label={t('stock')}
            type="number"
            value={newStock}
            onChange={(e) => setNewStock(Number(e.target.value))}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <Button
            onClick={() => {
              if (newSize && newStock >= 0) {
                setSizeStockList((prev) => [...prev, { size: newSize, stock: newStock }]);
                setNewSize('');
                setNewStock(0);
              }
            }}
            variant="contained"
            color="secondary"
            fullWidth
            sx={{ height: '100%' }}
          >
            {t('add')}
          </Button>
        </Grid>

        {sizeStockList.map((entry, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              border="1px solid #ccc"
              borderRadius="8px"
              px={2}
              py={1}
            >
              <Typography>{`${entry.size} - ${entry.stock} ${t('in_stock')}`}</Typography>
              <Button
                onClick={() => setSizeStockList(sizeStockList.filter((_, i) => i !== idx))}
                size="small"
                color="error"
                variant="outlined"
              >
                {t('remove')}
              </Button>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Category */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                fullWidth
                displayEmpty
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value)}
                MenuProps={{ disableScrollLock: true }}
              >
                <MenuItem value="" disabled>
                  {t('select_category')}
                </MenuItem>
                {CATEGORY_OPTIONS.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {t(`category_${cat}`)}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </Grid>
      </Grid>

      {/* Gallery Selector */}
      <GalleryImageSelector onAddImage={handleAddImage} />

      {/* Selected Images */}
      <Box sx={{ marginTop: '20px' }}>
        <Typography variant="h6">{t('selected_images_title')}</Typography>
        <Grid container spacing={2}>
          {addedImages.map((image, index) => (
            <Grid item xs={6} sm={4} md={2} key={index}>
              <Box
                sx={{
                  position: 'relative',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={image.url}
                  alt={`Selected Image ${index}`}
                  width={100}
                  height={100}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
                <Button
                  onClick={() => {
                    const removedImage = addedImages[index];
                    if (removedImage.public_id) {
                      setDeletedImagePublicIds((prev) => [...prev, removedImage.public_id]);
                    }
                    setAddedImages((prev) => prev.filter((_, i) => i !== index));
                  }}
                  size="small"
                  color="error"
                  variant="contained"
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    minWidth: 'auto',
                    padding: '2px 6px',
                    fontSize: '0.7rem',
                    lineHeight: 1,
                  }}
                >
                  ✕
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={2} sx={{ mt: 2 }}>
  <Grid item xs={12}>
    <Controller
      name="isNew"
      control={control}
      render={({ field }) => (
        <Box display="flex" alignItems="center">
<input
  type="checkbox"
  id="isNew"
  checked={!!field.value}
  onChange={(e) => field.onChange(e.target.checked)}
  style={{ marginRight: 8 }}
/>

          <label htmlFor="isNew">{t('mark_as_new')}</label>
        </Box>
      )}
    />
  </Grid>
</Grid>

      </Box>

      {/* Submit */}
      <Button className={styles.buttonClass} type="submit" variant="contained" color="primary">
        {initialProduct ? t('update_product') : t('add_product')}
      </Button>
    </Box>
  );
};

export default AddProductForm;
