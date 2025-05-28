"use client";

import React, { useState, useEffect } from "react";
import { Grid, Box, Typography, TextField } from "@mui/material";
import ProductCard from "@/components/ProductCard";

import ProductFilters from "@/components/ProductFilters";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Product } from "@/data/types";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import CategoryLinks from "../CategoryLinks";
import { useSearchParams } from "next/navigation";

const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get("/api/products");

  if (Array.isArray(data)) {
    return data.map((product: any) => ({
      ...product,
      id: product.id || product._id?.toString(),
      price: Number(product.price),
    }));
  }

  return [];
};

export default function ProductsPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  
  const initialCategory = searchParams?.get("category") ?? "all";


  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [priceRange, setPriceRange] = useState<number[]>([1, 1000]);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: allProducts = [],
    isLoading,
    error,
  } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  useEffect(() => {

    const categoryFromUrl = searchParams?.get("category");

    if (categoryFromUrl && categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  const filteredProducts = allProducts.filter((product) => {
    const isInSelectedCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory ||
      (selectedCategory === "others" &&
        product.category !== "men" &&
        product.category !== "women");

    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());

    return (
      isInSelectedCategory &&
      product.price >= priceRange[0] &&
      product.price <= priceRange[1] &&
      matchesSearch
    );
  });

  if (isLoading) return <div>{t("loading")}</div>;

  if (error) {
    console.error("Error fetching products:", error.message);
    return <div>{t("errorFetchingProducts")}</div>;
  }

  return (
    <Box sx={{ mt: "100px", px: 2 }}>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t("searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      <CategoryLinks />
    
      <ProductFilters priceRange={priceRange} setPriceRange={setPriceRange} />

      {filteredProducts.length === 0 && (
        <Typography variant="h6" align="center">
          {t("noProductsForFilters")}
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
