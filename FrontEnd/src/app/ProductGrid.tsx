"use client";

import {
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
} from "@mui/material";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Product } from "@/data/types";
import styles from "./ProductGrid.module.css";

const fetchProducts = async (): Promise<Product[]> => {
  try {
    const baseUrl =
      typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_URL;

    const { data } = await axios.get(`${baseUrl}/api/products`);

    if (!Array.isArray(data)) {
      console.error("❌ API did not return an array");
      return [];
    }

    return data.map((product: any) => ({
      ...product,
      id: product.id || product._id?.toString(),
    }));
  } catch (err) {
    console.error("❌ Failed to fetch products:", err);
    return [];
  }
};

export default function ProductGrid() {
  const theme = useTheme();

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const handleProductClick = (id: string | number) => {
    if (!id) return;
    window.location.href = `/product/${id}`;
  };

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

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, 1fr)",
          sm: "repeat(3, 1fr)",
          md: "repeat(4, 1fr)",
          lg: "repeat(5, 1fr)",
        },
        gap: 2,
        px: 2,
        pt: { xs: 2, md: 4 },
        pb: { xs: 0, md: 2 },
      }}
    >
      {products.map(({ id, name, images, category, price, status }) => (
        <Box
          key={id}
          className={styles.productCard}
          onClick={() => handleProductClick(id)}
        >
          <Box sx={{ position: "relative", height: 250, mb: 2 }}>
            <Image
              src={images?.[0] || "/placeholder.jpg"}
              alt={name}
              fill
              className={styles.productImage}
              sizes="100%"
            />
            {status && (
              <Box className={styles.productStatus}>
                {String(status).toUpperCase()}
              </Box>
            )}
          </Box>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minHeight: "3.2em",
            }}
          >
            {name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {category || "No Category"}
          </Typography>
          <Typography variant="h6" color="primary">
            €{price}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
