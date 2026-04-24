import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import "./GlossaryModal.css";

export default function GlossaryModal({ onClose }) {
  const { lang, t } = useLanguage();
  const [glossary, setGlossary] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}locales/glossary-${lang}.json`)
      .then((res) => res.json())
      .then((data) => setGlossary(data))
      .catch(() => setGlossary([]));
  }, [lang]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel glossary-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t("glossaryTitle")}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <table className="glossary-table">
            <thead>
              <tr>
                <th>{t("category")}</th>
                <th>{t("description")}</th>
              </tr>
            </thead>
            <tbody>
              {glossary.map((item, index) => (
                <tr key={index}>
                  <td>{item.category}</td>
                  <td>{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
