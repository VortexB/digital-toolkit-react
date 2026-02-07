import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useEffect, useState, useCallback, useRef } from "react";
import GlossaryModal from "../components/GlossaryModal";
import RecommendedActionsModal from "../components/RecommendedActionsModal";
import {
  loadMarkdownFile,
  parseMarkdownContent,
  combineMarkdownContent,
  questionFileExists,
  formatAnswerDisplay,
} from "../utils/questionLoader";
import { getDomainConfig } from "../utils/domainConfig";
import './QuestionPage.css';

export default function QuestionPage() {
  const { user, saveAnswer, getAnswer } = useUser();
  const { subject, id } = useParams();
  const navigate = useNavigate();

  const [uiState, setUiState] = useState('loading');
  const [parsedQuestion, setParsedQuestion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [nextQuestionExists, setNextQuestionExists] = useState(false);
  const [existingAnswer, setExistingAnswer] = useState(null);

  // Track which question was just answered to prevent re-load race condition
  const justAnsweredId = useRef(null);

  const questionId = `${subject.toLowerCase()}-q${id}`;
  const domainCfg = getDomainConfig(subject.toLowerCase());
  const domainName = domainCfg?.name || subject;
  const domainNumber = domainCfg?.number || '';
  const domainColor = domainCfg?.colorLight || '#e8f0fe';

  const checkNextQuestionExists = useCallback(async () => {
    const nextNum = parseInt(id) + 1;
    const nextQuestionId = `${subject.toLowerCase()}-q${nextNum}`;
    const exists = await questionFileExists(user.group, nextQuestionId);
    console.log(exists)
    setNextQuestionExists(exists);
  }, [id, subject, user.group]);

  // Load question content — runs on route change
  useEffect(() => {
    if (!user.group) {
      navigate("/");
      return;
    }

    // Only skip reload if THIS specific question was just answered
    if (justAnsweredId.current === questionId) {
      justAnsweredId.current = null;
      return;
    }
    justAnsweredId.current = null;

    let cancelled = false;

    const loadContent = async () => {
      setUiState('loading');
      setParsedQuestion(null);
      setNextQuestionExists(false);

      try {
        let combinedContent = '';

        const generalPath = `/data/questions/general/${subject.toLowerCase()}-q${id}.md`;
        const generalContent = await loadMarkdownFile(generalPath);

        if (generalContent) {
          combinedContent = generalContent;
        }

        if (user.group !== 'general') {
          const groupPath = `/data/questions/${user.group}/${subject.toLowerCase()}-q${id}.md`;
          const groupContent = await loadMarkdownFile(groupPath);

          if (groupContent) {
            combinedContent = combinedContent
              ? combineMarkdownContent(combinedContent, groupContent)
              : groupContent;
          }
        }

        if (!combinedContent) throw new Error('Question not found');
        if (cancelled) return;

        const parsed = parseMarkdownContent(combinedContent);
        setParsedQuestion(parsed);

        // Check for existing answer
        const existing = getAnswer(questionId);
        setExistingAnswer(existing);

        // Pre-check next question
        const nextNum = parseInt(id) + 1;
        const nextQId = `${subject.toLowerCase()}-q${nextNum}`;
        const nextExists = await questionFileExists(user.group, nextQId);
        if (!cancelled) setNextQuestionExists(nextExists);

        if (existing) {
          setUiState('question-answered');
        } else {
          setUiState('question');
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading question:', error);
          setUiState('error');
        }
      }
    };

    loadContent();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, id, user.group]);

  // Yes / Do not know → show recommended actions
  // No / Not applicable → go to navigation screen
  const handleAnswerSelect = async (answer) => {
    justAnsweredId.current = questionId;
    saveAnswer(questionId, answer);
    setExistingAnswer({ answer });

    // Pre-check next question
    await checkNextQuestionExists();

    if (answer === 'yes' || answer === 'do_not_know') {
      setShowModal(true);
      setUiState('modal');
    } else {
      setUiState('navigation');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setUiState('navigation');
  };

  const handleBackToNavigation = () => {
    navigate('/navigation');
  };

  const handleNextQuestion = async () => {
    await checkNextQuestionExists();
    if(nextQuestionExists){
      const nextNum = parseInt(id) + 1;
      navigate(`/question/${subject}/${nextNum}`);
      return;
    }
    handleBackToNavigation();
  };

  const handleAnswerAgain = () => {
    setUiState('question');
  };

  if (uiState === 'loading') {
    return (
      <div className="question-page">
        <div className="loading">Loading question...</div>
      </div>
    );
  }

  if (uiState === 'error') {
    return (
      <div className="question-page">
        <div className="error">
          <h2>Question Not Found</h2>
          <p>The requested question could not be loaded.</p>
          <button className="btn-primary" onClick={handleBackToNavigation}>Back to Navigation page</button>
        </div>
      </div>
    );
  }

  return (
    <div className="question-page" style={{ backgroundColor: domainColor }}>
      <div className="question-top-bar">
        <button className="glossary-btn" onClick={() => setShowGlossary(true)}>
          Glossary
        </button>
      </div>

      <div className="question-header">
        <div className="domain-accent" style={{ backgroundColor: domainCfg?.color || '#007bff' }} />
        <h1>Domain {domainNumber}: {domainName}</h1>
      </div>

      {uiState === 'question' && parsedQuestion && (
        <div className="question-content">
          <div className="question-text">
            <h2><span className="question-num">Q{id}.</span> {parsedQuestion.questionText}</h2>
          </div>

          <div className="answer-buttons">
            <button className="answer-btn" onClick={() => handleAnswerSelect('yes')}>Yes</button>
            <button className="answer-btn" onClick={() => handleAnswerSelect('not_applicable')}>Not applicable</button>
            <button className="answer-btn" onClick={() => handleAnswerSelect('do_not_know')}>Do not know</button>
            <button className="answer-btn" onClick={() => handleAnswerSelect('no')}>No</button>
          </div>
        </div>
      )}

      {uiState === 'question-answered' && parsedQuestion && (
        <div className="question-content">
          <div className="question-text">
            <h2><span className="question-num">Q{id}.</span> {parsedQuestion.questionText}</h2>
            <p>You answered: <strong>{formatAnswerDisplay(existingAnswer?.answer || '')}</strong></p>
          </div>

          <div className="nav-buttons">
            <button className="nav-btn secondary" onClick={handleAnswerAgain}>Answer Again</button>
            {nextQuestionExists && (
              <button className="nav-btn primary" onClick={handleNextQuestion}>
                Next Question
              </button>
            )}
          </div>
        </div>
      )}

      {uiState === 'navigation' && (
        <div className="navigation-options">
          <h3>Question Answered</h3>
          <p>Your answer has been saved.</p>
          <div className="nav-buttons">
            <button className="nav-btn secondary" onClick={handleBackToNavigation}>
              Back to Navigation page
            </button>
            {nextQuestionExists && (
              <button className="nav-btn primary" onClick={handleNextQuestion}>
                Next Question
              </button>
            )}
          </div>
        </div>
      )}

      <RecommendedActionsModal
        isOpen={showModal}
        onClose={handleModalClose}
        title="Recommended Actions"
        content={parsedQuestion?.recommendedActions || ''}
      />
      {showGlossary && <GlossaryModal onClose={() => setShowGlossary(false)} />}
    </div>
  );
}
