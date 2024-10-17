import React, { useState, useCallback } from "react";
import { Button, Menu, MenuItem, Box, Divider } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import SettingsIcon from "@mui/icons-material/Settings";
import SupportIcon from "@mui/icons-material/HelpOutline";
import ShopIcon from "@mui/icons-material/ShoppingBag";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import styles from "./AccountMenu.module.css";
import FavoriteIcon from '@mui/icons-material/Favorite';

const AccountMenu: React.FC = () => {
  const { t } = useTranslation(); 
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { logout, isAuthenticated } = useAuth();

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
    localStorage.removeItem('cart'); // پاک کردن سبد خرید از localStorage
    window.location.reload(); // رفرش کل صفحه
  }, [logout]);
  
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
          color: "#000000",
          display: "flex",
          alignItems: "center",
          padding: "10px 20px",
          fontSize: "16px",
        }}
      >
        <AccountCircleIcon sx={{ marginRight: "5px" }} />
        {t("account")}
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
          <div>
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
          </div>
        ) : (
          <div>
            <MenuItem onClick={handleLogout} className={styles.menuItemHover}>
              <AccountCircleIcon sx={{ marginRight: "10px" }} />
              {t("logout")}
            </MenuItem>
          </div>
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
