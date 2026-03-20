import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import { useState } from "react";
import TermsModal from "../components/TermsModal";
import "./HomePage.css";

const PROJECT_TYPE_OPTIONS = [
  "App", "Artificial intelligence", "Big data", "Cloud service",
  "Instant messaging", "Operating system", "Portal or electronic medical records",
  "Smartphone", "Social media", "Software", "Telehealth",
  "Virtual reality", "Wearable", "Website",
];

const getLocationOptions = (t) => [
  { value: "general", label: t("locationCanadaExceptQuebec") },
  { value: "quebec", label: t("locationQuebec") },
  { value: "douglasciuss", label: t("locationDouglasciuss") },
  { value: "international", label: t("locationInternational") },
];

  const CISSS_CIUSSS_LIST = [
    "CISSS de l'Abitibi-Témiscamingue",
  "CISSS de la Côte-Nord",
  "CISSS de la Gaspésie",
  "CISSS de la Montérégie-Centre",
  "CISSS de la Montérégie-Est",
  "CISSS de la Montérégie-Ouest",
  "CISSS de Lanaudière",
  "CISSS de Laval",
  "CISSS de l'Outaouais",
  "CISSS des Îles",
  "CISSS des Laurentides",
  "CISSS du Bas-Saint-Laurent",
  "CIUSSS de l'Est-de-l'Île-de-Montréal",
  "CIUSSS de l'Estrie – CHUS",
  "CIUSSS de la Capitale-Nationale",
  "CIUSSS de la Mauricie-et-du-Centre-du-Québec",
  "CIUSSS du Centre-Ouest-de-l'Île-de-Montréal",
  "CIUSSS du Centre-Sud-de-l'Île-de-Montréal",
  "CIUSSS du Nord-de-l'Île-de-Montréal",
  "CIUSSS du Saguenay–Lac-Saint-Jean",
  "CIUSSS de l'Ouest-de-l'Île-de-Montréal",
];

export default function HomePage() {
  const { user, setUser } = useUser();
  const { t } = useLanguage();
  const [selectedGroup, setSelectedGroup] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const navigate = useNavigate();

  const LOCATION_OPTIONS = getLocationOptions(t);

  const handleBegin = () => {
    if (
      selectedGroup &&
      user.agreedToTerms &&
      user.projectTitle.trim() &&
      user.projectCountry.trim() &&
      user.projectTypes.length > 0
    ) {
      // Map international to general for question loading logic
      const groupToSet = selectedGroup === "international" ? "general" : selectedGroup;
      setUser((prev) => ({ ...prev, group: groupToSet }));
      navigate("/navigation");
    }
  };

  const handleGroupChange = (e) => {
    const value = e.target.value;
    setSelectedGroup(value);
    // Clear CISSS selection if not Quebec
    if (value !== "quebec") {
      setUser((prev) => ({ ...prev, cisssciusss: "" }));
    }
    // For international, treat same as general for question loading
    if (value === "international") {
      setUser((prev) => ({ ...prev, group: "general" }));
    }
  };

  const handleFieldChange = (field) => (e) => {
    setUser((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleTermsChange = (e) => {
    setUser((prev) => ({ ...prev, agreedToTerms: e.target.checked }));
  };

  const handleProjectTypeToggle = (type) => {
    setUser((prev) => {
      const types = prev.projectTypes.includes(type)
        ? prev.projectTypes.filter((t) => t !== type)
        : [...prev.projectTypes, type];
      return { ...prev, projectTypes: types };
    });
  };

  const handleOtherToggle = () => {
    setUser((prev) => {
      const hasOther = prev.projectTypes.includes("Other");
      const types = hasOther
        ? prev.projectTypes.filter((t) => t !== "Other")
        : [...prev.projectTypes, "Other"];
      return { ...prev, projectTypes: types, projectTypeOther: hasOther ? "" : prev.projectTypeOther };
    });
  };

  const isFormValid =
    selectedGroup &&
    user.agreedToTerms &&
    user.projectTitle.trim() &&
    user.projectCountry.trim() &&
    user.projectTypes.length > 0 &&
    (selectedGroup !== "quebec" || user.cisssciusss);

  return (
    <div className="home-page">
      <div className="logo-row">
        <a href="https://douglas.research.mcgill.ca/">
          <img src="imgs/douglas-logo.png" alt="Douglas logo" />
        </a>
        <img src="imgs/d3sm.png" alt="D3SM logo" />
        <img src="imgs/hbhl.png" alt="HBHL logo" />
        <img src="imgs/ludicmind.png" alt="LudicMind logo" />
      </div>

      <h1 className="header">{t("d3smTitle")}</h1>

      <div className="info-section">
        <h4>{t("whatIsThis")}</h4>
        <p>{t("infoWhatAboutBody")}</p>
        <ul>
          <li>{t("infoWhatAboutLi1")}</li>
          <li>{t("infoWhatAboutLi2")}</li>
          <li>{t("infoWhatAboutLi3")}</li>
        </ul>
        <p>{t("infoWhatAboutRec")}</p>

        <h4>{t("whoIsThisFor")}</h4>
        <ul>
          <li>{t("infoWhoLi1")}</li>
          <li>{t("infoWhoLi2")}</li>
        </ul>

        <h4>{t("howDoIUse")}</h4>
        <p>{t("infoHowDoIBody")}</p>

        <h4>{t("howWasItDeveloped")}</h4>
        <p>{t("infoHowDevelopedBody")}</p>
        <p className="reference">
          {t("infoReference")}
        </p>
      </div>

      {/* --- Form Section --- */}
      <div className="form-section">
        <div className="form-group">
          <label htmlFor="project-title">{t("projectTitle")}</label>
          <input
            id="project-title"
            type="text"
            value={user.projectTitle}
            onChange={handleFieldChange("projectTitle")}
          />
        </div>

        <div className="form-group">
          <label htmlFor="location-select">
            {t("selectYourLocation")}
            <span className="helper-text">{t("locationHelper")}</span>
          </label>
          <select id="location-select" value={selectedGroup} onChange={handleGroupChange}>
            <option value="">{t("locationPleaseSelect")}</option>
            {LOCATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {(selectedGroup === "quebec" || selectedGroup === "douglasciuss") && (
          <div className="form-group">
            <label htmlFor="cisss-select">{t("cisssciusss")}</label>
            <select
              id="cisss-select"
              value={user.cisssciusss}
              onChange={handleFieldChange("cisssciusss")}
            >
              <option value="">{t("selectCisss")}</option>
              {CISSS_CIUSSS_LIST.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label>{t("projectLocation")}</label>
          <div className="location-fields">
            <input
              type="text"
              placeholder={t("country")}
              value={user.projectCountry}
              onChange={handleFieldChange("projectCountry")}
            />
            <input
              type="text"
              placeholder={t("province")}
              value={user.projectProvince}
              onChange={handleFieldChange("projectProvince")}
            />
            <input
              type="text"
              placeholder={t("city")}
              value={user.projectCity}
              onChange={handleFieldChange("projectCity")}
            />
          </div>
        </div>

        <div className="form-group">
          <label>{t("typeOfProject")} <span className="helper-text">{t("selectAllThatApply")}</span></label>
          <div className="project-type-grid">
            {PROJECT_TYPE_OPTIONS.map((type) => (
              <label key={type} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={user.projectTypes.includes(type)}
                  onChange={() => handleProjectTypeToggle(type)}
                />
                {type}
              </label>
            ))}
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={user.projectTypes.includes("Other")}
                onChange={handleOtherToggle}
              />
              {t("other")}
            </label>
          </div>
          {user.projectTypes.includes("Other") && (
            <input
              type="text"
              placeholder={t("pleaseDescribe")}
              value={user.projectTypeOther}
              onChange={handleFieldChange("projectTypeOther")}
              className="other-input"
            />
          )}
        </div>

        <div className="form-group terms-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={user.agreedToTerms}
              onChange={handleTermsChange}
            />
            {t("agreeToTerms")}{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}>
              {t("termsAndConditions")}
            </a>
          </label>
        </div>

        <button
          className="begin-button"
          onClick={handleBegin}
          disabled={!isFormValid}
        >
          {t("begin")}
        </button>
      </div>

      {showTermsModal && <TermsModal onClose={() => setShowTermsModal(false)} title={t("termsTitle")} />}
    </div>
  );
}
