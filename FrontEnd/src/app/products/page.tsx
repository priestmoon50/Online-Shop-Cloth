"use client";

import React, { useState, useEffect } from "react";
import {
  Grid,
  Box,
  Typography,
  TextField,
  InputAdornment,
  useMediaQuery,
} from "@mui/material";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Product } from "@/data/types";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import CategoryLinks from "../CategoryLinks";
import { useSearchParams } from "next/navigation";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get("/api/products");

  if (Array.isArray(data)) {
    return data.map((product: any) => ({
      ...product,
      id: product.id || product._id?.toString(),
      price: Number(product.price),
      discountPrice: Number(product.discountPrice) || 0,
    }));
  }

  return [];
};

export default function ProductsPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery("(max-width:600px)");

  const initialCategory = searchParams?.get("category") ?? "all";
  const isNewOnly = searchParams?.get("new") === "true";

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

  const filteredProducts = allProducts
    .filter((product) => {
      const isInSelectedCategory =
        selectedCategory === "all" ||
        product.category === selectedCategory ||
        (selectedCategory === "others" &&
          product.category !== "men" &&
          product.category !== "women") ||
        (selectedCategory === "sale" &&
          typeof product.discountPrice === "number" &&
          product.discountPrice > 0 &&
          product.discountPrice < product.price);

      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());

      return (
        isInSelectedCategory &&
        product.price >= priceRange[0] &&
        product.price <= priceRange[1] &&
        matchesSearch
      );
    })
    .filter((product) => !isNewOnly || product.isNew)
    .sort((a, b) => {
      const aTime = a.createdAt && typeof a.createdAt === "string"
        ? new Date(a.createdAt).getTime()
        : 0;

      const bTime = b.createdAt && typeof b.createdAt === "string"
        ? new Date(b.createdAt).getTime()
        : 0;

      return bTime - aTime;
    });


  if (isLoading) return <div>{t("loading")}</div>;
  if (error) {
    console.error("Error fetching products:", error.message);
    return <div>{t("errorFetchingProducts")}</div>;
  }

  return (
    <Box sx={{ mt: 0, px: 2 }}>
      <CategoryLinks />

      {isMobile && (
        <Box
          sx={{
            my: 3,
            position: "relative",
            maxWidth: "100%",
            mx: "auto",
          }}
        >
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#000" }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <CloseIcon
                    onClick={() => setSearchTerm("")}
                    sx={{
                      cursor: "pointer",
                      fontSize: 18,
                      color: "#555",
                      "&:hover": {
                        color: "#000",
                      },
                    }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                height: 38,
                backgroundColor: "#fff",
                transition: "all 0.3s ease",
                "& fieldset": {
                  borderColor: "#ccc",
                },
                "&:hover fieldset": {
                  borderColor: "#aaa",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#444",
                },
              },
            }}
          />
        </Box>
      )}

      <ProductFilters
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

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
