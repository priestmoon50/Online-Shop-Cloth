'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from 'react';

// ============ Types ============
interface Variant {
  size: string;
  quantity: number;
  color?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  variants: Variant[];
}

interface CartState {
  items: CartItem[];
}

interface CartContextProps {
  cart: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size?: string, color?: string) => void;
  updateItem: (id: string, size: string, color: string | undefined, quantity: number) => void;
  clearCart: () => void;
  couponCode: string | null;
  setCouponCode: (code: string | null) => void;
  discountPercent: number;
  setDiscountPercent: (percent: number) => void;
}

// ============ Initial State ============
const initialState: CartState = {
  items: [],
};

// ============ Reducer ============
type Action =
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: string; size?: string; color?: string } }
  | { type: 'UPDATE_ITEM'; payload: { id: string; size: string; color?: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const cartReducer = (state: CartState, action: Action): CartState => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };

    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex((item) => item.id === action.payload.id);
      if (existingIndex === -1) {
        return { ...state, items: [...state.items, action.payload] };
      }

      const updatedItems = [...state.items];
      const existingItem = updatedItems[existingIndex];

      action.payload.variants.forEach((incomingVariant) => {
        const variantIndex = existingItem.variants.findIndex(
          (v) => v.size === incomingVariant.size && v.color === incomingVariant.color
        );

        if (variantIndex === -1) {
          existingItem.variants.push(incomingVariant);
        } else {
          existingItem.variants[variantIndex].quantity += incomingVariant.quantity;
        }
      });

      updatedItems[existingIndex] = { ...existingItem };
      return { ...state, items: updatedItems };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items
          .map((item) => {
            if (item.id !== action.payload.id) return item;

            // حذف کامل محصول اگر size مشخص نشده باشد
            if (!action.payload.size) return null;

            const newVariants = (item.variants || []).filter(
              (v) =>
                v.size !== action.payload.size ||
                (action.payload.color !== undefined && v.color !== action.payload.color)
            );

            if (newVariants.length === 0) return null;
            return { ...item, variants: newVariants };
          })
          .filter(Boolean) as CartItem[],
      };

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.id !== action.payload.id) return item;

          const updatedVariants = (item.variants || []).map((v) =>
            v.size === action.payload.size && v.color === action.payload.color
              ? { ...v, quantity: action.payload.quantity }
              : v
          );

          return { ...item, variants: updatedVariants };
        }),
      };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    default:
      return state;
  }
};

// ============ Context ============
const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState);
  const [isMounted, setIsMounted] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

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

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('cart', JSON.stringify(cart.items));
    }
  }, [cart.items, isMounted]);

  const addItem = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string, size?: string, color?: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id, size, color } });
  };

  const updateItem = (id: string, size: string, color: string | undefined, quantity: number) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { id, size, color, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    localStorage.removeItem('cart');
  };

  if (!isMounted) return null;

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateItem,
        clearCart,
        couponCode,
        setCouponCode,
        discountPercent,
        setDiscountPercent,
      }}
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
