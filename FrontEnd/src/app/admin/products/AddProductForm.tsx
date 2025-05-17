"use client";

import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Select,
  MenuItem,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { Product } from "@/data/types";
import axios from "axios";
import styles from "./AddProductForm.module.css";
import GalleryImageSelector from "./GalleryImageSelector";
import Image from "next/image";

interface AddProductFormProps {
  onAddProduct: (product: Product) => void;
  initialProduct?: Product;
}

const CATEGORY_OPTIONS = ["all", "pants", "shoes", "dress", "accessory"];

const AddProductForm: React.FC<AddProductFormProps> = ({
  initialProduct,
  onAddProduct,
}) => {
  const { control, handleSubmit, reset } = useForm<Product>({
    defaultValues: {
      name: "",
      price: undefined,
      description: "",
      colors: [],
      sizes: [],
      category: "",
      images: [],
    },
  });

  const [addedImages, setAddedImages] = useState<string[]>([]);
  const [customColor, setCustomColor] = useState<string>("");
  const [customSize, setCustomSize] = useState<string>("");
  const [availableColors, setAvailableColors] = useState<string[]>([
    "Red",
    "Blue",
    "Green",
    "Yellow",
  ]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([
    "S",
    "M",
    "L",
    "XL",
    "2X Large",
  ]);

  useEffect(() => {
    if (initialProduct) {
      reset(initialProduct);
      setAddedImages(initialProduct.images || []);
    }
  }, [initialProduct, reset]);

  const handleAddImage = (imageUrl: string) => {
    setAddedImages([...addedImages, imageUrl]);
  };

  const onSubmit = async (data: Product) => {
    try {
      const productData = { ...data, images: addedImages };
      const response = initialProduct
        ? await axios.put(`/api/products/${initialProduct.id}`, productData)
        : await axios.post("/api/products", productData);

      console.log("Product added successfully:", response.data);
      onAddProduct(response.data);
      reset();
      setAddedImages([]);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      className={styles.formContainer}
    >
      {/* Product Name */}
      <Controller
        name="name"
        control={control}
        rules={{ required: "Product name is required" }}
        render={({ field }) => (
          <TextField {...field} label="Product Name" required fullWidth />
        )}
      />

      {/* Price */}
      <Controller
        name="price"
        control={control}
        rules={{ required: "Price is required", min: 0 }}
        render={({ field }) => (
          <TextField {...field} label="Price" type="number" required fullWidth />
        )}
      />

      {/* Description */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Description" multiline rows={4} fullWidth />
        )}
      />

      {/* Colors + Custom Color */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
   <Controller
  name="colors"
  control={control}
  render={({ field }) => (
    <Select
      {...field}
      fullWidth
      multiple
      displayEmpty
      value={field.value || []}
      onChange={(event) => field.onChange(event.target.value as string[])}
      renderValue={(selected) =>
        selected.length === 0 ? "Select colors" : (selected as string[]).join(", ")
      }
      MenuProps={{ disableScrollLock: true }}
    >
      {availableColors.map((color) => (
        <MenuItem key={color} value={color}>
          <Box
            sx={{
              display: "inline-block",
              width: "20px",
              height: "20px",
              backgroundColor: color.toLowerCase(),
              marginRight: "8px",
              borderRadius: "50%",
              border: "1px solid #ddd",
            }}
          />
          {color}
        </MenuItem>
      ))}
    </Select>
  )}
/>

        </Grid>

        <Grid item xs={6} md={4}>
          <TextField
            label="Add Custom Color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={6} md={2}>
          <Button
            onClick={() => {
              if (customColor && !availableColors.includes(customColor)) {
                setAvailableColors([...availableColors, customColor]);
                setCustomColor("");
              }
            }}
            variant="contained"
            color="secondary"
            fullWidth
            sx={{ height: "100%" }}
          >
            Add
          </Button>
        </Grid>
      </Grid>

      {/* Sizes + Custom Size */}
      <Grid container spacing={2} sx={{ marginTop: "20px" }}>
        <Grid item xs={12} md={6}>
         <Controller
  name="sizes"
  control={control}
  render={({ field }) => (
    <Select
      {...field}
      fullWidth
      multiple
      displayEmpty
      value={field.value || []}
      onChange={(event) => field.onChange(event.target.value as string[])}
      renderValue={(selected) =>
        selected.length === 0 ? "Select sizes" : (selected as string[]).join(", ")
      }
      MenuProps={{ disableScrollLock: true }}
    >
      {availableSizes.map((size) => (
        <MenuItem key={size} value={size}>
          {size}
        </MenuItem>
      ))}
    </Select>
  )}
/>

        </Grid>

        <Grid item xs={6} md={4}>
          <TextField
            label="Add Custom Size"
            value={customSize}
            onChange={(e) => setCustomSize(e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={6} md={2}>
          <Button
            onClick={() => {
              if (customSize && !availableSizes.includes(customSize)) {
                setAvailableSizes([...availableSizes, customSize]);
                setCustomSize("");
              }
            }}
            variant="contained"
            color="secondary"
            fullWidth
            sx={{ height: "100%" }}
          >
            Add
          </Button>
        </Grid>
      </Grid>

      {/* Category */}
      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            fullWidth
            displayEmpty
            value={field.value || ""}
            onChange={(e) => field.onChange(e.target.value)}
            MenuProps={{ disableScrollLock: true }}
          >
            <MenuItem value="" disabled>
              Select Category
            </MenuItem>
            {CATEGORY_OPTIONS.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        )}
      />

      {/* Gallery Selector */}
      <GalleryImageSelector onAddImage={handleAddImage} />

      {/* Selected Images */}
      <Box sx={{ marginTop: "20px" }}>
        <Typography variant="h6">Selected Images for this Product:</Typography>
        <Grid container spacing={2}>
          {addedImages.map((image, index) => (
            <Grid item xs={2} key={index}>
              <Image
                src={image}
                alt={`Selected Image ${index}`}
                width={100}
                height={100}
                style={{ objectFit: "cover" }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Submit Button */}
      <Button
        className={styles.buttonClass}
        type="submit"
        variant="contained"
        color="primary"
      >
        {initialProduct ? "Update Product" : "Add Product"}
      </Button>
    </Box>
  );
};

export default AddProductForm;
