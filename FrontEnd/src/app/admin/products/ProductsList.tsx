"use client";

import React, { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { Product } from "@/data/types";
import styles from "./ProductsList.module.css";
import axios from "axios";

interface ProductsListProps {
  products: Product[];
  onDeleteProduct: (id: number) => void;
  onEditProduct: (product: Product) => void;
}

const ProductsList: React.FC<ProductsListProps> = ({
  products,
  onDeleteProduct,
  onEditProduct,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error";
  }>({
    open: false,
    message: "",
    type: "success",
  });

  // وقتی روی دکمه Delete کلیک میشه
  const handleDeleteClick = (id: number) => {
    setSelectedProductId(id);
    setOpen(true);
  };

  // تأیید حذف
  const handleDeleteConfirm = async () => {
    if (selectedProductId !== null) {
      try {
        await axios.delete(`/api/products/${selectedProductId}`);
        onDeleteProduct(selectedProductId);
        setSnackbar({
          open: true,
          message: "Product deleted successfully",
          type: "success",
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Failed to delete product",
          type: "error",
        });
        console.error("DELETE ERROR:", err);
      }
    }
    setOpen(false);
  };

  const handleDeleteCancel = () => setOpen(false);
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const columns: GridColDef[] = [
    { field: "id", headerName: "Product ID", width: 150 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "price", headerName: "Price", width: 150 },
    { field: "category", headerName: "Category", width: 150 },
    { field: "colors", headerName: "Colors", width: 150 },
    { field: "sizes", headerName: "Sizes", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 250,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => onEditProduct(params.row as Product)}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDeleteClick(params.row.id)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <div className={styles.tableContainer}>
      <DataGrid
        rows={products}
        columns={columns}
        pageSizeOptions={[5, 10, 20]}
        getRowId={(row) => row.id}
      />

      {/* دیالوگ تأیید حذف */}
      <Dialog open={open} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar برای وضعیت موفق یا خطا */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.type} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ProductsList;
