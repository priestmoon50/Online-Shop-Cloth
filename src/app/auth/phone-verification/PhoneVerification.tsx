"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./PhoneVerification.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faKey } from '@fortawesome/free-solid-svg-icons';

const baseURL = "http://localhost:3001";

export default function PhoneVerification() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeConfirmed, setIsCodeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendPhone = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${baseURL}/auth/verify-phone`, { phone });
      if (response.status === 200) {
        setIsCodeSent(true);
        setError("");
      } else {
        setError("Failed to send verification code");
      }
    } catch (err) {
      console.error("Error sending verification code:", err);
      setError("Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${baseURL}/auth/confirm-code`, { phone, code });
      if (response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        localStorage.setItem("phone", phone);
        setIsCodeConfirmed(true);
        setError("");
      } else {
        setError("Invalid code or failed to login");
      }
    } catch (err) {
      console.error("Error verifying code:", err);
      setError("Failed to verify code");
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
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={styles.input}
              />
              <FontAwesomeIcon icon={faPhone} className={styles.icon} />
            </div>
            <button onClick={sendPhone} className={styles.button} disabled={loading}>
              {loading ? "Sending..." : "Send Code"}
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
          <div className={styles.successMessage}>Code confirmed! You are logged in.</div>
        )}
      </div>
    </div>
  );
}
