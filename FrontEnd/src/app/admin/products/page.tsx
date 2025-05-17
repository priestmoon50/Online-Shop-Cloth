"use client";

import React, { useEffect, useState } from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import Link from "next/link";
import axios from "axios";

import ProductsList from "./ProductsList";
import AddProductForm from "./AddProductForm";
import ImageUpload from "./ImageUpload";
import withAdminAccess from "@/hoc/withAdminAccess";
import { Product } from "@/data/types";

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // دریافت لیست محصولات از API
  useEffect(() => {
const fetchProducts = async () => {
  try {
    const res = await axios.get<Product[]>("/api/products");

    // تضمین اینکه colors و sizes همیشه آرایه باشند
    const safeProducts = (res.data || []).map((p) => ({
      ...p,
      colors: Array.isArray(p.colors) ? p.colors : [],
      sizes: Array.isArray(p.sizes) ? p.sizes : [],
    }));

    setProducts(safeProducts);
  } catch (err) {
    console.error("Error fetching products:", err);
  }
};


    fetchProducts();
  }, []);

  // افزودن یا ویرایش محصول
  const handleAddOrUpdateProduct = (product: Product, mode: "add" | "edit") => {
    if (mode === "edit") {
      setProducts((prev) =>
        prev.map((p) =>
          String(p.id) === String(product.id) ? product : p
        )
      );
      setEditingProduct(null);
    } else {
      setProducts((prev) => [...prev, product]);
    }
  };

  // حذف محصول
  const handleDeleteProduct = (id: string | number) => {
    setProducts((prev) =>
      prev.filter((product) => String(product.id) !== String(id))
    );
  };

  // ویرایش محصول
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  return (
    <Container maxWidth="lg" sx={{ marginTop: "50px" }}>
      {/* دکمه بازگشت به پنل ادمین */}
<Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
  <Link href="/admin" passHref>
    <Button
      variant="contained"
      sx={{
        backgroundColor: "#FFD700",
        color: "#000",
        fontWeight: 600,
        px: 3,
        borderRadius: "8px",
        boxShadow: "none",
        '&:hover': {
          backgroundColor: "#FFC107",
        },
      }}
    >
      ← Back
    </Button>
  </Link>
</Box>


      {/* فرم افزودن یا ویرایش محصول */}
      <AddProductForm
        onAddProduct={handleAddOrUpdateProduct}
        initialProduct={editingProduct || undefined}
      />

      {/* لیست محصولات */}
      <ProductsList
        products={products}
        onDeleteProduct={handleDeleteProduct}
        onEditProduct={handleEditProduct}
      />

      {/* آپلود تصویر */}
      <Typography
        color="white"
        variant="h5"
        gutterBottom
        sx={{ marginTop: "50px" }}
      >
        Upload Images
      </Typography>
      <ImageUpload />
    </Container>
  );
};

export default withAdminAccess(ProductsPage);
