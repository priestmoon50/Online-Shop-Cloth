'use client';

import React, { useState } from 'react';
import {
  Box, Container, Grid, Typography, Link,
  TextField, Button, Alert
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
    <Box component="footer" sx={{ bgcolor: '#333', color: '#fff', py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>{t('aboutUs')}</Typography>
            <Typography variant="body2">{t('aboutUsDescription')}</Typography>
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
                label={t('yourEmail')}
                variant="outlined"
                size="small"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  mb: 2,
                  borderRadius: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  '& .MuiInputBase-input': {
                    color: '#fff',
                  },
                  '& .MuiInputLabel-root': {
                    color: '#ccc',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#fff',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#666',
                    },
                    '&:hover fieldset': {
                      borderColor: '#fff',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fff',
                    },
                  },
                  '& input::placeholder': {
                    color: '#aaa',
                    opacity: 1,
                  },
                }}
              />

              <TextField
                label={t('yourMessage')}
                variant="outlined"
                size="small"
                fullWidth
                multiline
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                sx={{
                  mb: 2,
                  borderRadius: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  '& .MuiInputBase-input': {
                    color: '#fff',
                  },
                  '& .MuiInputLabel-root': {
                    color: '#ccc',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#fff',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#666',
                    },
                    '&:hover fieldset': {
                      borderColor: '#fff',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fff',
                    },
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ mt: 1 }}
              >
                {loading ? t('sending') : t('send')}
              </Button>
            </Box>


            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            {submitted && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {t('messageSuccess')}
              </Alert>
            )}
          </Grid>
        </Grid>

        <Box mt={4} textAlign="center">
          <Typography variant="body2">{t('paymentMethods')}</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 1 }}>
            <FaPaypal color="#003087" size={32} />
            <FaCcVisa color="#1a1f71" size={32} />
            <FaCcMastercard color="#FF5F00" size={32} />
          </Box>
        </Box>

        <Box mt={4} textAlign="center">
          <Typography variant="body2">
            © 2024 Mopastyle.de | {t('allRightsReserved')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
