import React, { useState } from "react";
import { Box, Typography, Button, List, ListItem, ListItemText, Skeleton, Modal } from "@mui/material";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext"; // اضافه‌شده
import Link from "next/link";
import { useTranslation } from "react-i18next";
import styles from "./Cart.module.css";
import { CartItem } from "@/data/types";
import { convertToEuro } from "@/utils/convertCurrency";

const Cart: React.FC = () => {
  const { cart, removeItem, updateItem } = useCart();
  const { user } = useAuth(); // بررسی وضعیت لاگین
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const handleUpdateItem = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      setError(t('error.quantityTooLow'));
      return;
    }
    setLoading(true);
    try {
      await updateItem(id, newQuantity);
      setLoading(false);
      setError(null);
    } catch {
      setError(t('error.updateFailed'));
      setLoading(false);
    }
  };

  const handleRemoveItem = async (id: string) => {
    setLoading(true);
    try {
      await removeItem(id);
      setLoading(false);
    } catch {
      setError(t('error.failedToRemoveItem'));
      setLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      setOpenModal(true);
    } else {
      window.location.href = "/checkout";
    }
  };

  const totalAmount = cart.items.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  return (
    <Box className={styles.cartContainer}>
      <Typography variant="h4" gutterBottom className={styles.cartTitle}>
        {t('shoppingCart')}
      </Typography>

      {loading ? (
        <Skeleton variant="rectangular" width="100%" height={200} />
      ) : cart.items.length === 0 ? (
        <Typography variant="h6" className={styles.emptyCartMessage}>
          {t('emptyCart')}
        </Typography>
      ) : (
        <>
          <List className={styles.cartList}>
            {cart.items.map((item: CartItem) => (
              <ListItem key={item.id} className={styles.cartListItem}>
                <Box>
                  <img 
                    src={item.image || "/placeholder.jpg"} 
                    alt={item.name} 
                    style={{ width: "250px", height: "250px", objectFit: "cover" }} 
                  />
                </Box>
                <ListItemText
                  primary={
                    <Typography variant="h6" className={styles.itemName}>
                      {item.name}
                    </Typography>
                  }
                />
                <Box className={styles.itemDetailsList}>
                  <Typography className={styles.productDetail}>
                    <span className={styles.productDetailLabel}>{t('price')}:</span>
                    <span className={styles.productDetailValue}>€{convertToEuro(item.price)}</span>
                  </Typography>
                  <Typography className={styles.productDetail}>
                    <span className={styles.productDetailLabel}>{t('quantity')}:</span>
                    <span className={styles.productDetailValue}>{item.quantity}</span>
                  </Typography>
                  <Typography className={styles.productDetail}>
                    <span className={styles.productDetailLabel}>{t('size')}:</span>
                    <span className={styles.productDetailValue}>{item.size || "N/A"}</span>
                  </Typography>
                  <Typography className={styles.productDetail}>
                    <span className={styles.productDetailLabel}>{t('color')}:</span>
                    <span className={styles.productDetailValue}>{item.color || "N/A"}</span>
                  </Typography>
                </Box>

                <Box className={styles.buttonContainer}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleUpdateItem(item.id, item.quantity + 1)}
                    className={styles.quantityButton}
                  >
                    +
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleUpdateItem(item.id, item.quantity > 1 ? item.quantity - 1 : 1)}
                    className={styles.quantityButton}
                  >
                    -
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemoveItem(item.id)}
                    className={styles.removeButton}
                  >
                    {t('remove')}
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>

          {error && <Typography color="error">{error}</Typography>}

          <Typography variant="h4" className={styles.totalPrice}>
            {t('total')}: €{convertToEuro(totalAmount)}
          </Typography>

          <Box className={styles.checkoutContainer}>
            <Button
              variant="contained"
              color="primary"
              className={styles.checkoutButton}
              onClick={handleProceedToCheckout}
            >
              {t('proceedToCheckout')}
            </Button>

            <Link href="/products" passHref>
              <Button variant="outlined" color="primary" className={styles.backToProductsButton}>
                {t('backToProducts')}
              </Button>
            </Link>
          </Box>

          {/* Modal برای ورود */}
          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <Box className={styles.modalBox}>
              <Typography variant="h6" mb={2}>
                {t('Please Login To Continue') || "لطفاً برای ادامه وارد حساب کاربری خود شوید"}
              </Typography>
              <Link href="/auth/login" passHref>
                <Button variant="contained" color="primary">
                  {t('go To Login') || "ورود"}
                </Button>
              </Link>
            </Box>
          </Modal>
        </>
      )}
    </Box>
  );
};

export default Cart;
