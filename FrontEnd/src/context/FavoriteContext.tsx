'use client';

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';

// Types
interface FavoriteItem {
    id: string | number; // تغییر نوع id به string | number
    name: string;
    price: number;
    imageUrl: string;
    images?: string[];
  }
  

interface FavoriteState {
  items: FavoriteItem[];
}

interface FavoriteContextProps {
  favorites: FavoriteState;
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
}

// Initial State
const initialState: FavoriteState = {
  items: [],
};

// Actions
type Action =
  | { type: 'SET_ITEMS'; payload: FavoriteItem[] }
  | { type: 'ADD_FAVORITE'; payload: FavoriteItem }
  | { type: 'REMOVE_FAVORITE'; payload: string };

const favoriteReducer = (state: FavoriteState, action: Action): FavoriteState => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_FAVORITE':
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_FAVORITE':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    default:
      return state;
  }
};

// Context
const FavoriteContext = createContext<FavoriteContextProps | undefined>(undefined);

export const FavoriteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, dispatch] = useReducer(favoriteReducer, initialState);
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  // خواندن localStorage و تنظیم کاربر پس از بارگذاری
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('favorites');
      const token = localStorage.getItem('token');
      if (localData) {
        dispatch({ type: 'SET_ITEMS', payload: JSON.parse(localData) });
      }
      if (token) {
        setUser(token);
      }
      setIsMounted(true);
    }
  }, []);

  // ذخیره‌سازی لیست علاقه‌مندی‌ها در سرور برای کاربر لاگین کرده
  useEffect(() => {
    const saveFavoritesToServer = async (favoriteItems: FavoriteItem[]) => {
      if (user) {
        try {
          await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(favoriteItems),
          });
        } catch (error) {
          console.error('Failed to save favorites to server:', error);
        }
      }
    };

    if (user) {
      saveFavoritesToServer(favorites.items);
    }
  }, [favorites.items, user]);

  // بازیابی لیست علاقه‌مندی‌ها از سرور
  useEffect(() => {
    const fetchFavoritesFromServer = async () => {
      if (user) {
        try {
          const response = await fetch('/api/favorites');
          const savedFavorites = await response.json();
          dispatch({ type: 'SET_ITEMS', payload: savedFavorites });
        } catch (error) {
          console.error('Failed to fetch favorites from server:', error);
        }
      }
    };

    if (user) {
      fetchFavoritesFromServer();
    }
  }, [user]);

  // ذخیره‌سازی لیست علاقه‌مندی‌ها در localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('favorites', JSON.stringify(favorites.items));
    }
  }, [favorites.items, isMounted]);

  const addFavorite = (item: FavoriteItem) => {
    dispatch({ type: 'ADD_FAVORITE', payload: item });
  };

  const removeFavorite = (id: string) => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: id });
  };

  if (!isMounted) {
    return null; 
  }

  return (
    <FavoriteContext.Provider value={{ favorites, addFavorite, removeFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = (): FavoriteContextProps => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
};
