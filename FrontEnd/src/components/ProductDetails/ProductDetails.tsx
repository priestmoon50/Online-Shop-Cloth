// components/ProductDetails/ProductDetails.tsx
'use client';

import { FC, useState } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  MenuItem,
  Select,
  TextField,
  Button,
  Modal,
  IconButton,
} from "@mui/material";
import ProductImages from "./ProductImages";
import ProductPrice from "./ProductPrice";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { Product } from "@/data/types";
import Link from "next/link";
import styles from "./ProductDetails.module.css"; // ایمپورت فایل CSS module

import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoriteContext";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";


const ProductDetails: FC<{ product: Product }> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [quantity, setQuantity] = useState<number>(1); // انتخاب تعداد پیش‌فرض

  const { addFavorite, removeFavorite, favorites } = useFavorites();
  const isLiked = favorites.items.some(
    (item) => item.id === product.id || item.id === product._id
  );

  const { addItem } = useCart();

  const imagesArray = product.images ? product.images : [product.image];


  // تابع برای تغییر وضعیت پسندیدن
  const toggleLike = () => {
    const productId = (product.id || product._id)?.toString();

    if (!productId) {
      console.error("Product ID is undefined");
      console.log("Favorites:", favorites.items);
      console.log("Is Liked:", isLiked);
      return;
    }

    const favoriteItem = {
      id: productId,
      name: product.name,
      price: product.price,
      imageUrl:
        product.images && product.images.length > 0
          ? product.images[0]
          : "/placeholder.jpg", // استفاده از اولین تصویر یا placeholder
      images: product.images || [], // ارسال کل آرایه تصاویر
      description: product.description || "", // ارسال توضیحات
      category: product.category || "N/A", // ارسال کتگوری
    };

    if (isLiked) {
      removeFavorite(productId);
      console.log("Removed from favorites:", favorites);
    } else {
      addFavorite(favoriteItem);
      console.log("Added to favorites:", favorites);
    }
  };

  const handleContinueShopping = () => {
    window.location.href = "/products"; // انتقال به صفحه محصولات
    handleCloseModal(); // بستن مودال
  };

  const handleCheckout = () => {
    window.location.href = "/cart"; // انتقال به صفحه سبد خرید
    handleCloseModal(); // بستن مودال
  };

  const handleAddToCart = () => {
    const productId = product.id || product._id;
    if (!productId || !selectedSize || !selectedColor) {
      alert("Please select a size and color");
      return;
    }
  
    const productImage = product.images && product.images.length > 0 
      ? product.images[0] 
      : "/placeholder.jpg"; // استفاده از اولین تصویر یا placeholder
  
    addItem({
      id: productId.toString(),
      name: product.name,
      price: product.price,
      quantity: quantity,
      size: selectedSize,
      color: selectedColor,
      image: productImage,  // اضافه کردن تصویر محصول
    });
  
    setOpenModal(true); // باز کردن مودال بعد از اضافه شدن به سبد خرید
  };
  

  // تابع برای بستن مودال
  const handleCloseModal = () => {
    setOpenModal(false); // بستن مودال
  };

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        margin="10px" // فاصله از همه طرف
      >
        <Link href="/products" passHref>
          <Button
            variant="outlined"
            className={styles.backButton}
            style={{ margin: "10px" }} // فاصله‌ی اضافی از خود دکمه
          >
            Back to Products
          </Button>
        </Link>
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <ProductImages images={imagesArray} />
        </Grid>

        <Grid item xs={12} md={6} className={styles.productInfo}>
          <Typography
            variant="h4"
            component="h1"
            className={styles.productTitle}
          >
            {product.name}
          </Typography>

          <ProductPrice price={product.price} discount={product.discount} />

          <Typography variant="body2" className={styles.productDescription}>
            {product.description}
          </Typography>

          <Typography variant="body2">
            <br />
            Category: {product.category || "N/A"}
          </Typography>

          {/* آیکون قلب برای افزودن به لیست پسندیده‌ها */}
          <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={toggleLike}
              aria-label={
                isLiked ? "Remove from Favorites" : "Add to Favorites"
              }
            >
              {isLiked ? (
                <FavoriteIcon color="error" />
              ) : (
                <FavoriteBorderIcon color="error" />
              )}
            </IconButton>
            <Typography variant="body2" sx={{ ml: 1 }}>
              {isLiked ? "Added to Favorites" : "Add to Favorites"}
            </Typography>
          </Box>

          {/* انتخاب سایز */}
          <Box className={styles.selectWrapper}>
            <Typography variant="body2" className={styles.selectLabel}>
              Select Size:
            </Typography>
            <Select
              value={selectedSize || ""}
              onChange={(e) => setSelectedSize(e.target.value as string)}
              fullWidth
              MenuProps={{
                disableScrollLock: true, // جلوگیری از قفل شدن اسکرول
              }}
            >
              {Array.isArray(product.sizes) &&
                product.sizes.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
            </Select>
          </Box>

          {/* انتخاب رنگ */}
          <Box className={styles.selectWrapper}>
            <Typography variant="body2" className={styles.selectLabel}>
              Select Color:
            </Typography>
            <Select
              value={selectedColor || ""}
              onChange={(e) => setSelectedColor(e.target.value as string)}
              fullWidth
              MenuProps={{
                disableScrollLock: true, // جلوگیری از قفل شدن اسکرول
              }}
            >
              {Array.isArray(product.colors) &&
                product.colors.map((color) => (
                  <MenuItem key={color} value={color}>
                    {color}
                  </MenuItem>
                ))}
            </Select>
          </Box>

          {/* انتخاب تعداد */}
          <Box
            className={styles.quantityInput}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            padding="8px"
            margin="20px 0" // فاصله از بخش‌های دیگر
            width="100%"
            maxWidth="200px" // حداکثر عرض برای رسپانسیو بودن
          >
            <Typography
              variant="body2"
              className={styles.selectLabel}
              style={{ fontSize: "0.9rem", marginRight: "15px" }}
            >
              <b> How many? </b>
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center">
              <IconButton
                onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                disabled={quantity <= 1}
                size="small"
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "50%",
                  backgroundColor: "#f9f9f9",
                  padding: "4px",
                  margin: "0 4px",
                  transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ff009ddd")
                } // تغییر به زرد
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f9f9f9")
                } // بازگشت به رنگ اولیه
              >
                <RemoveIcon fontSize="small" />
              </IconButton>

              <TextField
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                inputProps={{ min: 1, className: styles.inputNoArrows }}
                size="small"
                style={{ width: "50px", textAlign: "center", margin: "0 8px" }}
              />

              <IconButton
                onClick={() => setQuantity((prev) => prev + 1)}
                size="small"
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "50%",
                  backgroundColor: "#f9f9f9",
                  padding: "4px",
                  margin: "0 4px",
                  transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#a6ff00")
                } // تغییر به زرد
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f9f9f9")
                } // بازگشت به رنگ اولیه
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              className={styles.backButton}
              color="primary"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </Box>

        
        </Grid>
      </Grid>
      {/* مودال برای پیام موفقیت */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="success-modal-title"
        aria-describedby="success-modal-description"
      >
        <Box
          sx={{
            p: 4,
            backgroundColor: "white",
            borderRadius: 2,
            maxWidth: 400,
            margin: "auto",
            mt: "10%",
            textAlign: "center",
          }}
        >
          <Typography id="success-modal-title" variant="h6">
            Product Added to Cart
          </Typography>
          <Typography id="success-modal-description" sx={{ mt: 2 }}>
            The product has been successfully added to your cart.
          </Typography>

          {/* دکمه ادامه خرید */}
          <Button
            onClick={handleContinueShopping}
            sx={{ mt: 2, mr: 2 }}
            variant="contained"
            color="primary"
          >
            Continue Shopping
          </Button>

          {/* دکمه تسویه حساب */}
          <Button
            onClick={handleCheckout}
            sx={{ mt: 2 }}
            variant="contained"
            color="secondary"
          >
            Checkout
          </Button>
        </Box>
      </Modal>
      ;
    </Container>
  );
};

export default ProductDetails;
