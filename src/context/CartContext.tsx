import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';

// Types
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
}

// Initial State
const initialState: CartState = {
  items: [],
};

// Actions
type Action =
  | { type: 'SET_ITEMS'; payload: CartItem[] } 
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_ITEM'; payload: { id: string; quantity: number } };

const cartReducer = (state: CartState, action: Action): CartState => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((item) => item.id !== action.payload) };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
      };
    default:
      return state;
  }
};

// Context
const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState);
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  // خواندن localStorage و تنظیم کاربر پس از بارگذاری
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('cart');
      const token = localStorage.getItem('token');
      if (localData) {
        dispatch({ type: 'SET_ITEMS', payload: JSON.parse(localData) });
      }
      if (token) {
        setUser(token); // تنظیم کاربر پس از بارگذاری
      }
      setIsMounted(true);
    }
  }, []);

  // ذخیره‌سازی سبد خرید در سرور برای کاربر لاگین کرده
  useEffect(() => {
    const saveCartToServer = async (cartItems: CartItem[]) => {
      if (user) {
        try {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cartItems),
          });
        } catch (error) {
          console.error('Failed to save cart to server:', error);
        }
      }
    };

    if (user) {
      saveCartToServer(cart.items);
    }
  }, [cart.items, user]);

  // بازیابی سبد خرید از سرور پس از ورود کاربر
  useEffect(() => {
    const fetchCartFromServer = async () => {
      if (user) {
        try {
          const response = await fetch('/api/cart');
          const savedCart = await response.json();
          dispatch({ type: 'SET_ITEMS', payload: savedCart });
        } catch (error) {
          console.error('Failed to fetch cart from server:', error);
        }
      }
    };

    if (user) {
      fetchCartFromServer();
    }
  }, [user]);

  // ذخیره‌سازی سبد خرید در localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('cart', JSON.stringify(cart.items)); 
    }
  }, [cart.items, isMounted]);

  const addItem = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateItem = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { id, quantity } });
  };

  if (!isMounted) {
    return null; 
  }

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateItem }}>
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
