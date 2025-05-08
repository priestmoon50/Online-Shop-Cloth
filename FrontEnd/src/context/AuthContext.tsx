// 📁 FrontEnd/src/context/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import TokenService from "@/utils/TokenService";
import { jwtDecode } from "jwt-decode";

interface UserInfo {
  userId: string;
  email: string;
  exp?: number;
}

interface AuthContextType {
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  ready: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(TokenService.getToken());
  const [user, setUser] = useState<UserInfo | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<UserInfo>(token);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(decoded);
        }
      } catch (err) {
        console.error("❌ Invalid token detected. Logging out.");
        logout();
      }
    } else {
      setUser(null);
    }
    setReady(true); // ✅ بعد از تلاش برای بررسی توکن
  }, [token]);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedToken = TokenService.getToken();
      setToken(storedToken);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (newToken: string) => {
    TokenService.setToken(newToken);
    setToken(newToken);
  };

  const logout = () => {
    TokenService.removeToken();
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated, ready, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
