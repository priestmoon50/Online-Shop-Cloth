'use client';
import React, { useState } from 'react';
import NavBar from '@/components/NavBar';
import { Box, Container } from '@mui/material';
import './globals.css';
import { QueryClient, QueryClientProvider, HydrationBoundary } from '@tanstack/react-query';
import Head from 'next/head';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import LanguageSelector from '@/components/LanguageSelector/LanguageSelector';
import { useTranslation } from 'react-i18next';
import '../../i18n';
import { FavoriteProvider } from '@/context/FavoriteContext';

const Layout: React.FC<{ children: React.ReactNode; dehydratedState?: unknown }> = ({ children, dehydratedState }) => {
  const [queryClient] = useState(() => new QueryClient());
  const { i18n } = useTranslation();

  return (
    <html lang={i18n.language === 'fa' ? 'fa' : 'en'}>
      <Head>
        <title>My Clothing Shop | High-Class Women&apos;s Fashion | ModaPersia</title>
        <meta name="description" content="Shop the latest high-class women&apos;s fashion at My Clothing Shop. Explore our exclusive collections now!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body>
        <QueryClientProvider client={queryClient}>
          <HydrationBoundary state={dehydratedState}>
            <AuthProvider>
              <CartProvider>
              <FavoriteProvider>
                <LanguageSelector /> {/* LanguageSelector فقط یک‌بار ظاهر می‌شود */}
                <NavBar />
                <Container sx={{ minWidth: '80%' }}>
                  <Box my={4}>{children}</Box>
                </Container>
                <Footer />
                </FavoriteProvider>
              </CartProvider>
            </AuthProvider>
          </HydrationBoundary>
        </QueryClientProvider>
      </body>
    </html>
  );
};

export default Layout;
