"use client";

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Box, TextField, Button, Typography, Container } from '@mui/material';
import { Lock } from '@mui/icons-material';
import Link from 'next/link';
import styles from '@/app/ForgotPasswordForm/ForgotPassword.module.css';
import { ForgotPasswordFormInputs } from '@/data/types';

const ForgotPassword: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormInputs>();

  const onSubmit: SubmitHandler<ForgotPasswordFormInputs> = data => {
    console.log(data);
    // ارسال درخواست HTTP برای بازیابی رمز عبور
  };

  return (
    <div className={styles.backgroundContainer}>
      <Container component="main" maxWidth="xs">
        <Box className={styles.container}>
          <Lock className={styles.icon} />
          <Typography component="h1" variant="h5" className={styles.title}>
            Forget Password
          </Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
            <TextField
              margin="normal"
              fullWidth
              label="Phone Number"
              autoComplete="tel"
              {...register('phone', { 
                required: 'Phone number is required', 
                pattern: { value: /^\+?[1-9]\d{1,14}$/, message: 'Please provide a valid phone number' }
              })}
              error={!!errors.phone}
              helperText={errors.phone ? errors.phone.message : ''}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={styles.submitButton}
            >
              Send Active Link
            </Button>
          </Box>

          {/* استفاده از Link برای لینک‌ها */}
          <Box className={styles.linkBox}>
            <Link href="/login" passHref>
              <Button variant="text" className={styles.link}>
                Signin
              </Button>
            </Link>
            <Link href="/register" passHref>
              <Button variant="text" className={styles.link}>
                Signup
              </Button>
            </Link>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default ForgotPassword;