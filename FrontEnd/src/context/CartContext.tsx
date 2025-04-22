'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from 'react';

// ================== Types ==================
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string | number;
  color?: string | number;
  image?: string;
}

interface CartState {
  items: CartItem[];
}

interface CartContextProps {
  cart: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, quantity: number) => void;
  clearCart: () => void; // اضافه شده
}

// ================== Initial ==================
const initialState: CartState = {
  items: [],
};

// ================== Reducer ==================
type Action =
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_ITEM'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }; // اضافه شده

const cartReducer = (state: CartState, action: Action): CartState => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
};

// ================== Context ==================
const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState);
  const [isMounted, setIsMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('cart');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          dispatch({ type: 'SET_ITEMS', payload: parsed });
        } catch (err) {
          console.error('Error parsing cart from localStorage:', err);
        }
      }
      setIsMounted(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('cart', JSON.stringify(cart.items));
    }
  }, [cart.items, isMounted]);

  // متدهای مدیریت سبد خرید
  const addItem = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateItem = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    localStorage.removeItem('cart');
  };

  if (!isMounted) return null;

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, updateItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextProps => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
