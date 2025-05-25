import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import language files
// @ts-ignore
import en from './en.json';
// @ts-ignore
import bem from './bem.json';

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en
      },
      bem: {
        translation: bem
      }
    },
    lng: document.documentElement.lang || 'en', // Use the HTML lang attribute or default to English
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
