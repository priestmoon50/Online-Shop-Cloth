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
import { useSnackbar } from 'notistack';

const CATEGORY_OPTIONS = ['all', 'pants', 'shoes', 'dress', 'accessory'];

type GalleryImage = { url: string; public_id: string };
type VariantMap = { color: string; sizes: { size: string; stock: number }[] };

interface AddProductFormProps {
  onAddProduct: (product: Product, mode: 'add' | 'edit') => void;
  initialProduct?: Product;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ initialProduct, onAddProduct }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<Product>({
    defaultValues: {
      name: '',
      price: undefined,
      discountPrice: undefined,
      description: '',
      category: '',
      images: [],
      isNew: false,
      variants: [],
    },
  });

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [variantMap, setVariantMap] = useState<VariantMap[]>([]);
  const [newColor, setNewColor] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newStock, setNewStock] = useState<number>(0);

  useEffect(() => {
    if (initialProduct) {
      reset(initialProduct);
      setImages((initialProduct.images || []).map((url) => ({ url, public_id: '' })));

      const grouped: VariantMap[] = [];
      (initialProduct.variants || []).forEach(({ color, size, stock }) => {
        const found = grouped.find((v) => v.color === color);
        found
          ? found.sizes.push({ size, stock })
          : grouped.push({ color, sizes: [{ size, stock }] });
      });
      setVariantMap(grouped);
    }
  }, [initialProduct, reset]);

  const onAddImage = (img: GalleryImage) => setImages((prev) => [...prev, img]);

  const onRemoveImage = (index: number) => {
    const image = images[index];
    if (image.public_id) setDeletedImages((prev) => [...prev, image.public_id]);
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onAddColor = () => {
    if (newColor && !variantMap.find((v) => v.color === newColor)) {
      setVariantMap((prev) => [...prev, { color: newColor, sizes: [] }]);
      setNewColor('');
    }
  };

  const onAddSize = (color: string) => {
    if (!newSize || newStock < 0) return;
    setVariantMap((prev) =>
      prev.map((v) =>
        v.color === color
          ? { ...v, sizes: [...v.sizes, { size: newSize, stock: newStock }] }
          : v
      )
    );
    setNewSize('');
    setNewStock(0);
  };

  const onRemoveSize = (color: string, index: number) => {
    setVariantMap((prev) =>
      prev.map((v) =>
        v.color === color
          ? { ...v, sizes: v.sizes.filter((_, i) => i !== index) }
          : v
      )
    );
  };

  const onRemoveColor = (index: number) => {
    setVariantMap((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: Product) => {
    if (!data.category) {
      enqueueSnackbar(t('please_select_category'), { variant: 'error' });
      return;
    }

    if (!variantMap.length) {
      enqueueSnackbar(t('please_add_at_least_one_color'), { variant: 'error' });
      return;
    }

    for (const v of variantMap) {
      if (!v.sizes.length) {
        enqueueSnackbar(`${t('color')} ${v.color} ${t('must_have_sizes')}`, {
          variant: 'error',
        });
        return;
      }
    }

    try {
      await Promise.all(deletedImages.map((id) =>
        axios.delete('/api/gallery', { params: { public_id: id } })
      ));

      const productData: Product = {
        ...data,
        discountPrice: data.discountPrice ? +data.discountPrice : undefined,
        images: images.map((img) => img.url),
        variants: variantMap.flatMap(({ color, sizes }) =>
          sizes.map(({ size, stock }) => ({ color, size, stock }))
        ),
      };

      const res = initialProduct
        ? await axios.put(`/api/products/${initialProduct.id}`, productData)
        : await axios.post('/api/products', productData);

      onAddProduct(res.data, initialProduct ? 'edit' : 'add');
      enqueueSnackbar(t('product_added_successfully'), { variant: 'success' });

      reset();
      setImages([]);
      setDeletedImages([]);
      setVariantMap([]);
    } catch (err) {
      console.error(err);
      enqueueSnackbar(t('error_saving_product'), { variant: 'error' });
    }
  };

  type FieldName = 'name' | 'price' | 'discountPrice';

  const fields: {
    name: FieldName;
    label: string;
    type: string;
    rules: any;
  }[] = [

      { name: 'name', label: t('product_name'), type: 'text', rules: { required: t('required_field') } },
      { name: 'price', label: t('price'), type: 'number', rules: { required: t('required_field'), min: { value: 0, message: t('min_value_zero') } } },
      { name: 'discountPrice', label: t('discount_price'), type: 'number', rules: { min: { value: 0, message: t('min_value_zero') } } },
    ];

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}>
      <Grid container spacing={2}>
        {fields.map(({ name, label, type, rules }) => (
          <Grid item xs={12} md={6} key={name}>
            <Controller
              name={name}
              control={control}
              rules={rules}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={label}
                  type={type}
                  fullWidth
                  error={!!errors[name]}
                  helperText={(errors[name] as any)?.message}
                />
              )}
            />
          </Grid>
        ))}
      </Grid>


      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField {...field} label={t('description')} multiline rows={4} fullWidth />
        )}
      />

      {/* Colors & Sizes */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={8}>
          <TextField value={newColor} onChange={(e) => setNewColor(e.target.value)} label={t('color')} fullWidth />
        </Grid>
        <Grid item xs={4}>
          <Button onClick={onAddColor} variant="contained" color="secondary" fullWidth>
            {t('add_color')}
          </Button>
        </Grid>
      </Grid>

      {variantMap.map((v, idx) => (
        <Box key={idx} mt={3} p={2} border="1px solid #ccc" borderRadius={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {v.color} {" "}
              <Typography component="span" variant="caption" color="text.secondary">
                (تصویر شماره {idx + 1})
              </Typography>
            </Typography>

            <Button size="small" color="error" variant="outlined" onClick={() => onRemoveColor(idx)}>
              {t('remove')}
            </Button>
          </Box>

          <Grid container spacing={2} mt={1}>
            <Grid item xs={4}>
              <TextField
                label={t('size')}
                value={selectedColor === v.color ? newSize : ''}
                onChange={(e) => {
                  setSelectedColor(v.color);
                  setNewSize(e.target.value);
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label={t('stock')}
                type="number"
                value={selectedColor === v.color ? newStock : ''}
                onChange={(e) => {
                  setSelectedColor(v.color);
                  setNewStock(Number(e.target.value));
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <Button fullWidth variant="contained" onClick={() => onAddSize(v.color)}>
                {t('add_size')}
              </Button>
            </Grid>
          </Grid>

          <Grid container spacing={1} mt={1}>
            {v.sizes.map((s, i) => (
              <Grid item xs={12} md={6} key={i}>
                <Box display="flex" justifyContent="space-between" alignItems="center" border="1px solid #ccc" borderRadius={2} px={2} py={1}>
                  <Typography>{`${s.size} - ${s.stock} ${t('in_stock')}`}</Typography>
                  <Button size="small" variant="outlined" color="error" onClick={() => onRemoveSize(v.color, i)}>
                    {t('remove')}
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Controller
            name="category"
            control={control}
            rules={{ required: t('please_select_category') }}
            render={({ field }) => (
              <>
                <Select {...field} displayEmpty fullWidth error={!!errors.category}>
                  <MenuItem value="" disabled>{t('select_category')}</MenuItem>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <MenuItem key={cat} value={cat}>{t(`category_${cat}`)}</MenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <Typography variant="caption" color="error">
                    {errors.category.message}
                  </Typography>
                )}
              </>
            )}
          />
        </Grid>
      </Grid>

      <GalleryImageSelector onAddImage={onAddImage} />

      <Box mt={2}>
        <Typography variant="h6">{t('selected_images_title')}</Typography>
        <Grid container spacing={2}>
          {images.map((img, i) => (
            <Grid item xs={6} sm={4} md={2} key={i}>
              <Box position="relative" border="1px solid #ddd" borderRadius="8px" overflow="hidden">
                <Image src={img.url} alt={`img-${i}`} width={100} height={100} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                <Button onClick={() => onRemoveImage(i)} size="small" variant="contained" color="error"
                  sx={{ position: 'absolute', top: 4, right: 4, fontSize: '0.7rem', padding: '2px 6px', minWidth: 'auto' }}>
                  ✕
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Controller
        name="isNew"
        control={control}
        render={({ field }) => (
          <Box display="flex" alignItems="center" mt={2}>
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

      <Button className={styles.buttonClass} type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
        {initialProduct ? t('update_product') : t('add_product')}
      </Button>
    </Box>
  );
};

export default AddProductForm;
