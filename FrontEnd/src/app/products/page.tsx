"use client";

import React, { useState, useEffect } from "react";
import { Grid, Box, Typography } from "@mui/material";
import ProductCard from "@/components/ProductCard";
import ProductCategories from "@/components/ProductCategories";
import ProductFilters from "@/components/ProductFilters";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Product } from "@/data/types";
import { motion } from "framer-motion";

// ✅ اصلاح fetch: تبدیل _id به id
const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get("/api/products");

  if (Array.isArray(data)) {
    return data.map((product: any) => ({
      ...product,
      id: product.id || product._id?.toString(), // 👈 تبدیل MongoID به string
    }));
  } else {
    return [];
  }
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<number[]>([1, 200]);

  const {
    data: allProducts = [],
    isLoading,
    error,
  } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  useEffect(() => {
    if (allProducts.length > 0) {
      console.log("✅ Products loaded:", allProducts);
    }
  }, [allProducts]);

  if (isLoading) return <div>Loading...</div>;

  if (error) {
    console.error("Error fetching products:", error.message);
    return <div>Error fetching products. Please try again later.</div>;
  }

  // 🎯 فیلتر محصولات
  const filteredProducts = allProducts.filter((product) => {
    const isInSelectedCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory ||
      (selectedCategory === "others" &&
        product.category !== "men" &&
        product.category !== "women");

    return (
      isInSelectedCategory &&
      product.price >= priceRange[0] &&
      product.price <= priceRange[1]
    );
  });

  return (
    <Box sx={{ mt: "100px", px: 2 }}>
      <ProductCategories setSelectedCategory={setSelectedCategory} />
      <ProductFilters setPriceRange={setPriceRange} />

      {filteredProducts.length === 0 && (
        <Typography variant="h6" align="center">
          No products available for the selected filters.
        </Typography>
      )}

      <Grid container spacing={2}>
        {filteredProducts.map((product) => (
          <Grid item key={product.id} xs={6} sm={4} md={4} lg={3}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ProductCard {...product} />
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
