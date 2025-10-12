"use client";

import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Box,
  Divider,
  useMediaQuery,
} from "@mui/material";
import {
  AccountCircle,
  ArrowDropDown,
  Settings,
  HelpOutline,
  ShoppingBag,
  PersonAdd,
  Favorite,
  Logout,
  Login,
} from "@mui/icons-material";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import styles from "./AccountMenu.module.css";

const AccountMenu: React.FC = () => {
  const { t } = useTranslation();
  const { logout, isAuthenticated, ready } = useAuth();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 600px)");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("cart");
    router.push("/auth/login");
  };

  if (!ready) return null;

  return (
    <Box sx={{ display: "inline-block" }}>
      <Button
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="account-menu"
        onClick={handleOpen}
        sx={{
          color: "#000",
          padding: isMobile ? "10px 8px" : "10px 20px",
          minWidth: isMobile ? "auto" : "64px",
          marginRight: isMobile ? "0px" : "8px",
        }}
      >
        <AccountCircle sx={{ mr: isMobile ? 0 : 1, fontSize: 24 }} />
        {!isMobile && t("account")}
        <ArrowDropDown />
      </Button>

      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        disableScrollLock
        PaperProps={{ sx: { position: "absolute" } }}
      >
        {isAuthenticated ? (
          <>
            <Link href="/account" passHref>
              <MenuItem onClick={handleClose} className={styles.menuItemHover}>
                <Settings sx={{ mr: 1 }} />
                {t("accountSettings")}
              </MenuItem>
            </Link>
            <Link href="/favorites" passHref>
              <MenuItem onClick={handleClose} className={styles.menuItemHover}>
                <Favorite sx={{ mr: 1 }} />
                {t("favorites")}
              </MenuItem>
            </Link>
            <MenuItem onClick={handleLogout} className={styles.menuItemHover}>
              <Logout sx={{ mr: 1 }} />
              {t("logout")}
            </MenuItem>
          </>
        ) : (
          <>
            <Link href="/auth/login" passHref>
              <MenuItem onClick={handleClose} className={styles.menuItemHover}>
                <Login sx={{ mr: 1 }} />
                {t("login")}
              </MenuItem>
            </Link>
            <Link href="/auth/register" passHref>
              <MenuItem onClick={handleClose} className={styles.menuItemHover}>
                <PersonAdd sx={{ mr: 1 }} />
                {t("signUp")}
              </MenuItem>
            </Link>
          </>
        )}

        <Divider className={styles.divider} />

        <Link href="/support" passHref>
          <MenuItem onClick={handleClose} className={styles.menuItemHover}>
            <HelpOutline sx={{ mr: 1 }} />
            {t("support")}
          </MenuItem>
        </Link>
 
        <Link href="/products" passHref>
          <MenuItem onClick={handleClose} className={styles.menuItemHover}>
            <ShoppingBag sx={{ mr: 1 }} />
            {t("shop")}
          </MenuItem>
        </Link>
      </Menu>
    </Box>
  );
};

export default AccountMenu;
