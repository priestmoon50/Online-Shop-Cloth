// src/utils/calculateDiscount.ts
export const calculateDiscountedPrice = (price: number, discount?: number): number | null => {
    if (discount) {
      return price - (price * discount / 100);
    }
    return null;
  };
  