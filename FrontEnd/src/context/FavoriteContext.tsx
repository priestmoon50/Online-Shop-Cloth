'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from 'react';

// Types
interface FavoriteItem {
  id: string | number;
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
  removeFavorite: (id: string | number) => void;
}

// Initial State
const initialState: FavoriteState = {
  items: [],
};

// Actions
type Action =
  | { type: 'SET_ITEMS'; payload: FavoriteItem[] }
  | { type: 'ADD_FAVORITE'; payload: FavoriteItem }
  | { type: 'REMOVE_FAVORITE'; payload: string | number };

// Reducer
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

// Provider
export const FavoriteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, dispatch] = useReducer(favoriteReducer, initialState);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('favorites');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          dispatch({ type: 'SET_ITEMS', payload: parsed });
        } catch (err) {
          console.error('Error parsing favorites from localStorage:', err);
        }
      }
      setIsMounted(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('favorites', JSON.stringify(favorites.items));
    }
  }, [favorites.items, isMounted]);

  const addFavorite = (item: FavoriteItem) => {
    dispatch({ type: 'ADD_FAVORITE', payload: item });
  };

  const removeFavorite = (id: string | number) => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: id });
  };

  if (!isMounted) return null;

  return (
    <FavoriteContext.Provider value={{ favorites, addFavorite, removeFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
};

// Hook
export const useFavorites = (): FavoriteContextProps => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
};
