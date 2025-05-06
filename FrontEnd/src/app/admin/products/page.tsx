"use client";

import React, { useEffect, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import ProductsList from "./ProductsList";
import AddProductForm from "./AddProductForm";
import { Product } from "@/data/types";
import ImageUpload from "./ImageUpload";
import withAdminAccess from "@/hoc/withAdminAccess";
import axios from "axios";
import Link from "next/link";
import { Button } from "@mui/material";

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // وقتی صفحه لود می‌شه → لیست محصولات رو از API بخون
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get<Product[]>("/api/products");
        setProducts(res.data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = (product: Product) => {
    if (editingProduct) {
      // حالت ویرایش: جایگزین کردن محصول در لیست
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? product : p))
      );
      setEditingProduct(null);
    } else {
      // حالت افزودن جدید
      setProducts((prev) => [...prev, product]);
    }
  };

  const handleDeleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
    setEditingProduct(null);
  };

  return (
    <Container sx={{ marginTop: "50px" }}>
      {/* دکمه بازگشت به /admin */}
      <Box sx={{ mb: 1 }}>
        <Link href="/admin" passHref>
          <Button variant="outlined" color="primary">
            ← Back to Admin Dashboard
          </Button>
        </Link>
      </Box>

      <Typography color="white"  gutterBottom>
        Products Management
      </Typography>

      {/* فرم افزودن یا ویرایش محصول */}
      {editingProduct ? (
        <AddProductForm
          onAddProduct={handleUpdateProduct}
          initialProduct={editingProduct}
        />
      ) : (
        <AddProductForm onAddProduct={handleAddProduct} />
      )}

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
