'use client';
import React, { useState } from 'react';
import { DataGrid, GridPaginationModel } from '@mui/x-data-grid';
import styles from './UsersList.module.css'; // اضافه کردن CSS Module

// تعریف اینترفیس User
interface User {
  id: string;
  name: string;
  phone: string;
  role: string;
}

const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+1234567890',
    role: 'Customer',
  },
  {
    id: '2',
    name: 'Jane Doe',
    phone: '+0987654321',
    role: 'Admin',
  },
  // سایر کاربران آزمایشی
];

const UsersList: React.FC = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
  });

  const columns = [
    { field: 'id', headerName: 'User ID', width: 150 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'phone', headerName: 'Phone', width: 200 },
    { field: 'role', headerName: 'Role', width: 150 },
  ];

  return (
    <div className={styles.tableContainer}>
      <DataGrid
        rows={users}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 20]}
      />
    </div>
  );
};

export default UsersList;
