"use client";

import { useState, useEffect } from "react";
import styles from "./PhoneVerification.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faKey } from "@fortawesome/free-solid-svg-icons";

export default function PhoneVerification() {
  const [phone, setPhone] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [isCodeSent, setIsCodeSent] = useState<boolean>(false);
  const [isCodeConfirmed, setIsCodeConfirmed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [timer, setTimer] = useState<number>(0);

  // تایمر شمارش معکوس
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const sendPhone = () => {
    setError("");
    if (!phone.startsWith("+")) {
      setError("Phone number must start with + and country code (e.g. +49)");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setIsCodeSent(true);
      setTimer(60);
      setLoading(false);
    }, 1000); // شبیه‌سازی تاخیر
  };

  const verifyCode = () => {
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (code === "1234") {
        localStorage.setItem("token", "mock-token-abc123");
        localStorage.setItem("phone", phone);
        setIsCodeConfirmed(true);
      } else {
        setError("کد وارد شده صحیح نیست. کد تستی: 1234");
      }
      setLoading(false);
    }, 1000); // شبیه‌سازی تاخیر
  };

  useEffect(() => {
    if (isCodeConfirmed) {
      window.location.href = "/account";
    }
  }, [isCodeConfirmed]);

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.header}>Phone Verification</h1>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {!isCodeSent ? (
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
            <button onClick={sendPhone} className={styles.button} disabled={loading || timer > 0}>
              {loading ? "در حال ارسال..." : timer > 0 ? `منتظر بمانید ${timer}s` : "ارسال کد"}
            </button>
          </div>
        ) : (
          <div className={styles.inputGroup}>
            <div className={styles.inputWithIcon}>
              <input
                type="text"
                placeholder="کد را وارد کنید"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={styles.input}
              />
              <FontAwesomeIcon icon={faKey} className={styles.icon} />
            </div>
            <button onClick={verifyCode} className={styles.button} disabled={loading}>
              {loading ? "در حال بررسی..." : "تأیید کد"}
            </button>
          </div>
        )}

        {isCodeConfirmed && (
          <div className={styles.successMessage}>کد تایید شد! شما وارد شدید 🎉</div>
        )}
      </div>
    </div>
  );
}
