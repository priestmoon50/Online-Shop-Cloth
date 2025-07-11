'use client';

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import { Button, TextField, Box, Typography } from '@mui/material';
import { convertToEuro } from '@/utils/convertCurrency';

const CartManager: React.FC = () => {
  const { cart, addItem, removeItem, updateItem } = useCart();
  const { t } = useTranslation();

  const [newItem, setNewItem] = useState({
    id: '',
    name: '',
    price: 0,
    discountPrice: 0,
    quantity: 1,
    size: '',
    color: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleAddItem = async () => {
    if (!newItem.id || !newItem.name || newItem.price <= 0) {
      setError(t('error.requiredFields'));
      return;
    }

    try {
      const res = await fetch(`/api/products?id=${newItem.id}`);
      const product = await res.json();

      if (!product || !product.variants) {
        setError(t('error.productNotFound'));
        return;
      }

      const matchedVariant = product.variants.find(
        (v: any) =>
          v.size === newItem.size && v.color === newItem.color
      );

      if (!matchedVariant) {
        setError(t('error.variantNotAvailable'));
        return;
      }

      const existingItem = cart.items.find((i) => i.id === newItem.id);
      const existingQuantity =
        existingItem?.variants.find(
          (v) => v.size === newItem.size && v.color === newItem.color
        )?.quantity || 0;

      const totalRequested = existingQuantity + newItem.quantity;

      if (totalRequested > matchedVariant.stock) {
        setError(
          t('error.stockExceeded', {
            stock: matchedVariant.stock,
          })
        );
        return;
      }
      await addItem({
        id: newItem.id,
        name: newItem.name,
        price: newItem.price,
        discountPrice: newItem.discountPrice || undefined,
        image: '',
        variants: [
          {
            size: newItem.size,
            color: newItem.color,
            quantity: newItem.quantity,
            stock: matchedVariant.stock,
          },
        ],
      });


      setNewItem({
        id: '',
        name: '',
        price: 0,
        discountPrice: 0,
        quantity: 1,
        size: '',
        color: '',
      });
      setError(null);
    } catch (err) {
      console.error(err);
      setError(t('error.addingToCart'));
    }
  };


  return (
    <div>
      <Typography variant="h4">{t('cartManagerTitle')}</Typography>

      <Box display="flex" flexDirection="column" gap={2} maxWidth="400px" mb={4}>
        <TextField
          label={t('productId')}
          value={newItem.id}
          onChange={(e) => setNewItem({ ...newItem, id: e.target.value })}
        />
        <TextField
          label={t('productName')}
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <TextField
          label={t('price')}
          type="number"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
        />
        <TextField
          label={t('discountPrice')}
          type="number"
          value={newItem.discountPrice}
          onChange={(e) => setNewItem({ ...newItem, discountPrice: Number(e.target.value) })}
        />
        <TextField
          label={t('quantity')}
          type="number"
          value={newItem.quantity}
          onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
        />
        <TextField
          label={t('size')}
          value={newItem.size}
          onChange={(e) => setNewItem({ ...newItem, size: e.target.value })}
        />
        <TextField
          label={t('color')}
          value={newItem.color}
          onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
        />
        <Button variant="contained" color="primary" onClick={handleAddItem}>
          {t('addItem')}
        </Button>
      </Box>

      {error && <Typography color="error">{error}</Typography>}

      <Typography variant="h5">{t('cartItems')}</Typography>
      <ul>
        {cart.items.map((item) => (
          <li key={item.id}>
            <Typography fontWeight={600}>{item.name}</Typography>
            {item.variants.map((variant, index) => (
              <Box key={index} mb={2}>
                <Typography>
                  {typeof item.discountPrice === "number" &&
                    item.discountPrice > 0 &&
                    item.discountPrice < item.price
                    ? `€${convertToEuro(item.discountPrice)} (${t('discounted')})`
                    : `€${convertToEuro(item.price)}`}
                  {' '}x {variant.quantity} ({variant.size}, {variant.color})
                </Typography>
                <Box display="flex" gap={1} mt={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const maxStock = variant.stock ?? variant.quantity;
                      if (variant.quantity + 1 > maxStock) {
                        setError(t("error.stockExceededShort", { stock: maxStock }));
                        return;
                      }
                      setError(null);
                      updateItem(
                        item.id,
                        String(variant.size),
                        variant.color ? String(variant.color) : undefined,
                        variant.quantity + 1
                      );
                    }}
                  >
                    {t('increase')}
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      updateItem(item.id, String(variant.size), variant.color ? String(variant.color) : undefined, Math.max(1, variant.quantity - 1))

                    }
                  >
                    {t('decrease')}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => removeItem(item.id, String(variant.size), variant.color ? String(variant.color) : undefined)
                    }
                  >
                    {t('remove')}
                  </Button>
                </Box>
              </Box>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CartManager;
