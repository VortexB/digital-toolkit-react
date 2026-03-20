import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import { useState, useEffect, useCallback } from "react";
import GlossaryModal from "../components/GlossaryModal";
import FindResourcesModal from "../components/FindResourcesModal";
import ExportModal from "../components/ExportModal";
import DomainWheel from "../components/DomainWheel";
import { DOMAIN_CONFIG } from "../utils/domainConfig";
import {
  collectRecommendedActions,
  generatePDF,
} from "../utils/exportUtils";
import { loadManifest } from "../utils/questionLoader";
import "./NavigationPage.css";

export default function NavigationPage() {
  const { user, answers } = useUser();
  const { t } = useLanguage();
  const [showGlossary, setShowGlossary] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [domainList, setDomainList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [hoveredDomain, setHoveredDomain] = useState(null);
  const navigate = useNavigate();

  const loadAvailableQuestions = useCallback(async () => {
    try {
      setLoading(true);

      const manifest = await loadManifest();
      if (!manifest) {
        console.error("Failed to load question manifest");
        setLoading(false);
        return;
      }

      const domainsWithQuestions = manifest.domains.map((domain) => ({
        key: domain.key,
        name: domain.name,
        desc: domain.description,
        questions: Array.from({ length: domain.questionCount }, (_, i) => i + 1),
      }));

      setDomainList(domainsWithQuestions);
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user.group) {
      navigate("/");
      return;
    }

    loadAvailableQuestions();

    // Show instructions popup on first visit
    const seen = sessionStorage.getItem('nav-instructions-seen');
    if (!seen) {
      setShowInstructions(true);
      sessionStorage.setItem('nav-instructions-seen', 'true');
    }
  }, [user.group, navigate, loadAvailableQuestions]);

  // Lazy PDF generation — called by ExportModal when user commits to save/send
  const handleGeneratePDF = async () => {
    const collectedActions = await collectRecommendedActions(answers, user.group);
    return generatePDF(collectedActions, user);
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>{t("loadingQuestions")}</h2>
      </div>
    );
  }

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="nav-page">
      <h1>{t("d3smTitle")}</h1>
      {showInstructions && (
        <div className="modal-overlay" onClick={() => setShowInstructions(false)}>
          <div className="modal-panel instructions-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t("instructions")}</h2>
              <button className="modal-close" onClick={() => setShowInstructions(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>{t("instructionsBody1")}</p>
              <p>{t("instructionsBody2")}</p>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowInstructions(false)}>
                {t("getStarted")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="wheel-and-info">
        <DomainWheel domains={domainList} onHoveredDomainChange={setHoveredDomain} />

        <div className="info-section">
          <div className="info-buttons">
            <button
              className="info-btn glossary-btn"
              onClick={() => setShowGlossary(true)}
            >
              {t("glossary")}
            </button>
            <button
              className="info-btn resources-btn"
              onClick={() => setShowResources(true)}
            >
              {t("findResources")}
            </button>
            <button
              className="info-btn back-btn"
              onClick={handleBackToHome}
            >
              {t("backToLanding")}
            </button>
            <button
              className="info-btn export-btn"
              onClick={() => setShowExportModal(true)}
            >
              {t("exportResults")}
            </button>
          </div>

          <div className="domain-info-panel">
            <div className="domain-info-content" key={hoveredDomain || 'intro'}>
              {hoveredDomain && DOMAIN_CONFIG[hoveredDomain] ? (
                <>
                  <h3 style={{ color: DOMAIN_CONFIG[hoveredDomain].color }}>
                    Domain {DOMAIN_CONFIG[hoveredDomain].number}: {DOMAIN_CONFIG[hoveredDomain].name}
                  </h3>
                  <p>{DOMAIN_CONFIG[hoveredDomain].description}</p>
                </>
              ) : (
                <>
                  <p>{t("pleaseSelectDomain")}</p>
                  <p>{t("identifyAreas")}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showGlossary && <GlossaryModal onClose={() => setShowGlossary(false)} />}
      {showResources && <FindResourcesModal onClose={() => setShowResources(false)} />}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onGeneratePDF={handleGeneratePDF}
      />
    </div>
  );
}
