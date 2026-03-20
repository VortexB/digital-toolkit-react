import { useLanguage } from "../context/LanguageContext";
import "./LanguageToggle.css";

export default function LanguageToggle() {
  const { lang, switchLang } = useLanguage();

  return (
    <button
      className="lang-toggle"
      onClick={() => switchLang(lang === "en" ? "fr" : "en")}
      aria-label={lang === "en" ? "Switch to French" : "Passer à l'anglais"}
    >
      {lang === "en" ? "FR" : "EN"}
    </button>
  );
}
