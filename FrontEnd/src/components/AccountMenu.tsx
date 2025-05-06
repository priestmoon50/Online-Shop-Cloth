"use client";

import React, { useState, useCallback } from "react";
import { Button, Menu, MenuItem, Box, Divider } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import SettingsIcon from "@mui/icons-material/Settings";
import SupportIcon from "@mui/icons-material/HelpOutline";
import ShopIcon from "@mui/icons-material/ShoppingBag";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import styles from "./AccountMenu.module.css";
import { useMediaQuery } from "@mui/material";

const AccountMenu: React.FC = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { logout, isAuthenticated } = useAuth();
  const router = useRouter();
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
    router.push("/auth/phone-verification"); // یا "/" برای رفتن به صفحه اصلی
  }, [logout, router]);

  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{ display: "inline-block" }}
    >
      <Button
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl) ? "true" : "false"}
        aria-controls="account-menu"
        sx={{
          color: "#000",
          padding: isMobile ? "10px 8px" : "10px 20px",
          minWidth: isMobile ? "auto" : "64px", 
          marginRight: isMobile ? "0px" : "8px",
        }}
      >
        <AccountCircleIcon sx={{ mr: isMobile ? 0 : "5px" }} />
        {!isMobile && t("account")}
        <ArrowDropDownIcon />
      </Button>
      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMouseLeave}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        disableScrollLock={true}
        PaperProps={{
          sx: {
            position: "absolute",
          },
        }}
      >
        {!isAuthenticated ? (
          <>
            <Link href="/auth/phone-verification" passHref>
              <MenuItem
                onClick={handleMouseLeave}
                className={styles.logInButton}
              >
                {t("login")}
              </MenuItem>
            </Link>
            <Link href="/auth/phone-verification" passHref>
              <MenuItem
                onClick={handleMouseLeave}
                className={styles.menuItemHover}
              >
                <PersonAddIcon sx={{ marginRight: "10px" }} />
                {t("signUp")}
              </MenuItem>
            </Link>
            <Link href="/favorites" passHref>
              <MenuItem
                onClick={handleMouseLeave}
                className={styles.menuItemHover}
              >
                <FavoriteIcon sx={{ marginRight: "10px" }} />
                {t("favorites")}
              </MenuItem>
            </Link>
          </>
        ) : (
          <>
            <MenuItem onClick={handleLogout} className={styles.menuItemHover}>
              <AccountCircleIcon sx={{ marginRight: "10px" }} />
              {t("logout")}
            </MenuItem>
            <Link href="/favorites" passHref>
              <MenuItem
                onClick={handleMouseLeave}
                className={styles.menuItemHover}
              >
                <FavoriteIcon sx={{ marginRight: "10px" }} />
                {t("favorites")}
              </MenuItem>
            </Link>
          </>
        )}
        <Divider className={styles.divider} />
        <Link href="/account" passHref>
          <MenuItem onClick={handleMouseLeave} className={styles.menuItemHover}>
            <SettingsIcon sx={{ marginRight: "10px" }} />
            {t("accountSettings")}
          </MenuItem>
        </Link>
        <Divider className={styles.divider} />
        <MenuItem onClick={handleMouseLeave} className={styles.menuItemHover}>
          <SupportIcon sx={{ marginRight: "10px" }} />
          {t("support")}
        </MenuItem>
        <MenuItem onClick={handleMouseLeave} className={styles.menuItemHover}>
          <ShopIcon sx={{ marginRight: "10px" }} />
          {t("shop")}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AccountMenu;
