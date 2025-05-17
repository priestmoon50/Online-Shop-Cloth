"use client";

import React, { useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";
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
import axios from "axios";
import styles from "./ProductsList.module.css";
import { useTranslation } from "react-i18next";


interface ProductsListProps {
  products: Product[];
  onDeleteProduct: (id: string | number) => void;
  onEditProduct: (product: Product) => void;
}

const ProductsList: React.FC<ProductsListProps> = ({
  products,
  onDeleteProduct,
  onEditProduct,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  });
const { t } = useTranslation();
  const openDeleteDialog = (id: string | number) => {
    setSelectedId(id);
    setOpenDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedId) return;

    try {
      await axios.delete(`/api/products/${selectedId}`);
      onDeleteProduct(selectedId);
      setSnackbar({
        open: true,
         message: t("delete_success"),
        type: "success",
      });
    } catch (error) {
      console.error("Delete error:", error);
      setSnackbar({
        open: true,
         message: t("delete_failed"),
        type: "error",
      });
    } finally {
      setOpenDialog(false);
    }
  };

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

const columns: GridColDef<Product>[] = [
  { field: "id", headerName: t("product_id"), width: 150 },
  { field: "name", headerName: t("name"), width: 140 },
  { field: "price", headerName: t("price"), width: 100 },
  { field: "stock", headerName: t("stock"), width: 100 },
  { field: "category", headerName: t("category"), width: 120 },
  {
    field: "actions",
    headerName: t("actions"),
    width: 200,
    sortable: false,
    renderCell: (params) => (
      <Box display="flex" gap={1}>
        <Button variant="outlined" color="primary" onClick={() => onEditProduct(params.row)}>
          {t("edit")}
        </Button>
        <Button variant="contained" color="error" onClick={() => openDeleteDialog(params.row.id)}>
          {t("delete")}
        </Button>
      </Box>
    ),
  },
];


  return (
    <div className={styles.tableContainer}>
      <DataGrid<Product>
        rows={products}
        columns={columns}
        getRowId={(row) => String(row.id)}
        pageSizeOptions={[5, 10, 20]}
        autoHeight
      />

      {/* Delete confirmation dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
<DialogTitle>{t("confirm_delete")}</DialogTitle>
<DialogContent>
  <DialogContentText>
    {t("delete_confirm_text")}
  </DialogContentText>
</DialogContent>
<DialogActions>
  <Button onClick={() => setOpenDialog(false)} color="primary">
    {t("cancel")}
  </Button>
  <Button onClick={confirmDelete} color="error">
    {t("yes_delete")}
  </Button>
</DialogActions>

      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.type} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ProductsList;
