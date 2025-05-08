"use client";

import React, { useState, useEffect, useCallback } from "react";
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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);


  const isMobile = useMediaQuery("(max-width: 600px)");



  const handleMouseEnter = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    localStorage.removeItem("cart");
    router.push("/auth/login");
  }, [logout, router]);

  if (!ready) return null;

  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{ display: "inline-block" }}
    >
      <Button
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl)}
        aria-controls="account-menu"
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
        open={Boolean(anchorEl)}
        onClose={handleMouseLeave}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        disableScrollLock
        PaperProps={{ sx: { position: "absolute" } }}
      >
        {isAuthenticated ? (
          <>
            <Link href="/account" passHref>
              <MenuItem onClick={handleMouseLeave} className={styles.menuItemHover}>
                <Settings sx={{ mr: 1 }} />
                {t("accountSettings")}
              </MenuItem>
            </Link>
            <Link href="/favorites" passHref>
              <MenuItem onClick={handleMouseLeave} className={styles.menuItemHover}>
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
              <MenuItem onClick={handleMouseLeave} className={styles.menuItemHover}>
                <Login sx={{ mr: 1 }} />
                {t("login")}
              </MenuItem>
            </Link>
            <Link href="/auth/register" passHref>
              <MenuItem onClick={handleMouseLeave} className={styles.menuItemHover}>
                <PersonAdd sx={{ mr: 1 }} />
                {t("signUp")}
              </MenuItem>
            </Link>
          </>
        )}

        <Divider className={styles.divider} />

        <MenuItem onClick={handleMouseLeave} className={styles.menuItemHover}>
          <HelpOutline sx={{ mr: 1 }} />
          {t("support")}
        </MenuItem>
        <MenuItem onClick={handleMouseLeave} className={styles.menuItemHover}>
          <ShoppingBag sx={{ mr: 1 }} />
          {t("shop")}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AccountMenu;
