'use client';

import React, { useEffect, useState } from 'react';
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
import theme from '../theme';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';

const Layout: React.FC<{ children: React.ReactNode; dehydratedState?: unknown }> = ({ children, dehydratedState }) => {
  const [queryClient] = useState(() => new QueryClient());
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('selectedLanguage') || 'en';
    setLanguage(storedLang);
  }, []);

  const bodyClass = language === 'fa' ? 'font-fa' : 'font-latin';


  return (
    <html lang={language} dir="ltr">


      <Head>
        <title>MopaStyle | High-Class Women's Fashion</title>
        <meta
          name="description"
          content="Discover the exclusive high-class women's fashion collection at MopaStyle. Shop now for elegant dresses, t-shirts, and more."
        />
        <meta name="color-scheme" content="only light" />

        <meta
          name="keywords"
          content="women's fashion, Mopa, mopastyle, AHADI, clothing, high-class fashion, online shopping, dresses, ModaPersia"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />

        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/images/Logo.png" type="image/png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "MopaStyle",
              "url": "https://www.mopastyle.de",
              "logo": "https://www.mopastyle.de/images/Logo.png",
            }),
          }}
        />
      </Head>

      <body className={bodyClass}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
            <QueryClientProvider client={queryClient}>
              <HydrationBoundary state={dehydratedState}>
                <AuthProvider>

                  <CartProvider>
                    <FavoriteProvider>
                      <LanguageSelector />
                      <NavBar />
                      <Container maxWidth={false} disableGutters sx={{ py: { xs: 2, md: 4 } }}>


                        <Box my={4}>{children}</Box>
                      </Container>
                      <Footer />
                    </FavoriteProvider>
                  </CartProvider>
                </AuthProvider>
              </HydrationBoundary>
            </QueryClientProvider>
          </SnackbarProvider>
        </ThemeProvider>

      </body>
    </html>
  );
};

export default Layout;
