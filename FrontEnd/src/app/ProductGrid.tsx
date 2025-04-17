"use client";

import {
  Container,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
} from "@mui/material";
import Image from "next/image";
import Slider from "react-slick";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Product } from "@/data/types";
import styles from "./ProductGrid.module.css";

// ✅ گرفتن محصولات از API
const fetchProducts = async (): Promise<Product[]> => {
  const baseUrl =
    typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_URL;

  const { data } = await axios.get(`${baseUrl}/api/products`);

  if (Array.isArray(data)) {
    return data.map((product: any) => ({
      ...product,
      id: product.id || product._id?.toString(), 
    }));
  } else {
    console.error("❌ API did not return an array");
    return [];
  }
};


export default function ProductGrid() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

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
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: isMobile ? 1.5 : isTablet ? 3 : 5,
    slidesToScroll: 1,
    arrows: true,
  };

  const handleProductClick = (id: string | number) => {
    if (!id) {
      console.error("Invalid product ID:", id);
      return;
    }
    window.location.href = `/product/${id}`;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Slider {...sliderSettings}>
        {products.map((product) => (
          <Box
            key={product.id}
            className={styles.productCard}
            onClick={() => handleProductClick(product.id)}
            sx={{ mx: 1 }}
          >
            <Box sx={{ position: "relative", height: 300, mb: 2 }}>
              <Image
                src={product.images?.[0] || "/placeholder.jpg"}
                alt={product.name}
                fill
                style={{ objectFit: "cover", borderRadius: "12px" }}
                className={styles.productImage}
                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {product.status && (
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
                  {String(product.status).toUpperCase()}
                </Box>
              )}
            </Box>
            <Typography variant="h6" gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {product.category || "No Category"}
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
