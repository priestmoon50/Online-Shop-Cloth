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
import Slider from "react-slick";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Product } from "@/data/types";
import styles from "./ProductGrid.module.css";
import { convertToEuro } from "@/utils/convertCurrency";

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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const sliderSettings = {
    infinite: true,
    speed: 8000,
    slidesToShow: isMobile ? 2 : isTablet ? 4 : 6,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: "linear",
    arrows: false,
    pauseOnHover: false,
    rtl: true,

  };

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
    <Box sx={{ overflow: "hidden", px: 0, pt: { xs: 2, md: 4 }, pb: { xs: 0, md: 2 } }}>
      <Slider {...sliderSettings}>
        {products.map(({ id, name, images, category, price, status }) => (
          <Box
            key={id}
            className={styles.productCard}
            onClick={() => handleProductClick(id)}
            style={{ width: "auto", minWidth: 220 }}
          >
            <Box sx={{ position: "relative", height: 300, mb: 2 }}>
              <Image
                src={images?.[0] || "/placeholder.jpg"}
                alt={name}
                fill
                style={{ objectFit: "cover", borderRadius: "12px" }}
                className={styles.productImage}
                sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {status && (
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
                  {String(status).toUpperCase()}
                </Box>
              )}
            </Box>
<Typography
  variant="h6"
  gutterBottom
  sx={{
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minHeight: '3.2em', // ensures equal height
  }}
>
  {name}
</Typography>


            <Typography variant="body2" color="textSecondary">
              {category || "No Category"}
            </Typography>
            <Typography variant="h6" color="primary">
              €{convertToEuro(price)}
            </Typography>
          </Box>
        ))}
      </Slider>
    </Box>
  );
}
