"use client";

import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  Badge,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LanguageIcon from "@mui/icons-material/Language"; // افزودن آیکون زبان
import AccountMenu from "./AccountMenu";
import { useCart } from "../context/CartContext";

import { useTranslation } from 'react-i18next';
import LanguageSelector from "@/components/LanguageSelector/LanguageSelector"; // اضافه کردن کامپوننت LanguageSelector

const NavBar: React.FC = () => {
  const { t } = useTranslation();

  const isMobile = useMediaQuery("(max-width: 600px)");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false); // مدیریت حالت باز بودن مودال زبان
  const { cart } = useCart();

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const toggleLanguageModal = () => {
    setLanguageModalOpen(!languageModalOpen); // تغییر حالت باز بودن مودال زبان
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "rgba(199, 199, 199, 0.336)",
          padding: "0 20px",
          marginTop: "15px",
          fontFamily: "Roboto, sans-serif",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
          zIndex: 1300,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={toggleDrawer(!drawerOpen)}
            >
              <MenuIcon sx={{ color: "#000" }} />
            </IconButton>
          )}

          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: isMobile ? "center" : "flex-start",
              alignItems: "center",
            }}
          >
            <Link href="/" passHref>
              <Box sx={{ cursor: "pointer" }}>
                <Image
                  src="/images/Logo.png"
                  alt="Logo"
                  width={200}
                  height={60}
                  priority={true}
                />
              </Box>
            </Link>
          </Box>

          {!isMobile && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: "20px",
                fontSize: "16px",
                color: "#000000",
              }}
            >
              <Link href="/products" passHref>
                <Button
                  sx={{
                    color: "#000000",
                    "&:hover": {
                      borderBottom: "2px solid #3f51b5",
                      transition: "border-bottom 0.3s ease",
                    },
                  }}
                >
                  {t('newArrivals')}
                </Button>
              </Link>
              <Link href="/products" passHref>
                <Button
                  sx={{
                    color: "#000000",
                    "&:hover": {
                      borderBottom: "2px solid #3f51b5",
                      transition: "border-bottom 0.3s ease",
                    },
                  }}
                >
                  {t('sale')}
                </Button>
              </Link>

              <Link href="/products" passHref>
                <Button
                  sx={{
                    color: "#000000",
                    "&:hover": {
                      borderBottom: "2px solid #3f51b5",
                      transition: "border-bottom 0.3s ease",
                    },
                  }}
                >
                  {t('shop')}
                </Button>
              </Link>
            </Box>
          )}

          <Box
            sx={{
              flexGrow: isMobile ? 0 : 1,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              
            }}
          >
            <AccountMenu />
            <IconButton
              color="inherit"
              sx={{ marginLeft: "40px", position: "relative" }}
            >
              <Link href="/cart" passHref>
                <Badge
                  badgeContent={cart.items.length}
                  color="error"
                  overlap="circular"
                >
                  <ShoppingCartIcon sx={{ fontSize: 32, color: "#000" }} />
                </Badge>
              </Link>
            </IconButton>
            {/* دکمه زبان */}
            <IconButton color="inherit" onClick={toggleLanguageModal} sx={{ marginLeft: "20px" }}>
              <LanguageIcon sx={{ fontSize: 32, color: "#000" }} />
            </IconButton>
          </Box>
        </Toolbar>

        {isMobile && (
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer(false)}
            PaperProps={{
              sx: { backgroundColor: "rgba(199, 199, 199, 0.336)", marginTop: "64px" },
            }}
          >
            <List>
              <ListItem component="a" href="/products">
                <ListItemText primary={t('newArrivals')} sx={{ color: "#000000" }} />
              </ListItem>
              <ListItem component="a" href="/products">
                <ListItemText primary={t('collections')} sx={{ color: "#000000" }} />
              </ListItem>
              <ListItem component="a" href="/products">
                <ListItemText primary={t('shop')} sx={{ color: "#000000" }} />
              </ListItem>
              <ListItem component="a" href="/cart">
                <ListItemText primary={t('viewCart')} sx={{ color: "#000000" }} />
              </ListItem>
            </List>
          </Drawer>
        )}
      </AppBar>

      {/* مودال انتخاب زبان */}
      <LanguageSelector isOpen={languageModalOpen} onClose={() => setLanguageModalOpen(false)} />
    </>
  );
};

export default NavBar;
