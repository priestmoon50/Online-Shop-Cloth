import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import TokenService from '@/utils/TokenService';

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(TokenService.getToken());

  // استفاده از useEffect برای شنیدن تغییرات در localStorage و به‌روزرسانی وضعیت
  useEffect(() => {
    const handleStorageChange = () => {
      const storedToken = TokenService.getToken();
      if (storedToken !== token) {
        setToken(storedToken);
      }
    };

    // گوش‌دادن به تغییرات در localStorage
    window.addEventListener('storage', handleStorageChange);

    // پاک‌سازی event listener زمانی که کامپوننت حذف می‌شود
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [token]);

  const login = (newToken: string) => {
    TokenService.setToken(newToken);
    setToken(newToken);
  };

  const logout = () => {
    TokenService.removeToken();
    setToken(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
