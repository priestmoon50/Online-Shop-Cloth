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
      sizeGuide: [],
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
      const productData = {
        ...data,
        images: addedImages,
        sizeGuide: data.sizeGuide,
      };

      const response = initialProduct
      ? await axios.put(`/api/products/${initialProduct.id}`, productData)
      : await axios.post("/api/products", productData);


      console.log("Product added successfully:", response.data);
      onAddProduct(response.data); // ارسال به لیست اصلی محصولات
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
      <Controller
        name="name"
        control={control}
        rules={{ required: "Product name is required" }}
        render={({ field }) => (
          <TextField {...field} label="Product Name" required />
        )}
      />

      <Controller
        name="price"
        control={control}
        rules={{ required: "Price is required", min: 0 }}
        render={({ field }) => (
          <TextField {...field} label="Price" type="number" required />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Description" multiline rows={4} />
        )}
      />

      {/* انتخاب رنگ‌ها */}
      <Controller
        name="colors"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            multiple
            value={field.value || []}
            onChange={(event) => field.onChange(event.target.value as string[])}
            renderValue={(selected) => (selected as string[]).join(", ")}
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

      <TextField
        label="Add Custom Color"
        value={customColor}
        onChange={(e) => setCustomColor(e.target.value)}
        sx={{ marginTop: "20px" }}
      />
      <Button
        onClick={() => {
          if (customColor && !availableColors.includes(customColor)) {
            setAvailableColors([...availableColors, customColor]);
            setCustomColor("");
          }
        }}
        variant="contained"
        color="secondary"
        sx={{ marginTop: "10px", marginBottom: "20px" }}
      >
        Add Color
      </Button>

      {/* انتخاب سایزها */}
      <Controller
        name="sizes"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            multiple
            value={field.value || []}
            onChange={(event) => field.onChange(event.target.value as string[])}
            renderValue={(selected) => (selected as string[]).join(", ")}
          >
            {availableSizes.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        )}
      />

      <TextField
        label="Add Custom Size"
        value={customSize}
        onChange={(e) => setCustomSize(e.target.value)}
        sx={{ marginTop: "20px" }}
      />
      <Button
        onClick={() => {
          if (customSize && !availableSizes.includes(customSize)) {
            setAvailableSizes([...availableSizes, customSize]);
            setCustomSize("");
          }
        }}
        variant="contained"
        color="secondary"
        sx={{ marginTop: "10px", marginBottom: "20px" }}
      >
        Add Size
      </Button>

      <Controller
        name="sizeGuide"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Size Guide"
            multiline
            rows={4}
            placeholder="Use a comma ( , ) to separate each line"
          />
        )}
      />

      <Controller
        name="category"
        control={control}
        render={({ field }) => <TextField {...field} label="Category" />}
      />

      <GalleryImageSelector onAddImage={handleAddImage} />

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
