import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  return localStorage.getItem('selectedLanguage') || 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: require('./public/locales/en/common.json'),
      },
      fa: {
        translation: require('./public/locales/fa/common.json'),
      },
      fr: {
        translation: require('./public/locales/fr/common.json'),
      },
      de: {
        translation: require('./public/locales/de/common.json'),
      },
      es: {
        translation: require('./public/locales/es/common.json'),
      },
    },
    lng: getInitialLanguage(), // مقدار اولیه زبان از localStorage
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
