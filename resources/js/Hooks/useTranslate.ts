import { useTranslation } from 'react-i18next';

/**
 * Custom hook for translations with fallback support
 *
 * This hook wraps the useTranslation hook from react-i18next and provides
 * additional functionality like fallback values and interpolation.
 */
function useTranslate() {
  const { t, i18n } = useTranslation();

  /**
   * Translate a key with fallback and interpolation support
   *
   * @param key - The translation key
   * @param fallback - Optional fallback text if the key is not found
   * @param options - Optional interpolation values
   * @returns The translated text
   */
  const translate = (key: string, fallback?: string, options?: Record<string, any>) => {
    // If the key exists in the translations, use it
    if (i18n.exists(key)) {
      return t(key, options);
    }

    // If a fallback is provided, use it
    if (fallback) {
      return fallback;
    }

    // Otherwise, return the key itself (this helps identify missing translations)
    return key;
  };

  return {
    t: translate,
    i18n,
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage,
    languages: i18n.languages,
  };
}

// Export both as named and default export for flexibility
export { useTranslate };
export default useTranslate;
