'use client';

import React, { useState } from 'react';
import {
  Box, Container, Grid, Typography, Link,
  TextField, Button, Alert, Divider
} from '@mui/material';
import { FaPaypal, FaCcVisa, FaCcMastercard } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError(t('invalidEmail'));
      return;
    }

    if (!message || message.trim().length < 3) {
      setError(t('messageRequired'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/contact/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message, fromSupport: true }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setEmail('');
        setMessage('');
        setTimeout(() => setSubmitted(false), 4000);
      } else {
        setError(data.error || t('sendFailed'));
      }
    } catch (err) {
      setError(t('serverError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="footer" sx={{ bgcolor: '#1c1c1c', color: '#fff', py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>{t('aboutUs')}</Typography>
            <Typography variant="body2" color="#ccc">
              {t('aboutUsDescription')}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>{t('stayConnected')}</Typography>
            <Typography variant="body2">
              <Link href="/support" color="inherit" underline="hover">
                {t('support')}
              </Link>
            </Typography>
            <Box mt={2}>
              <Typography variant="h6" gutterBottom>RICHTLINIEN</Typography>
              {[
                { label: 'Impressum', path: '/impressum' },
                { label: 'AGB', path: '/agb' },
                { label: 'Datenschutz', path: '/datenschutz' },
                { label: 'Widerrufsbelehrung', path: '/widerrufsbelehrung' },
                { label: 'Zahlung', path: '/zahlung' },
                { label: 'Versand', path: '/versand' },
                { label: 'Cookies rechtlinie', path: '/rueckgabe-umtausch' },
                { label: 'Rückgabe & Umtausch', path: '/rueckgabe-umtausch2' },

              ].map(({ label, path }) => (
                <Typography key={label} variant="body2">
                  <Link href={path} color="inherit" underline="hover">
                    {label}
                  </Link>
                </Typography>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={12} md={6}>
            <Typography variant="h6" gutterBottom>{t('newsletter')}</Typography>
            <Typography variant="body2" gutterBottom>
              {t('subscribeMessage')}
            </Typography>
            <Box component="form" onSubmit={handleSubscribe}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label={t('yourEmail')}
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ backgroundColor: '#2c2c2c', input: { color: '#fff' }, label: { color: '#ccc' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={t('yourMessage')}
                    variant="outlined"
                    size="small"
                    fullWidth
                    multiline
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{ backgroundColor: '#2c2c2c', textarea: { color: '#fff' }, label: { color: '#ccc' } }}
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ mt: 2, fontWeight: 'bold', fontSize: '15px', py: 1.2 }}
              >
                {loading ? t('sending') : t('send')}
              </Button>
            </Box>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            )}
            {submitted && (
              <Alert severity="success" sx={{ mt: 2 }}>{t('messageSuccess')}</Alert>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: '#555' }} />

        <Box textAlign="center">
          <Divider sx={{ my: 4, borderColor: '#555' }} />

          <Grid container spacing={2} justifyContent="center" alignItems="center" textAlign="center">
            <Grid item xs={12} md={6} sx={{ mt: -3 }}>
              <Typography variant="body2" gutterBottom sx={{ mb: 3 }}>
                {t('paymentMethods')}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 1 }}>
                <FaPaypal color="#003087" size={40} />
                <FaCcVisa color="#1a1f71" size={40} />
                <FaCcMastercard color="#FF5F00" size={40} />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" gutterBottom>SSL Secure</Typography>
              <Box
                component="img"
                src="/images/SSL.png"
                alt="SSL Secure"
                sx={{ width: 80, height: 'auto', mx: 'auto' }}
              />
            </Grid>
          </Grid>

          <Typography variant="body2" color="#999" sx={{ mt: 4, textAlign: 'center' }}>
            © 2024 Mopastyle.de | {t('allRightsReserved')}
          </Typography>

        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
