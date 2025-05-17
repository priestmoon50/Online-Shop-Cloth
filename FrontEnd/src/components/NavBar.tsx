"use client";
import { Divider } from "@mui/material";
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  Badge,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LanguageIcon from "@mui/icons-material/Language";
import AccountMenu from "./AccountMenu";
import { useCart } from "../context/CartContext";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/LanguageSelector/LanguageSelector";

const NAVBAR_HEIGHT = 56;

const NavBar: React.FC = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const { cart } = useCart();

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const toggleLanguageModal = () => {
    setLanguageModalOpen(!languageModalOpen);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#fff",
          px: 2,
          fontFamily: "Roboto, sans-serif",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
     <Toolbar
  sx={{
    minHeight: NAVBAR_HEIGHT,
    display: "flex",
    justifyContent: "space-between",
  }}
>
  {/* لوگو / منو (سمت چپ) */}
  <Box
    sx={{
      flex: 1,
      display: "flex",
      alignItems: "center",
    }}
  >
    {isMobile && (
      <IconButton
        edge="start"
        onClick={() => setDrawerOpen(!drawerOpen)}
        sx={{ ml: "-26px" }}
      >
        <MenuIcon sx={{ color: "#000" }} />
      </IconButton>
    )}

<Link href="/" passHref>
  <Box sx={{ cursor: "pointer", ml: isMobile ? 2 : 0 }}>
    <Image
      src="/images/Logo.png"
      alt="Logo"
      width={120}
      height={40}
      priority
    />
  </Box>
</Link>

  </Box>

  {/* لینک‌های وسط (فقط دسکتاپ) */}
  {!isMobile && (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        gap: 4,
      }}
    >
      {[
        { key: "shop", href: "/products" },
        { key: "newArrivals", href: "/products" },
        { key: "sale", href: "/products" },
      ].map(({ key, href }) => (
        <Link key={key} href={href} passHref>
          <Button
            sx={{
              color: "#000",
              textTransform: "capitalize", // ✅ حروف اول بزرگ
              fontWeight: 500,
              fontSize: "1rem",
              "&:hover": {
                borderBottom: "2px solid #3f51b5",
                transition: "border-bottom 0.3s ease",
              },
            }}
          >
            {t(key)}
          </Button>
        </Link>
      ))}
    </Box>
  )}

  {/* آیکون‌ها سمت راست */}
  <Box
    sx={{
      flex: 1,
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
    }}
  >
    <Link href="/cart" passHref>
      <IconButton>
        <Badge
          badgeContent={cart.items.length}
          color="error"
          overlap="circular"
        >
          <ShoppingCartIcon sx={{ fontSize: 24, color: "#000" }} />
        </Badge>
      </IconButton>
    </Link>
    <IconButton onClick={toggleLanguageModal}>
      <LanguageIcon sx={{ fontSize: 24, color: "#000" }} />
    </IconButton>
    <AccountMenu />
  </Box>
</Toolbar>

      </AppBar>

      {isMobile && (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          PaperProps={{
            sx: {
              backgroundColor: "#fff",
              width: "70%",
              boxShadow: 3,
              height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
              mt: `${NAVBAR_HEIGHT}px`,
            },
          }}
        >
         <List sx={{ mt: 2 }}>
            {[
              { label: t("newArrivals"), href: "/products" },
              { label: t("collections"), href: "/products" },
              { label: t("shop"), href: "/products" },
              { label: t("viewCart"), href: "/cart" },
            ].map(({ label, href }, index, array) => (
              <React.Fragment key={href}>
                <Link href={href} passHref legacyBehavior>
                  <ListItemButton component="a" sx={{ px: 3 }}>
                    <ListItemText primary={label} />
                  </ListItemButton>
                </Link>
                {index < array.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Drawer>
      )}

      <LanguageSelector
        isOpen={languageModalOpen}
        onClose={() => setLanguageModalOpen(false)}
      />
    </>
  );
};

export default NavBar;
