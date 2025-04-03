"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./PhoneVerification.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faKey } from "@fortawesome/free-solid-svg-icons";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "";


export default function PhoneVerification() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeConfirmed, setIsCodeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);

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

  const sendPhone = async () => {
    setError("");
    if (!phone.startsWith("+")) {
      setError("Phone number must start with + and country code (e.g. +49)");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${baseURL}/auth/verify-phone`, { phone });
      if (response.status === 200) {
        setIsCodeSent(true);
        setTimer(60); // 60 ثانیه قفل برای ارسال مجدد
      } else {
        setError("Something went wrong while sending the code.");
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to send verification code";
      console.error("Error sending verification code:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${baseURL}/auth/confirm-code`, { phone, code });
      if (response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        localStorage.setItem("phone", phone);
        setIsCodeConfirmed(true);
      } else {
        setError("Invalid code or failed to login.");
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to verify code.";
      console.error("Error verifying code:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
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
              {loading ? "Sending..." : timer > 0 ? `Wait ${timer}s` : "Send Code"}
            </button>
          </div>
        ) : (
          <div className={styles.inputGroup}>
            <div className={styles.inputWithIcon}>
              <input
                type="text"
                placeholder="Enter verification code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={styles.input}
              />
              <FontAwesomeIcon icon={faKey} className={styles.icon} />
            </div>
            <button onClick={verifyCode} className={styles.button} disabled={loading}>
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </div>
        )}

        {isCodeConfirmed && (
          <div className={styles.successMessage}>Code confirmed! You are logged in 🎉</div>
        )}
      </div>
    </div>
  );
}
