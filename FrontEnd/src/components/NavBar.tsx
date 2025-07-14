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
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import CollectionsIcon from "@mui/icons-material/Collections";
import StorefrontIcon from "@mui/icons-material/Storefront";

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
    
    backgroundColor: "rgba(255, 255, 255, 0.6)",   // نیمه شفاف
    backdropFilter: "blur(12px)",                 // افکت شیشه‌ای
    WebkitBackdropFilter: "blur(12px)",           // پشتیبانی برای Safari
    px: 2,
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
        backdropFilter: "blur(12px)",
      backgroundColor: "rgba(255, 255, 255, 0.75)",
      width: "75%",
      boxShadow: 4,
      height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
      mt: `${NAVBAR_HEIGHT}px`,
      px: 2,
      pt: 3,
      borderTopRightRadius: "16px",
    },
  }}
>
  <List>
    {[
      {
        key: "newArrivals",
        label: t("newArrivals"),
        href: "/products",
    icon: <NewReleasesIcon sx={{ color: "#ff5722" }} />,
      },
      {
        key: "collections",
        label: t("collections"),
        href: "/products",
    icon: <CollectionsIcon sx={{ color: "#3f51b5" }} />,
      },
      {
        key: "shop",
        label: t("shop"),
        href: "/products",
     icon: <StorefrontIcon sx={{ color: "#4caf50" }} />,
      },
      {
        key: "viewCart",
        label: t("viewCart"),
        href: "/cart",
icon: <ShoppingCartIcon sx={{ color: "#e91e63" }} />,
      },
    ].map(({ key, label, href, icon }, index, array) => (
      <React.Fragment key={key}>
        <Link href={href} passHref legacyBehavior>
          <ListItemButton
            component="a"
            sx={{
              borderRadius: "12px",
              px: 2,
              py: 1.5,
              mb: 1,
              transition: "background 0.2s ease",
              "&:hover": {
                backgroundColor: "#eee",
              },
            }}
            onClick={() => setDrawerOpen(false)}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#e0e0e0",
                borderRadius: "8px",
                width: 36,
                height: 36,
                mr: 2,
              }}
            >
              {icon}
            </Box>
            <ListItemText
              primary={label}
              primaryTypographyProps={{
                sx: {
                  fontFamily: "inherit",
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: "#333",
                },
              }}
            />
          </ListItemButton>
        </Link>
        {index < array.length - 1 && <Divider sx={{ my: 1 }} />}
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
