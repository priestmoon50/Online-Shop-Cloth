"use client";

import {
  Box,
  Typography,
  useTheme,
  Skeleton,
  Alert,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Product } from "@/data/types";
import styles from "./ProductGrid.module.css";

const fetchProducts = async (): Promise<Product[]> => {
  try {
    const { data } = await axios.get(`/api/products`);

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
function ProductCard({ product }: { product: Product }) {
  const { id, name, images, price, discountPrice, isNew, status } = product;

  const hasDiscount =
    typeof discountPrice === "number" &&
    !isNaN(discountPrice) &&
    discountPrice > 0 &&
    discountPrice < price;


  const discountAmount = hasDiscount
    ? ((price - discountPrice!) % 1 === 0
      ? (price - discountPrice!).toFixed(0)
      : (price - discountPrice!).toFixed(2))
    : null;


  return (
    <Link href={`/product/${id}`} passHref legacyBehavior>
      <a className={styles.productCard}>
        <Box sx={{ position: "relative", height: 250, mb: 2 }}>
          <Image
            src={images?.[0] || "/placeholder.jpg"}
            alt={name}
            fill
            className={styles.productImage}
            sizes="100%"
          />

          {hasDiscount && discountAmount && (
            <Box
              sx={{
                position: "absolute",
                top: 10,
                left: 10,
                backgroundColor: "error.main",
                color: "white",
                px: 1.5,
                py: 0.5,
                borderRadius: "5px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              Save €{discountAmount}
            </Box>
          )}

          {isNew && (
            <Box
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: "#1976d2",
                color: "white",
                px: 1.5,
                py: 0.5,
                borderRadius: "5px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              NEW
            </Box>
          )}
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

        {hasDiscount ? (
          <Box display="flex" justifyContent="center" alignItems="center" gap={1} mt={1}>
            <Typography
              variant="body2"
              sx={{
                textDecoration: "line-through",
                color: "text.secondary",
              }}
            >
              €{Number(price).toLocaleString()}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "error.main",
                fontWeight: "bold",
              }}
            >
              €{Number(discountPrice).toLocaleString()}
            </Typography>
          </Box>
        ) : (
          <Typography variant="h6" color="primary" mt={1}>
            €{Number(price).toLocaleString()}
          </Typography>
        )}
      </a>
    </Link>
  );
}


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

  if (isLoading) {
    return (
      <Box
        sx={{
          width: '100%',
          display: 'grid',
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
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={300}
            animation="wave"
            sx={{ borderRadius: 2 }}
          />
        ))}
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
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Box>
  );
}
