import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';
import RecommendedActionsModal from "../components/RecommendedActionsModal";
import './QuestionPage.css';

export default function QuestionPage() {
  const { user, saveAnswer, getAnswer } = useUser();
  const { subject, id } = useParams();
  const navigate = useNavigate();

  // UI States: 'loading' | 'question' | 'question-answered' | 'modal' | 'navigation'
  const [uiState, setUiState] = useState('loading');
  const [markdownContent, setMarkdownContent] = useState("");
  const [parsedQuestion, setParsedQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [nextQuestionExists, setNextQuestionExists] = useState(false);
  const [existingAnswer, setExistingAnswer] = useState(null);

  const questionId = `${subject.toLowerCase()}-q${id}`;

  useEffect(() => {
    if (!user.group) {
      navigate("/");
      return;
    }

    // Check if question was already answered
    const existingAnswer = getAnswer(questionId);
    setExistingAnswer(existingAnswer);

    if (existingAnswer) {
      setSelectedAnswer(existingAnswer.answer);
      loadQuestionContent(); // Load content even for answered questions
      checkNextQuestionExists();
      setUiState('question-answered');
    } else {
      setSelectedAnswer(null);
      // Load question content
      loadQuestionContent();
    }
  }, [user.group, subject, id]);

  const loadQuestionContent = async () => {
    try {
      setUiState('loading');

      let combinedContent = '';

      // Helper function to check if content is actually markdown (not HTML)
      const isMarkdownContent = (content) => {
        return content.trim() && !content.trim().startsWith('<!DOCTYPE html>');
      };

      // Helper function to load and validate a file
      const loadFile = async (path) => {
        const response = await fetch(path);
        const content = await response.text();
        return isMarkdownContent(content) ? content : null;
      };

      // Always try to load general content first
      const generalPath = `/data/questions/general/${subject.toLowerCase()}-q${id}.md`;
      const generalContent = await loadFile(generalPath);

      if (generalContent) {
        combinedContent = generalContent;
      }

      // Try to load group-specific content and combine it
      if (user.group !== 'general') {
        const groupPath = `/data/questions/${user.group}/${subject.toLowerCase()}-q${id}.md`;
        const groupContent = await loadFile(groupPath);

        if (groupContent) {
          // If we have both general and group content, combine them
          if (combinedContent) {
            combinedContent = combineMarkdownContent(combinedContent, groupContent);
          } else {
            // If no general content but group content exists, use group content
            combinedContent = groupContent;
          }
        }
      }

      if (!combinedContent) {
        throw new Error('Question not found');
      }

      setMarkdownContent(combinedContent);

      // Parse the combined markdown content
      const parsed = parseMarkdownContent(combinedContent);
      setParsedQuestion(parsed);

      setUiState('question');
    } catch (error) {
      console.error('Error loading question:', error);
      setUiState('error');
    }
  };

  // Helper function to combine general and group-specific markdown
  const combineMarkdownContent = (generalContent, groupContent) => {
    const generalLines = generalContent.split('\n');
    const groupLines = groupContent.split('\n');

    let combinedLines = [];
    let inRecommendedActions = false;
    let generalActionsEndIndex = -1;

    // Find where general recommended actions end
    for (let i = 0; i < generalLines.length; i++) {
      combinedLines.push(generalLines[i]);

      if (generalLines[i].startsWith('## Recommended Actions')) {
        inRecommendedActions = true;
      } else if (inRecommendedActions && generalLines[i].startsWith('## ')) {
        // We've hit the next section, so general actions ended at previous line
        generalActionsEndIndex = i - 1;
        break;
      }
    }

    // If we found recommended actions in general content, append group-specific actions
    if (generalActionsEndIndex >= 0) {
      // Find group-specific recommended actions and append them
      let groupActionsStart = -1;
      for (let i = 0; i < groupLines.length; i++) {
        if (groupLines[i].startsWith('## Recommended Actions')) {
          groupActionsStart = i + 1; // Skip the header
          break;
        }
      }

      if (groupActionsStart >= 0) {
        // Insert group actions before the next section in general content
        const beforeNextSection = combinedLines.slice(0, generalActionsEndIndex + 1);
        const afterNextSection = combinedLines.slice(generalActionsEndIndex + 1);

        // Find the group actions content (until next header)
        let groupActionsEnd = groupActionsStart;
        for (let i = groupActionsStart; i < groupLines.length; i++) {
          if (groupLines[i].startsWith('## ') && groupLines[i] !== '## Recommended Actions') {
            break;
          }
          groupActionsEnd = i;
        }

        const groupActions = groupLines.slice(groupActionsStart, groupActionsEnd + 1);

        // Combine: general actions + group actions + rest
        combinedLines = [
          ...beforeNextSection,
          ...groupActions.filter(line => line.trim()), // Filter out empty lines
          ...afterNextSection
        ];
      }
    }

    return combinedLines.join('\n');
  };

  const parseMarkdownContent = (content) => {
    const lines = content.split('\n');
    let questionText = '';
    let recommendedActions = '';

    let inRecommendedActions = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('# ')) {
        // Extract question from H1
        questionText = line.substring(2).trim();
      } else if (line.startsWith('## Recommended Actions')) {
        inRecommendedActions = true;
        // Skip the header line itself
        continue;
      } else if (inRecommendedActions) {
        // Stop if we hit another H2 header
        if (line.startsWith('## ') && line !== '## Recommended Actions') {
          break;
        }
        // Collect all content under Recommended Actions, including empty lines for formatting
        recommendedActions += line + '\n';
      }
    }

    return {
      questionText,
      recommendedActions: recommendedActions.trim()
    };
  };

  const checkNextQuestionExists = async () => {
    const currentNum = parseInt(id);
    const nextNum = currentNum + 1;
    const nextQuestionId = `${subject.toLowerCase()}-q${nextNum}`;

    // Check if next question exists (similar logic to NavigationPage)
    let fileExists = false;

    try {
      // Try group-specific first
      let response = await fetch(`/data/questions/${user.group}/${nextQuestionId}.md`);
      if (response.ok) {
        const content = await response.text();
        if (content.startsWith('# ')) {
          fileExists = true;
        }
      }

      // If not found in group, try general
      if (!fileExists && user.group !== 'general') {
        response = await fetch(`/data/questions/general/${nextQuestionId}.md`);
        if (response.ok) {
          const content = await response.text();
          if (content.startsWith('# ')) {
            fileExists = true;
          }
        }
      }
    } catch (error) {
      // File doesn't exist
    }

    setNextQuestionExists(fileExists);
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);

    // Save the answer
    saveAnswer(questionId, answer);

    // Show modal for No or Do not know answers
    if (answer === 'no' || answer === 'do_not_know') {
      setShowModal(true);
      setUiState('modal');
    } else {
      checkNextQuestionExists();
      setUiState('navigation');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    checkNextQuestionExists();
    setUiState('navigation');
  };

  const handleBackToNavigation = () => {
    navigate('/navigation');
  };

  const handleNextQuestion = () => {
    // Calculate next question
    const currentNum = parseInt(id);
    const nextNum = currentNum + 1;

    navigate(`/question/${subject}/${nextNum}`);
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
          <button onClick={handleBackToNavigation}>Back to Navigation</button>
        </div>
      </div>
    );
  }

  return (
    <div className="question-page">
      <div className="question-header">
        <h1>{subject} - Question {id}</h1>
      </div>

      {uiState === 'question' && parsedQuestion && (
        <div className="question-content">
          <div className="question-text">
            <h2>{parsedQuestion.questionText}</h2>
          </div>

          <div className="answer-buttons">
            <button
              className="answer-btn yes"
              onClick={() => handleAnswerSelect('yes')}
            >
              Yes
            </button>
            <button
              className="answer-btn not-applicable"
              onClick={() => handleAnswerSelect('not_applicable')}
            >
              Not applicable
            </button>
            <button
              className="answer-btn do-not-know"
              onClick={() => handleAnswerSelect('do_not_know')}
            >
              Do not know
            </button>
            <button
              className="answer-btn no"
              onClick={() => handleAnswerSelect('no')}
            >
              No
            </button>
          </div>
        </div>
      )}

      {uiState === 'question-answered' && parsedQuestion && (
        <div className="question-content">
          <div className="question-text">
            <h2>{parsedQuestion.questionText}</h2>
            <p>You answered: <strong>{existingAnswer?.answer.replace('_', ' ')}</strong></p>
          </div>

          <div className="answer-buttons">
            <button
              className="answer-btn answer-again"
              onClick={handleAnswerAgain}
            >
              Answer Again
            </button>
          </div>
        </div>
      )}

      {uiState === 'navigation' && (
        <div className="navigation-options">
          <h3>Question Answered</h3>
          <p>Your answer has been saved.</p>
          <div className="nav-buttons">
            <button
              className="nav-btn secondary"
              onClick={handleBackToNavigation}
            >
              Back 
            </button>
            {nextQuestionExists && (
              <button
                className="nav-btn primary"
                onClick={handleNextQuestion}
              >
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
    </div>
  );
}
