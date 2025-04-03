import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next'; // اضافه کردن i18n برای ترجمه
import { Button, TextField, Box, Typography } from '@mui/material';

const CartManager: React.FC = () => {
  const { cart, addItem, removeItem, updateItem } = useCart();
  const { t } = useTranslation(); // استفاده از ترجمه
  const [newItem, setNewItem] = useState({
    id: '',
    name: '',
    price: 0,
    quantity: 1,
    size: '',
    color: '',
  });
  const [error, setError] = useState<string | null>(null); // مدیریت خطا

  const handleAddItem = () => {
    if (!newItem.id || !newItem.name || newItem.price <= 0) {
      setError(t('error.requiredFields')); // نمایش پیام خطا
      return;
    }

    addItem(newItem);
    setNewItem({ id: '', name: '', price: 0, quantity: 1, size: '', color: '' });
    setError(null); // پاک کردن خطا پس از موفقیت
  };

  return (
    <div>
      <Typography variant="h4">{t('cartManagerTitle')}</Typography>
      <Box>
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

      {error && <Typography color="error">{error}</Typography>} {/* نمایش خطا */}

      <Typography variant="h5">{t('cartItems')}</Typography>
      <ul>
        {cart.items.map((item) => (
          <li key={item.id}>
            {item.name} - ${item.price} x {item.quantity} ({item.size}, {item.color})
            <Button onClick={() => removeItem(item.id)}>{t('remove')}</Button>
            <Button onClick={() => updateItem(item.id, item.quantity + 1)}>{t('increase')}</Button>
            <Button onClick={() => updateItem(item.id, item.quantity > 1 ? item.quantity - 1 : 1)}>
              {t('decrease')}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CartManager;
