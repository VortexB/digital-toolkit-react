import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useState } from "react";
import TermsModal from "../components/TermsModal";
import "./HomePage.css";

const PROJECT_TYPE_OPTIONS = [
  "App", "Artificial intelligence", "Big data", "Cloud service",
  "Instant messaging", "Operating system", "Portal (electronic) medical records",
  "Smartphone", "Social media", "Software", "Telehealth",
  "Virtual reality", "Wearable", "Website",
];

  const LOCATION_OPTIONS = [
    { value: "general", label: "Canada except Quebec" },
    { value: "quebec", label: "Quebec" },
    { value: "douglasciuss", label: "Douglas Research Centre/CIUSSS-Ouest" },
    { value: "international", label: "Outside of Canada" },
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
  const [selectedGroup, setSelectedGroup] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const navigate = useNavigate();

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

      <h1 className="header">D3SM Digital Implementation Toolkit</h1>

      <div className="info-section">
        <h4>What is this about?</h4>
        <p>
          This D3SM toolkit aims to provide ideas, steps, and resources to support
          researchers, clinicians, health care managers, and project leads when
          planning, implementing, and evaluating digital mental health
          innovations. It also considers how to plan sustainability through
          implementation. We created this toolkit by adapting the{" "}
          <a href="https://www.phc.ox.ac.uk/research/groups-and-centres/interdisciplinary-research-in-health-sciences/enasss-cat" target="_blank" rel="noopener noreferrer">
            non-adoption, abandonment and challenges to scale-up, spread, sustainability (NASSS) framework, combined with a Complexity Assessment Tool (CAT)
          </a>
          , developed by Greenhalgh and her colleagues. The assessment will help users:
        </p>
        <ul>
          <li>
            Assess the readiness level of technology integration into health
            care settings according to the key domains (technology, value
            proposition, intended adopters, healthcare organizations, and
            external context)
          </li>
          <li>
            Identify barriers and facilitators related to technology integration
            in health care settings
          </li>
          <li>
            Access to resources and tools that can help overcome existing
            barriers and support integration of technology
          </li>
        </ul>
        <p>
          We recommend that users apply this tool in different phases of the
          implementation process (e.g., conceptualization, planning,
          implementation, evaluation, sustainability, commercialization) as
          barriers and facilitators can change over time as well as the policy
          context.
        </p>

        <h4>Who is this toolkit for?</h4>
        <ul>
          <li>
            Researchers and clinicians who develop and plan to implement
            digital mental health innovations
          </li>
          <li>
            Health care managers, program leads, and clinicians, who plan to
            adopt digital mental health innovations for implementation in their
            clinical settings
          </li>
        </ul>

        <h4>How do I use the D3SM toolkit?</h4>
        <p>
          By answering 23 questions in five domains, 1) technology, 2) value
          proposition, 3) intended adopters, 4) healthcare organizations, and 5)
          external context, you will be able to assess challenges and resources
          of each domain during your pathway for implementation and sustainment.
          Depending on your responses, you will receive a list of recommended
          actions and resources to address the identified challenges at the end
          of the assessment. By completing questions of all domains, you will
          also be able to identify which domains need more input and measures to
          respond to specific complexity. In addition, conducting assessment
          regularly (three to six months) can also help the project team monitor
          and evaluate the process of digital technology integration over time.
        </p>

        <h4>How was this D3SM Toolkit developed?</h4>
        <p>
          The Douglas Data and Digital Science for Mental Health (D3SM)
          Implementation team identified and adapted the NASSS (non-adoption,
          abandonment and challenges to scale-up, spread, sustainability)
          framework, combined with a Complexity Assessment Toolkit (CAT). The
          NASSS-CAT was originally developed by the Interdisciplinary Research
          in Health Sciences group led by Dr. Trisha Greenhalgh at the
          University of Oxford in 2021. Considering its specific focus on
          complexities and interdependent characteristics of health technology
          projects, we adapted the tool to the Canadian/Quebec health care
          context after selecting relevant questions and administering the
          modified questionnaire with selected D3SM research teams. We
          identified resource information through literature review, meetings
          and consultations with people working on development and
          implementation of digital mental health interventions in clinical
          settings.
        </p>
        <p className="reference">
          Reference:{" "}
          <a href="https://pubmed.ncbi.nlm.nih.gov/32401224/" target="_blank" rel="noopener noreferrer">
            Greenhalgh T, Maylor H, Shaw S, Wherton J, Papoutsi C,
            Betton V, Nelissen N, Gremyr A, Rushforth A, Koshkouei M, Taylor J.
            The NASSS-CAT Tools for Understanding, Guiding, Monitoring, and
            Researching Technology Implementation Projects in Health and Social
            Care: Protocol for an Evaluation Study in Real-World Settings. JMIR
            Res Protoc 2020;9(5):e16861
          </a>
        </p>
      </div>

      {/* --- Form Section --- */}
      <div className="form-section">
        <div className="form-group">
          <label htmlFor="project-title">Project Title</label>
          <input
            id="project-title"
            type="text"
            value={user.projectTitle}
            onChange={handleFieldChange("projectTitle")}
          />
        </div>

        <div className="form-group">
          <label htmlFor="location-select">
            Select your location
            <span className="helper-text">
              If multiple settings, please select one setting where you are planning to integrate the technology
            </span>
          </label>
          <select id="location-select" value={selectedGroup} onChange={handleGroupChange}>
            <option value="">Please select your location</option>
            {LOCATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {(selectedGroup === "quebec" || selectedGroup === "douglasciuss") && (
          <div className="form-group">
            <label htmlFor="cisss-select">CISSS/CIUSSS</label>
            <select
              id="cisss-select"
              value={user.cisssciusss}
              onChange={handleFieldChange("cisssciusss")}
            >
              <option value="">— Select CISSS/CIUSSS —</option>
              {CISSS_CIUSSS_LIST.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label>Project Location</label>
          <div className="location-fields">
            <input
              type="text"
              placeholder="Country"
              value={user.projectCountry}
              onChange={handleFieldChange("projectCountry")}
            />
            <input
              type="text"
              placeholder="Province/State"
              value={user.projectProvince}
              onChange={handleFieldChange("projectProvince")}
            />
            <input
              type="text"
              placeholder="City"
              value={user.projectCity}
              onChange={handleFieldChange("projectCity")}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Type of project <span className="helper-text">(Select all that apply)</span></label>
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
              Other
            </label>
          </div>
          {user.projectTypes.includes("Other") && (
            <input
              type="text"
              placeholder="Please describe"
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
            Agree to{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}>
              terms and conditions
            </a>
          </label>
        </div>

        <button
          className="begin-button"
          onClick={handleBegin}
          disabled={!isFormValid}
        >
          Begin
        </button>
      </div>

      {showTermsModal && <TermsModal onClose={() => setShowTermsModal(false)} />}
    </div>
  );
}
