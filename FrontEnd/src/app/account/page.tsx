"use client";

import { useEffect, useState } from "react";
import styles from "./AccountSettings.module.css";
import { useAuth } from "@/context/AuthContext";

interface User {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export default function AccountSettings() {
  const { token, isAuthenticated, ready } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return; // منتظر mount کامل context
    if (!isAuthenticated || !token) {
      setError("User not authenticated.");
      return;
    }

    fetch("/api/user/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setUser(data.user);
      })
      .catch(() => setError("Failed to load user data."));
  }, [ready, isAuthenticated, token]);

  if (!ready) return <p className={styles.loading}>Initializing...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!user) return <p className={styles.loading}>Loading...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Account Information</h1>
      <div className={styles.card}>
        <div className={styles.row}>
          <span className={styles.label}>Email</span>
          <span className={styles.value}>{user.email}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>First Name</span>
          <span className={styles.value}>{user.firstName}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Last Name</span>
          <span className={styles.value}>{user.lastName}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Phone</span>
          <span className={styles.value}>{user.phone}</span>
        </div>
      </div>
    </div>
  );
}
