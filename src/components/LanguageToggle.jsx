import { useLanguage } from "../context/LanguageContext";
import "./LanguageToggle.css";

export default function LanguageToggle() {
  const { lang, switchLang } = useLanguage();

  return (
    <button
      className="lang-toggle"
      onClick={() => switchLang(lang === "en" ? "fr" : "en")}
      aria-label={lang === "en" ? "Passer à l'anglais" : "Switch to French"}
    >
      {lang === "en" ? "EN" : "FR"}
    </button>
  );
}
