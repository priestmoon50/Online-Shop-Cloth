// 📁 src/utils/convertCurrency.ts

const USD_TO_EUR = 0.92;

export const convertToEuro = (usd: number): string =>
  (usd * USD_TO_EUR).toFixed(2);
