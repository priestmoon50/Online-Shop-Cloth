'use client';

import React, { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle , Box} from '@mui/material';
import { Product } from '@/data/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import styles from './ProductsList.module.css';

interface ProductsListProps {
  onDeleteProduct: (id: number) => void;
  products: Product[];
  onEditProduct: (product: Product) => void; // این خط را اضافه کنید
}


const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get('http://localhost:3001/products');
  return data.map((product: Product) => ({
    ...product,
    id: product._id, // تبدیل _id به id
  }));
};

const deleteProduct = async (id: string) => {
  await axios.delete(`http://localhost:3001/products/${id}`);
};

const ProductsList: React.FC<ProductsListProps> = () => {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, error } = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const mutation = useMutation<void, Error, string>({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const [open, setOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setSelectedProductId(id);
    setOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedProductId) {
      mutation.mutate(selectedProductId);
    }
    setOpen(false);
  };

  const handleDeleteCancel = () => {
    setOpen(false);
  };

  // ستون‌ها برای DataGrid
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Product ID', width: 150 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'price', headerName: 'Price', width: 150 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'colors', headerName: 'Colors', width: 150 }, // اضافه کردن colors
    { field: 'sizes', headerName: 'Sizes', width: 150 },  // اضافه کردن sizes
    {
      field: 'actions',
      headerName: 'Actions',
      width: 250,
      renderCell: (params: { row: { id: string } }) => (
        <Box>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleDeleteClick(params.row.id)}
          >
            Delete
          </Button>
        </Box>
      ),
      
    },
  ];

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  return (
    <div className={styles.tableContainer}>
      <DataGrid
        rows={products}
        columns={columns}
        pageSizeOptions={[5, 10, 20]}
      />

      <Dialog open={open} onClose={handleDeleteCancel}>
        <DialogTitle>{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="secondary">
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProductsList;
