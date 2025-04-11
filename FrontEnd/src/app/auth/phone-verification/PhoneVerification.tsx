"use client";

import { useState, useEffect } from "react";
import styles from "./PhoneVerification.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone } from "@fortawesome/free-solid-svg-icons";

export default function PhoneVerification() {
  const [phone, setPhone] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleLogin = () => {
    setError("");

    if (!phone.startsWith("+")) {
      setError("Phone number must start with + and country code (e.g. +49)");
      return;
    }

    // ذخیره در localStorage
    localStorage.setItem("token", "mock-token");
    localStorage.setItem("phone", phone);

    // هدایت به صفحه حساب کاربری
    window.location.href = "/account";
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.header}>Login with Phone</h1>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.inputGroup}>
          <div className={styles.inputWithIcon}>
            <input
              type="text"
              placeholder="+49176..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={styles.input}
            />
            <FontAwesomeIcon icon={faPhone} className={styles.icon} />
          </div>
          <button onClick={handleLogin} className={styles.button}>
            ورود به حساب
          </button>
        </div>
      </div>
    </div>
  );
}
