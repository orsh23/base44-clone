import { enUS, he } from 'date-fns/locale';

const locales = {
  en: enUS,
  he: he,
};

export const getLocaleObject = (languageCode) => {
  // Ensure languageCode is a string and try to use it
  if (typeof languageCode === 'string') {
    const lc = languageCode.toLowerCase();
    if (locales[lc]) {
      return locales[lc];
    }
  }
  // Fallback to enUS if languageCode is not a string, or not 'en'/'he', or any other issue
  return enUS; 
};

// Keep other exports if any