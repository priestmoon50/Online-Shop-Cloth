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

type GalleryImage = {
  url: string;
  public_id: string;
};

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

  const [addedImages, setAddedImages] = useState<GalleryImage[]>([]);
const [deletedImagePublicIds, setDeletedImagePublicIds] = useState<string[]>([]);

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
      setAddedImages((initialProduct.images || []).map((url) => ({ url, public_id: "" })));
    }
  }, [initialProduct, reset]);

const handleAddImage = (image: { url: string; public_id: string }) => {
  setAddedImages([...addedImages, image]);
};


const onSubmit = async (data: Product) => {
  try {
    // حذف تصاویر حذف‌شده از Cloudinary
    await Promise.all(
      deletedImagePublicIds.map((public_id) =>
        axios.delete("/api/gallery", { params: { public_id } })
      )
    );

    // فقط URL تصاویر را ذخیره کن (اگر بک‌اند public_id نمی‌خواهد)
    const productData = {
      ...data,
      images: addedImages.map((img) => img.url),
    };

    const response = initialProduct
      ? await axios.put(`/api/products/${initialProduct.id}`, productData)
      : await axios.post("/api/products", productData);

    console.log("Product updated successfully:", response.data);
    onAddProduct(response.data);
    reset();
    setAddedImages([]);
    setDeletedImagePublicIds([]);
  } catch (error) {
    console.error("Error updating product:", error);
  }
};


  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      className={styles.formContainer}
    >
      {/* Product Name */}
<Grid container spacing={2}>
  <Grid item xs={12} md={6}>
    <Controller
      name="name"
      control={control}
      rules={{ required: "Product name is required" }}
      render={({ field }) => (
        <TextField
          {...field}
          label="Product Name"
          required
          fullWidth
        />
      )}
    />
  </Grid>

  <Grid item xs={12} md={6}>
    <Controller
      name="price"
      control={control}
      rules={{ required: "Price is required", min: 0 }}
      render={({ field }) => (
        <TextField
          {...field}
          label="Price"
          type="number"
          required
          fullWidth
        />
      )}
    />
  </Grid>
</Grid>

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
    <Grid item xs={6} sm={4} md={2} key={index}>
      <Box
        sx={{
          position: "relative",
          border: "1px solid #ddd",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
          <Image
        src={image.url}
        alt={`Selected Image ${index}`}
          width={100}
          height={100}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />

    <Button
  onClick={() => {
    const removedImage = addedImages[index];
    if (removedImage.public_id) {
      setDeletedImagePublicIds([...deletedImagePublicIds, removedImage.public_id]);
    }
    const updatedImages = addedImages.filter((_, i) => i !== index);
    setAddedImages(updatedImages);
  }}

          size="small"
          color="error"
          variant="contained"
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            minWidth: "auto",
            padding: "2px 6px",
            fontSize: "0.7rem",
            lineHeight: 1,
          }}
        >
          ✕
        </Button>
      </Box>
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
