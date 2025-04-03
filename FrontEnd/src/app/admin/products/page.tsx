"use client";

import React, { useState } from "react";
import { Container, Typography } from "@mui/material";
import ProductsList from "./ProductsList";
import AddProductForm from "./AddProductForm";
import { Product } from "@/data/types";
import ImageUpload from "./ImageUpload"; // ایمپورت کامپوننت ImageUpload
import withAdminAccess from '@/hoc/withAdminAccess';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]); // لیست محصولات بدون داده‌های تستی
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleAddProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(
      products.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
    setEditingProduct(null);
  };

  return (
    <Container sx={{ marginTop: "100px" }}>
      <Typography color="white" variant="h4" gutterBottom>
        Products Management
      </Typography>
      {/* نمایش فرم افزودن/ویرایش محصول */}
      {editingProduct ? (
        <AddProductForm
          onAddProduct={handleUpdateProduct}
          initialProduct={editingProduct}
        />
      ) : (
        <AddProductForm onAddProduct={handleAddProduct} />
      )}
      {/* نمایش لیست محصولات */}
      <ProductsList
        products={products}
        onDeleteProduct={handleDeleteProduct}
        onEditProduct={handleEditProduct}
      />
      {/* نمایش کامپوننت ImageUpload به صورت جداگانه */}
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

export default withAdminAccess (ProductsPage);
