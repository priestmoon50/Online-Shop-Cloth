'use client';

import { Container, Box, Typography, useMediaQuery, useTheme, CircularProgress, Alert } from "@mui/material";
import Image from "next/image";
import Slider from "react-slick";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Product } from "@/data/types";
import { useRouter } from "next/router"; // اضافه کردن این برای ناوبری
import styles from "./ProductGrid.module.css";

// تابع fetch محصولات
const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get("http://localhost:3001/products");

  if (Array.isArray(data)) {
    return data.map((product: Product) => ({
      ...product,
      id: product._id, // تبدیل _id به id
    }));
  } else {
    console.error("Error: API did not return an array");
    return [];
  }
};

export default function ProductGrid() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
 

  const { data: products = [], isLoading, error } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Alert severity="error">Error fetching products. Please try again later.</Alert>
      </Box>
    );
  }

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: isMobile ? 2 : isTablet ? 3 : 6,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
    rtl: true,
    centerMode: true,
    centerPadding: "0",
  };

  const handleProductClick = (id: string | number) => {
    window.location.href = `/product/${id}`;
 }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Slider {...sliderSettings}>
        {products.map((product) => (
          <Box
            key={product.id}
            className={styles.productCard}
            onClick={() => handleProductClick(product.id)}
            sx={{ cursor: 'pointer' }} // نمایش دست در هنگام هاور
          >
            <Box sx={{ position: "relative", height: "300px", mb: 2 }}>
              <Image
                src={product.images?.[0] || "/placeholder.jpg"}
                alt={product.name}
                fill
                style={{ objectFit: "cover" }}
                className={styles.productImage}
                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {typeof product.status === 'string' && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    backgroundColor: "rgba(255, 0, 0, 0.8)",
                    color: "white",
                    padding: "5px 10px",
                    borderRadius: "5px",
                  }}
                >
                  {product.status.toUpperCase()}
                </Box>
              )}
            </Box>
            <Typography variant="h6" component="h3" gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {product.category || 'No Category'}
            </Typography>
            <Typography variant="h6" color="primary">
              ${product.price}
            </Typography>
          </Box>
        ))}
      </Slider>
    </Container>
  );
}
