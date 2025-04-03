// src/admin/users/index.tsx

import React from 'react';
import { Container, Typography } from '@mui/material';
import UsersList from './UsersList'; // استفاده از کامپوننت UsersList

const UsersPage: React.FC = () => {
  return (
    <Container sx={{ marginTop: '100px' }}> {/* اضافه کردن فاصله 100px از بالا */}
      <Typography color='white' variant="h4" gutterBottom>
        Users Management
      </Typography>
      <UsersList />
    </Container>
  );
};

export default UsersPage;
