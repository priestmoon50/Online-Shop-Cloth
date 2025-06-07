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
import { Product , CartItem } from "@/data/types";
import Link from "next/link";
import styles from "./ProductDetails.module.css";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoriteContext";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from 'react-i18next';


const ProductDetails: FC<{ product: Product }> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
const { t } = useTranslation();

  const { favorites, addFavorite, removeFavorite, isMounted } = useFavorites();
const productId = String(product.id || product._id);
const isLiked = favorites.items.some((item) => String(item.id) === productId);
const currentSizeStock =
  product.sizes?.find((s) => s.size === selectedSize)?.stock ?? 0;

const availableStock = currentSizeStock;




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
  ...(product.discountPrice ? { discountPrice: product.discountPrice } : {}),
  image: productImage,
  variants: [
    {
      size: selectedSize,
      color: selectedColor,
      quantity,
    },
  ],
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
    pt: { xs: '16px', md: '40px' }, 
    pb: { xs: '24px', md: '40px' }, 
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
      {t("back")}
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

<div className={styles.zoomableImageWrapper}>
  <ProductImages images={imagesArray} />
</div>

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

          <ProductPrice
  price={product.price}
  discountPrice={product.discountPrice}
  discount={product.discount}
/>


<div className={styles.mobileDivider}></div>

     
<div className={styles.mobileDivider}></div>

          <Typography variant="body2">
            <br />
            {t("category")}: {product.category || "N/A"}
          </Typography>
<Typography variant="body2" color="textSecondary">
  {!selectedSize
    ? t('pleaseSelectSize')  
    : availableStock > 0
    ? t('inStock', { count: availableStock })
    : t('outOfStock')}
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
              {isLiked ? t("addedToFavorites") : t("addToFavorites")}
            </Typography>
          </Box>

          {/* انتخاب سایز */}
          <Box className={styles.selectWrapper}>
            <Typography variant="body2" className={styles.selectLabel}>
             {t("selectSize")}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
{product.sizes
  ?.filter((s) => s.stock > 0)
  .map((s) => (
    <Button
      key={s.size}
      variant={selectedSize === s.size ? "contained" : "outlined"}
      onClick={() => setSelectedSize(s.size)}
      sx={{ minWidth: 40, px: 2 }}
    >
      {s.size}
    </Button>
))}

            </Box>
          </Box>

          {/* انتخاب رنگ */}
          <Box className={styles.selectWrapper}>
            <Typography variant="body2" className={styles.selectLabel}>
             {t("selectColor")}
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
             <b>{t("howMany")}</b>
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
  onChange={(e) => {
    const value = Number(e.target.value);
    if (value > availableStock) {
      setQuantity(availableStock);
    } else if (value >= 1) {
      setQuantity(value);
    }
  }}
  inputProps={{ min: 1, max: availableStock, className: styles.inputNoArrows }}


             
                size="small"
                style={{ width: "50px", textAlign: "center", margin: "0 8px" }}
              />
<IconButton
  onClick={() => setQuantity((prev) => Math.min(prev + 1, availableStock))}
  disabled={quantity >= availableStock}

 

                size="small"
                style={{ border: "1px solid #ccc", borderRadius: "50%", backgroundColor: "#f9f9f9", padding: "4px", margin: "0 4px" }}
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
  disabled={availableStock === 0}
>
  {availableStock === 0 ? t('outOfStock') : t('addToCart')}
</Button>

<Typography
  variant="body2"
  className={styles.productDescription}
  sx={{ mt: 3, lineHeight: 1.7 }}
>
  {product.description}
</Typography>

          </Box>
          
        </Grid>
      </Grid>


      <Modal open={openModal} onClose={handleCloseModal} aria-labelledby="success-modal-title" aria-describedby="success-modal-description">
        <Box sx={{ p: 4, backgroundColor: "white", borderRadius: 2, maxWidth: 400, margin: "auto", mt: "10%", textAlign: "center" }}>
          <Typography id="success-modal-title" variant="h6">
            {t("productAdded")}
          </Typography>
          <Typography id="success-modal-description" sx={{ mt: 2 }}>
            {t("productAddedMessage")}
          </Typography>
          <Button onClick={handleContinueShopping} sx={{ mt: 2, mr: 2 }} variant="contained" color="primary">
           Continue Shopping → {t("continueShopping")}
          </Button>
          <Button onClick={handleCheckout} sx={{ mt: 2 }} variant="contained" color="secondary">
            Checkout → {t("checkout")}
          </Button>

          
        </Box>
      </Modal>
    </Container>
  );
};

export default ProductDetails;
