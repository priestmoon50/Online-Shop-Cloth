'use client';

import React, { useState } from 'react';
import { Box, Container, Grid, Typography, Link, TextField, Button, Alert } from '@mui/material';
import { FaPaypal, FaCcVisa, FaCcMastercard } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() !== '') {
      setSubmitted(true);
      // اگر قرار است ایمیل را به سرور بفرستی، اینجا انجام بده
      // reset after delay
      setTimeout(() => {
        setSubmitted(false);
        setEmail('');
      }, 4000);
    }
  };

  return (
    <Box component="footer" sx={{ bgcolor: '#333', color: '#fff', py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>{t('aboutUs')}</Typography>
            <Typography variant="body2">
              {t('aboutUsDescription')}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>{t('stayConnected')}</Typography>
            <Typography variant="body2">
              <Link href="/support" color="inherit">{t('support')}</Link>
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>{t('newsletter')}</Typography>
            <Typography variant="body2" gutterBottom>
              {t('subscribeMessage')}
            </Typography>
            <Box component="form" onSubmit={handleSubscribe}>
              <TextField
                label={t('enterEmail')}
                variant="outlined"
                size="small"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ bgcolor: '#fff', borderRadius: '4px', mb: 1 }}
              />
              <Button type="submit" variant="contained" color="primary" fullWidth>
                {t('subscribe')}
              </Button>
            </Box>
            {submitted && (
              <Alert severity="success" sx={{ mt: 2 }}>
               We will contact you via email.
              </Alert>
            )}
          </Grid>
        </Grid>

        <Box mt={4} textAlign="center">
          <Typography variant="body2">
            {t('paymentMethods')}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 1 }}>
            <FaPaypal color="#003087" size={32} />
            <FaCcVisa color="#1a1f71" size={32} />
            <FaCcMastercard color="#FF5F00" size={32} />
          </Box>
        </Box>

        <Box mt={4} textAlign="center">
          <Typography variant="body2">
            © 2024 My Clothing Shop | {t('allRightsReserved')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
