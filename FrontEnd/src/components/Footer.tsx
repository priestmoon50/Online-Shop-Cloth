'use client';

import React from 'react';
import { Box, Container, Grid, Typography, Link, TextField, Button } from '@mui/material';
import { FaFacebook, FaInstagram, FaTwitter, FaPaypal, FaCcVisa, FaCcMastercard } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';  // اضافه کردن i18n

const Footer: React.FC = () => {
  const { t } = useTranslation();  // استفاده از hook ترجمه

  return (
    <Box component="footer" sx={{ bgcolor: '#333', color: '#fff', py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>{t('aboutUs')}</Typography>  {/* ترجمه برای عنوان "About Us" */}
            <Typography variant="body2">
              {t('aboutUsDescription')}  {/* ترجمه برای توضیحات "About Us" */}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>{t('quickLinks')}</Typography>  {/* ترجمه برای عنوان "Quick Links" */}
            <Typography variant="body2">
              <Link href="/about" color="inherit">{t('aboutUs')}</Link><br />
              <Link href="/contact" color="inherit">{t('contact')}</Link><br />
              <Link href="/privacy" color="inherit">{t('privacyPolicy')}</Link>
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>{t('stayConnected')}</Typography>  {/* ترجمه برای عنوان "Stay Connected" */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link href="https://facebook.com" color="inherit"><FaFacebook /></Link>
              <Link href="https://instagram.com" color="inherit"><FaInstagram /></Link>
              <Link href="https://twitter.com" color="inherit"><FaTwitter /></Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>{t('newsletter')}</Typography>  {/* ترجمه برای عنوان "Newsletter" */}
            <Typography variant="body2" gutterBottom>
              {t('subscribeMessage')}  {/* ترجمه برای توضیحات "Newsletter" */}
            </Typography>
            <Box component="form">
              <TextField
                label={t('enterEmail')} 
                variant="outlined"
                size="small"
                fullWidth
                sx={{ bgcolor: '#fff', borderRadius: '4px', mb: 1 }}
              />
              <Button variant="contained" color="primary" fullWidth>
                {t('subscribe')}  {/* ترجمه برای دکمه "Subscribe" */}
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Box mt={4} textAlign="center">
          <Typography variant="body2">
            {t('paymentMethods')}  {/* ترجمه برای "Payment Methods" */}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 1 }}>
            <FaPaypal color="#003087" size={32} />  {/* PayPal icon */}
            <FaCcVisa color="#1a1f71" size={32} />  {/* Visa icon */}
            <FaCcMastercard color="#FF5F00" size={32} />  {/* Mastercard icon */}
          </Box>
        </Box>

        <Box mt={4} textAlign="center">
          <Typography variant="body2">
            © 2024 My Clothing Shop | {t('allRightsReserved')}  {/* ترجمه برای "All Rights Reserved" */}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
