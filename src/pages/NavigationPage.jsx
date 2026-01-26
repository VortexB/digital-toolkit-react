import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useState, useEffect } from "react";
import GlossaryModal from "../components/GlossaryModal";
import ExportModal from "../components/ExportModal";
import {
  collectRecommendedActions,
  generatePDF,
  downloadPDF,
} from "../utils/exportUtils";
import "./NavigationPage.css";

// Cache for question data to avoid repeated fetches
const questionDataCache = new Map();

export default function NavigationPage() {
  const { user, getAnswer, answers } = useUser();
  const [showGlossary, setShowGlossary] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [domainList, setDomainList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.group) {
      navigate("/");
      return;
    }

    loadAvailableQuestions();
  }, [user.group]);

  const loadAvailableQuestions = async () => {
    try {
      setLoading(true);

      // Check cache first - temporarily disabled for debugging
      // const cacheKey = `questions-${group}-v3`;
      // if (questionDataCache.has(cacheKey)) {
      //   setDomainList(questionDataCache.get(cacheKey));
      //   setLoading(false);
      //   return;
      // }

      // Domain mapping for display names
      const domainDisplayNames = {
        technology: "Domain 1: Technology",
        value: "Domain 2: Value proposition",
        adopters: "Domain 3: Intended adopters",
        organizations: "Domain 4: Organizations",
        external: "Domain 5: External context",
      };
      const domainDescriptions = {
        technology:
          "This domain looks at the multiple complexities around technology, such as functionality of the technology itself, and the required knowledge and infrastructure to use it.",
        value:
          "This domain concerns for whom a new technology generates values, including value to the patient, the developer, and the health system.",
        adopters:
          "This domain looks at the complexity of the adopter system, i.e., clinicians, staff, patients and carers who are expected to use the technology but who may refuse to use it or find that they are unable to use it.",
        organizations:
          "This domain focuses on the organization’s capacity to innovate, readiness for a new innovation, funding decisions, potential disruption to existing routines, and the extent of additional work to implement changes.",
        external:
          "This domain concerns the wider system, how external social, political, technological, and economic context may affect the uptake of innovations.",
      };

      // Available domains based on our markdown files
      const availableDomains = [
        "technology",
        "value",
        "adopters",
        "organizations",
        "external",
      ];

      const domainsWithQuestions = [];

      for (const domain of availableDomains) {
        // Check if this domain has any questions for the current group
        const questionNumbers = [];

        // Check up to a reasonable number of questions (1-10)
        for (let i = 1; i <= 10; i++) {
          const questionId = `${domain}-q${i}`;

          // Check if the question file exists for this group or general
          let fileExists = false;

          try {
            // Try group-specific first
            let response = await fetch(
              `/data/questions/${user.group}/${questionId}.md`,
            );
            let content = await response.text();

            console.log(`Checking ${user.group}/${questionId}.md:`, {
              ok: response.ok,
              startsWithHTML: content.startsWith("<!DOCTYPE html>"),
              startsWithMarkdown: content.startsWith("# "),
              contentLength: content.length,
            });

            if (response.ok && content.startsWith("# ")) {
              fileExists = true;
              console.log(`✓ Found ${user.group}/${questionId}.md`);
            }

            // If not found in group, try general
            if (!fileExists && user.group !== "general") {
              response = await fetch(
                `/data/questions/general/${questionId}.md`,
              );
              content = await response.text();

              console.log(`Checking general/${questionId}.md:`, {
                ok: response.ok,
                startsWithHTML: content.startsWith("<!DOCTYPE html>"),
                startsWithMarkdown: content.startsWith("# "),
                contentLength: content.length,
              });

              if (response.ok && content.startsWith("# ")) {
                fileExists = true;
                console.log(`✓ Found general/${questionId}.md`);
              }
            }
          } catch (error) {
            console.log(`Error checking ${questionId}:`, error);
          }

          if (fileExists) {
            questionNumbers.push(i);
            console.log(`Added question ${i} to ${domain}`);
          } else {
            console.log(`✗ Question ${i} not found for ${domain}`);
          }
        }

        console.log(`Domain ${domain} has questions:`, questionNumbers);

        if (questionNumbers.length > 0) {
          domainsWithQuestions.push({
            key: domain,
            name: domainDisplayNames[domain] || domain,
            desc: domainDescriptions[domain],
            questions: questionNumbers,
          });
        }
      }

      // Cache the results (temporarily disabled for debugging)
      // questionDataCache.set(`questions-${group}-debug`, domainsWithQuestions);
      setDomainList(domainsWithQuestions);
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);

      // Collect all recommended actions from questions answered "no"
      const collectedActions = await collectRecommendedActions(
        answers,
        user.group,
      );

      // Generate PDF
      const doc = generatePDF(collectedActions, user);

      // Download PDF to user's machine
      downloadPDF(doc);

      // Show export modal for email
      setShowExportModal(true);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleSendEmail = (email) => {
    // TODO: Implement EmailJS sending here
    alert(`Email sending will be implemented with EmailJS. Email: ${email}`);
    setShowExportModal(false);
  };

  const closeExportModal = () => {
    setShowExportModal(false);
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading questions...</h2>
      </div>
    );
  }

  return (
    <div className="nav-page">
      <h1>Navigation</h1>
      <div className="header-buttons">
        <button
          className="glossary-button"
          onClick={() => setShowGlossary(true)}
        >
          Open Glossary
        </button>
        <button
          className="export-button"
          onClick={handleExport}
          disabled={exportLoading}
        >
          {exportLoading ? "Exporting..." : "Export"}
        </button>
      </div>

      <div className="domain-list">
        {domainList.map((domain) => (
          <button
            className="start-domain-button"
            onClick={() => navigate(`/question/${domain.key}/1`)}
          >
            
            <div>
            {domain.name.split(":")[1]?.trim() || domain.name}
            <p>{domain.desc}</p>
            </div>

            <div className="question-buttons">
              {domain.questions.map((questionNum) => {
                const questionId = `${domain.key}-q${questionNum}`;
                const answer = getAnswer(questionId);

                const answerClass = answer ? answer.answer.replace('_', '-') : 'unanswered';

                return (
                  <button
                    key={questionNum}
                    className={`question-button ${answerClass}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/question/${domain.key}/${questionNum}`);
                    }}
                    title={answer ? `Answered: ${answer.answer.replace('_', ' ')}` : "Not answered"}
                  >
                    Q{questionNum}
                  </button>
                );
              })}
            </div>
          </button>
        ))}
      </div>

      {showGlossary && <GlossaryModal onClose={() => setShowGlossary(false)} />}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={closeExportModal}
          onSendEmail={handleSendEmail}
        />
      )}
    </div>
  );
}
