import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import global_es from '../locales/es/global.json';
import global_en from '../locales/en/global.json';

i18n
  .use(initReactI18next)
  .init({
    interpolation: { escapeValue: false }, 
    lng: 'es', // Idioma por defecto
    resources: {
      es: {
        global: global_es, 
      },
      en: {
        global: global_en,
      },
    },
  });

export { default } from 'i18next';