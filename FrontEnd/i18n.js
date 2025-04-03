import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next) // پیاده‌سازی برای React
  .init({
    resources: {
      en: {
        translation: require('./public/locales/en/common.json'), // بارگذاری دستی فایل JSON
      },
      fa: {
        translation: require('./public/locales/fa/common.json'), // بارگذاری دستی فایل JSON
      },
      fr: {
        translation: require('./public/locales/fr/common.json'), // بارگذاری دستی فایل JSON
      },
      de: {
        translation: require('./public/locales/de/common.json'), // بارگذاری دستی فایل JSON
      },
      es: {
        translation: require('./public/locales/es/common.json'), // بارگذاری دستی فایل JSON
      }, 
    },
    lng: 'en', // زبان پیش‌فرض
    fallbackLng: 'en', // زبان fallback در صورت عدم وجود ترجمه
    interpolation: {
      escapeValue: false, // جلوگیری از escape در متن‌های ترجمه‌شده
    },
  });

export default i18n;
