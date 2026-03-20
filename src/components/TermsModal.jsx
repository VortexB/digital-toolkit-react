import "./TermsModal.css";

import { useLanguage } from "../context/LanguageContext";
import "./TermsModal.css";

export default function TermsModal({ onClose, title }) {
  const { t } = useLanguage();
  const displayTitle = title || t("termsTitle");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel terms-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{displayTitle}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="terms-content">
          <p>{t("termsPara1")}</p>
          <p>{t("termsPara2")}</p>
          <p>{t("termsPara3")}</p>
        </div>
      </div>
    </div>
  );
}
