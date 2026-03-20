import { createContext, useContext, useState, useEffect, useCallback } from "react";

const LanguageContext = createContext();

const SUPPORTED_LANGS = ["en", "fr"];
const STORAGE_KEY = "toolkit-lang";

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("en");
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGS.includes(saved)) {
      setLang(saved);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/locales/${lang}.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load translations");
        return res.json();
      })
      .then((data) => {
        setTranslations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading translations:", err);
        setLoading(false);
      });
  }, [lang]);

  const switchLang = useCallback((newLang) => {
    if (SUPPORTED_LANGS.includes(newLang)) {
      setLang(newLang);
      localStorage.setItem(STORAGE_KEY, newLang);
    }
  }, []);

  const t = useCallback(
    (key, fallback = "") => {
      return translations[key] ?? fallback ?? key;
    },
    [translations]
  );

  return (
    <LanguageContext.Provider value={{ lang, switchLang, t, loading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
