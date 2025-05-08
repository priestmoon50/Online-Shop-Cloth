"use client";

import {
  Facebook, Instagram, Google, WhatsApp, Telegram,
  LinkedIn, Twitter, GitHub, YouTube,
} from "@mui/icons-material";
import styles from "./support.module.css";
import { useState } from "react";
import { useMediaQuery } from "@mui/material";

export default function SupportPage() {
  const [active, setActive] = useState(false);
  const isMobile = useMediaQuery("(max-width:768px)");

  const handleClick = () => {
    if (isMobile) {
      setActive((prev) => !prev);
    }
  };

  return (
    <div className={styles.body}>
      <div
        className={`${styles.navbar} ${isMobile && active ? styles.active : ""}`}
        onClick={handleClick}
      >
        Social
        <ul className={styles.menu}>
          <li><a href="#"><Facebook style={{ color: "#1877F2" }} fontSize="large" /></a></li>
          <li><a href="https://www.instagram.com/mopastyle_/" target="_blank" rel="noopener noreferrer">
          <Instagram style={{ color: "#E4405F" }} fontSize="large" /></a></li>
          
          <li><a href="#"><Google style={{ color: "#DB4437" }} fontSize="large" /></a></li>
          <li><a href="#"><WhatsApp style={{ color: "#25D366" }} fontSize="large" /></a></li>
          <li><a href="#"><Telegram style={{ color: "#0088CC" }} fontSize="large" /></a></li>
          <li><a href="#"><LinkedIn style={{ color: "#0A66C2" }} fontSize="large" /></a></li>
          <li><a href="#"><Twitter style={{ color: "#1DA1F2" }} fontSize="large" /></a></li>
          <li><a href="#"><GitHub style={{ color: "#333" }} fontSize="large" /></a></li>
          <li><a href="#"><YouTube style={{ color: "#FF0000" }} fontSize="large" /></a></li>
        </ul>
      </div>
    </div>
  );
}
