"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./PhoneVerification.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope, faHome, faUser, faKey } from '@fortawesome/free-solid-svg-icons';

const baseURL = "http://localhost:3001";

export default function PhoneVerification() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [fullname, setFullname] = useState("");
  const [code, setCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeConfirmed, setIsCodeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendPhone = async () => {
    setLoading(true);
    try {
      const _response = await axios.post(`${baseURL}/auth/verify-phone`, {
        phone,
        email,
        address,
        fullname,
      });
      setIsCodeSent(true);
      setError("");
    } catch (_err) {
      setError("Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    try {
      const _response = await axios.post(`${baseURL}/auth/confirm-code`, {
        phone,
        code,
      });
      if (_response.data.accessToken) {
        localStorage.setItem("token", _response.data.accessToken);
        localStorage.setItem("phone", phone);
        localStorage.setItem("email", _response.data.user.email || "");
        localStorage.setItem("address", _response.data.user.address || "");
        localStorage.setItem("fullname", _response.data.user.fullname || "");
        localStorage.setItem("role", _response.data.user.role || "user");
        setIsCodeConfirmed(true);
        setError("");
      } else {
        setError("Invalid code or failed to login");
      }
    } catch (_err) {
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
               <FontAwesomeIcon icon={faPhone} className={`${styles.icon} ${styles.phoneIcon}`} />
            </div>
            <div className={styles.inputWithIcon}>
              <input
                type="text"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
              />
          <FontAwesomeIcon icon={faEnvelope} className={`${styles.icon} ${styles.emailIcon}`} />
            </div>
            <div className={styles.inputWithIcon}>
              <input
                type="text"
                placeholder="Your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={styles.input}
              />
             <FontAwesomeIcon icon={faHome} className={`${styles.icon} ${styles.addressIcon}`} />
            </div>
            <div className={styles.inputWithIcon}>
              <input
                type="text"
                placeholder="Your full name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className={styles.input}
              />
             <FontAwesomeIcon icon={faUser} className={`${styles.icon} ${styles.userIcon}`} />
            </div>
            <button
              onClick={sendPhone}
              className={styles.button}
              disabled={loading}
            >
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
         <FontAwesomeIcon icon={faKey} className={`${styles.icon} ${styles.keyIcon}`} />
            </div>
            <button
              onClick={verifyCode}
              className={styles.button}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </div>
        )}
        {isCodeConfirmed && (
          <div className={styles.successMessage}>
            Code confirmed! You are logged in.
          </div>
        )}
      </div>
    </div>
  );
}
