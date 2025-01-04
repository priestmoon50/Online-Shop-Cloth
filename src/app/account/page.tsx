"use client";

import { useEffect, useReducer } from "react";
import styles from "./AccountSettings.module.css"; // وارد کردن CSS Module

// تعریف نوع داده‌ها
interface UserData {
  phone: string;
}

interface Action {
  type: string;
  payload: Partial<UserData>;
}

// وضعیت اولیه
const initialState: UserData = {
  phone: "",
};

// تابع کاهش‌دهنده (reducer)
function reducer(state: UserData, action: Action) {
  switch (action.type) {
    case "SET_DATA":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// تابع برای بارگذاری داده‌ها از localStorage
const loadData = (): Partial<UserData> => {
  return {
    phone: localStorage.getItem("phone") || "",
  };
};

const AccountSettings = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const storedData = loadData();
    dispatch({ type: "SET_DATA", payload: storedData });
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Account</h1>

      <ul className={styles.list}>
        <li className={styles.listItem}>
          <span className={styles.label}>Phone:</span> {state.phone}
        </li>
      </ul>
    </div>
  );
};

export default AccountSettings;
