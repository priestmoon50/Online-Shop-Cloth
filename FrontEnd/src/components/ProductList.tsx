import React from "react";
import { Grid, Box, CircularProgress, Alert } from "@mui/material";
import ProductCard from "./ProductCard";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Product } from "@/data/types";

// ✅ گرفتن محصولات از API داخلی Next.js
const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get("/api/products");

  if (Array.isArray(data)) {
    return data;
  } else {
    console.error("API did not return an array.");
    return [];
  }
};

const ProductList: React.FC = () => {
  const { data: allProducts = [], isLoading, error } = useQuery<Product[], Error>({
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
        <Alert severity="error">خطا در دریافت محصولات</Alert>
      </Box>
    );
  }

  return (
    <Grid container spacing={4}>
      {allProducts.length > 0 ? (
        allProducts.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <ProductCard
              id={product.id}
              _id={product._id}
              image={product.images?.[0] || "/placeholder.jpg"}
              name={product.name}
              price={product.price}
              discount={product.discount}
              sizes={product.sizes}
              description={product.description}
              category={product.category}
              colors={product.colors}
            />
          </Grid>
        ))
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" width="100%">
          <Alert severity="info">محصولی برای نمایش وجود ندارد</Alert>
        </Box>
      )}
    </Grid>
  );
};

export default ProductList;
