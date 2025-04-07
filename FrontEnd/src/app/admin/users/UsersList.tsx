'use client';
import React, { useState, useEffect } from 'react';
import { DataGrid, GridPaginationModel } from '@mui/x-data-grid';
import styles from './UsersList.module.css';

interface User {
  id: string;
  name: string;
  phone: string;
  role: string;
}

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users'); // ✅ مسیر درست
        const data = await response.json();

        if (Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          console.error('Invalid response format:', data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
        loading={loading}
      />
    </div>
  );
};

export default UsersList;
