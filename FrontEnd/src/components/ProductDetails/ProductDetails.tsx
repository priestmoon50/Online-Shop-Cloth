'use client';

import { FC, useState } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
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
import styles from "./ProductDetails.module.css";

import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoriteContext";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

const ProductDetails: FC<{ product: Product }> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);

  const { favorites, addFavorite, removeFavorite, isMounted } = useFavorites();
const productId = String(product.id || product._id);
const isLiked = favorites.items.some((item) => String(item.id) === productId);


  const { addItem } = useCart();
  const imagesArray = product.images ? product.images : [product.image];

const toggleLike = () => {
  const productId = String(product.id || product._id);
  if (!productId) return;

  const alreadyLiked = favorites.items.some((item) => String(item.id) === productId);

  if (alreadyLiked) {
    removeFavorite(productId);
  } else {
    const favoriteItem = {
      id: productId,
      name: product.name,
      price: product.price,
      imageUrl: product.images?.[0] || "/placeholder.jpg",
      images: product.images || [],
      description: product.description || "",
      category: product.category || "N/A",
    };
    addFavorite(favoriteItem);
  }
};


  const handleContinueShopping = () => {
    window.location.href = "/products";
    handleCloseModal();
  };

  const handleCheckout = () => {
    window.location.href = "/cart";
    handleCloseModal();
  };

  const handleAddToCart = () => {
    const productId = product.id || product._id;
    if (!productId || !selectedSize || !selectedColor) {
      alert("Please select a size and color");
      return;
    }

    const productImage = product.images?.[0] || "/placeholder.jpg";

    addItem({
      id: productId.toString(),
      name: product.name,
      price: product.price,
      quantity,
      size: selectedSize,
      color: selectedColor,
      image: productImage,
    });

    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  return (
<Container
  maxWidth="lg"
  disableGutters
  sx={{
    px: { xs: '2vw', sm: '3vw', md: 0 },
    pt: { xs: '16px', md: '40px' }, // کنترل padding بالا
    pb: { xs: '24px', md: '40px' }, // کنترل padding پایین
  }}
  className={styles.container}
>




<Box
  sx={{
    position: {
      xs: "absolute",
      sm: "static",
    },
    top: { xs: 16 },
    left: { xs: 16 },
    zIndex: { xs: 10 },
    display: "flex",
    justifyContent: {
      xs: "flex-start",
      sm: "center",
    },
    alignItems: "center",
    mt: {
      xs: 0,
      sm: -3,
      md: -5,
    },
    mb: {
      xs: 4,
      sm: 6, // در دسکتاپ فاصله بیشتر پایین
    },
  }}
>
  <Link href="/products" passHref>
    <Button
      variant="contained"
      className={styles.backButton}
      sx={{
        backgroundColor: "#FFD700",
        color: "#000",
        '&:hover': {
          backgroundColor: "#FFC107",
        },
      }}
    >
      Back 
    </Button>
  </Link>
</Box>





      <Grid container spacing={4}>
<Grid
  item
  xs={12}
  md={6}
  sx={{ px: { xs: 0, md: 3 } }} // همینجا هم پدینگ رو صفر کن
>

  <ProductImages images={imagesArray} />
</Grid>



        <Grid
  item
  xs={12}
  md={6}
  className={styles.productInfo}
  sx={{ px: { xs: 0, md: 3 } }} // حذف padding افقی در موبایل
>

          <Typography variant="h4" component="h1" className={styles.productTitle}>
            {product.name}
          </Typography>

          <ProductPrice price={product.price} discount={product.discount} />
<div className={styles.mobileDivider}></div>

          <Typography variant="body2" className={styles.productDescription}>
            {product.description}
          </Typography>
<div className={styles.mobileDivider}></div>
          <Typography variant="body2">
            <br />
            Category: {product.category || "N/A"}
          </Typography>
<div className={styles.mobileDivider}></div>
          <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>

            
<IconButton onClick={toggleLike}>
  {isMounted && isLiked ? (
    <FavoriteIcon sx={{ color: '#e53935' }} />
  ) : (
    <FavoriteBorderIcon sx={{ color: '#9e9e9e' }} />
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
            <Box display="flex" flexWrap="wrap" gap={1}>
              {product.sizes?.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "contained" : "outlined"}
                  onClick={() => setSelectedSize(String(size))}

                  sx={{ minWidth: 40, px: 2 }}
                >
                  {size}
                </Button>
              ))}
            </Box>
          </Box>

          {/* انتخاب رنگ */}
          <Box className={styles.selectWrapper}>
            <Typography variant="body2" className={styles.selectLabel}>
              Select Color:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {product.colors?.map((color) => (
                <Button
                  key={color}
                  variant={selectedColor === color ? "contained" : "outlined"}
                  onClick={() => setSelectedColor(String(color))}

                  sx={{ minWidth: 40, px: 2 }}
                >
                  {color}
                </Button>
              ))}
            </Box>
          </Box>

          {/* انتخاب تعداد */}
          <Box className={styles.quantityInput} display="flex" alignItems="center" justifyContent="space-between" padding="8px" margin="20px 0" width="100%" maxWidth="200px">
            <Typography variant="body2" className={styles.selectLabel} style={{ fontSize: "0.9rem", marginRight: "15px" }}>
              <b> How many? </b>
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center">
              <IconButton
                onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                disabled={quantity <= 1}
                size="small"
                style={{ border: "1px solid #ccc", borderRadius: "50%", backgroundColor: "#f9f9f9", padding: "4px", margin: "0 4px" }}
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
                style={{ border: "1px solid #ccc", borderRadius: "50%", backgroundColor: "#f9f9f9", padding: "4px", margin: "0 4px" }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button variant="contained" className={styles.backButton} color="primary" onClick={handleAddToCart}>
              Add to Cart
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Modal open={openModal} onClose={handleCloseModal} aria-labelledby="success-modal-title" aria-describedby="success-modal-description">
        <Box sx={{ p: 4, backgroundColor: "white", borderRadius: 2, maxWidth: 400, margin: "auto", mt: "10%", textAlign: "center" }}>
          <Typography id="success-modal-title" variant="h6">
            Product Added to Cart
          </Typography>
          <Typography id="success-modal-description" sx={{ mt: 2 }}>
            The product has been successfully added to your cart.
          </Typography>
          <Button onClick={handleContinueShopping} sx={{ mt: 2, mr: 2 }} variant="contained" color="primary">
            Continue Shopping
          </Button>
          <Button onClick={handleCheckout} sx={{ mt: 2 }} variant="contained" color="secondary">
            Checkout
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default ProductDetails;
