// Utility functions for export functionality
import { jsPDF } from 'jspdf';

// Helper function to check if content is actually markdown (not HTML)
const isMarkdownContent = (content) => {
  return content.trim() && !content.trim().startsWith('<!DOCTYPE html>');
};

// Extract question text and recommended actions from markdown content
export const parseMarkdownContent = (content) => {
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
      // Collect all content under Recommended Actions
      recommendedActions += line + '\n';
    }
  }

  return {
    questionText,
    recommendedActions: recommendedActions.trim()
  };
};

// Load and validate a markdown file
const loadFile = async (path) => {
  const response = await fetch(path);
  const content = await response.text();
  return isMarkdownContent(content) ? content : null;
};

// Collect all question data for answered questions
export const collectRecommendedActions = async (answers, group) => {
  const collectedData = [];

  for (const questionId in answers) {
    const answerObj = answers[questionId];

    // Parse questionId to get subject and id (format: "subject-q<number>")
    const match = questionId.match(/^(.+)-q(\d+)$/);
    if (!match) continue;

    const subject = match[1];
    const id = match[2];

    try {
      let content = null;

      // Try group-specific first
      const groupPath = `/data/questions/${group}/${subject}-q${id}.md`;
      content = await loadFile(groupPath);

      // If not found, try general
      if (!content && group !== 'general') {
        const generalPath = `/data/questions/general/${subject}-q${id}.md`;
        content = await loadFile(generalPath);
      }

      if (content) {
        const parsed = parseMarkdownContent(content);
        const isPositiveAnswer = answerObj.answer === 'yes';
        const isNegativeAnswer = answerObj.answer === 'no' || answerObj.answer === 'do_not_know';

        collectedData.push({
          questionId,
          subject,
          questionNum: id,
          questionText: parsed.questionText,
          answer: answerObj.answer,
          isPositive: isPositiveAnswer,
          isNegative: isNegativeAnswer,
          actions: parsed.recommendedActions.replace(/^#+\s*/gm, '') // Remove any remaining headers
        });
      }
    } catch (error) {
      console.error(`Error loading content for ${questionId}:`, error);
    }
  }

  // Sort by subject and question number for better organization
  return collectedData.sort((a, b) => {
    if (a.subject !== b.subject) {
      return a.subject.localeCompare(b.subject);
    }
    return parseInt(a.questionNum) - parseInt(b.questionNum);
  });
};

// Generate PDF document
export const generatePDF = (collectedData, user) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text('Digital Toolkit - Assessment Report', 20, 30);

  // Generated date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);

  // Project info
  doc.setFontSize(12);
  doc.text('Project Information:', 20, 60);
  doc.setFontSize(10);
  doc.text(`- Title: ${user.projectTitle || 'Not specified'}`, 30, 70);
  doc.text(`- Location: ${user.projectLocation || 'Not specified'}`, 30, 75);
  doc.text(`- Group: ${user.group || 'Not specified'}`, 30, 80);

  let yPosition = 95;

  // Assessment Results
  doc.setFontSize(14);
  doc.text('Assessment Results:', 20, yPosition);
  yPosition += 15;

  doc.setFontSize(10);

  if (collectedData.length === 0) {
    doc.text('No questions have been answered yet.', 20, yPosition);
  } else {
    collectedData.forEach((item, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }

      // Question header
      doc.setFontSize(12);
      doc.text(`${item.subject.toUpperCase()} - Question ${item.questionNum}`, 20, yPosition);
      yPosition += 10;

      // Question text
      doc.setFontSize(10);
      const questionLines = doc.splitTextToSize(item.questionText, 170);
      questionLines.forEach(line => {
        doc.text(line, 30, yPosition);
        yPosition += 5;
      });
      yPosition += 5;

      // Answer and feedback
      doc.setFontSize(11);
      const answerText = `Your answer: ${item.answer.replace('_', ' ')}`;
      doc.text(answerText, 30, yPosition);
      yPosition += 8;

      if (item.isPositive) {
        // Positive feedback
        doc.setFontSize(11);
        doc.setTextColor(0, 128, 0); // Green color
        doc.text('Good Job!', 30, yPosition);
        yPosition += 10;
        doc.setTextColor(0, 0, 0); // Reset to black
      } else if (item.isNegative && item.actions.trim()) {
        // Recommended actions
        doc.setFontSize(10);
        doc.setTextColor(128, 0, 0); // Red color for emphasis
        doc.text('Recommended Actions:', 30, yPosition);
        yPosition += 8;
        doc.setTextColor(0, 0, 0); // Reset to black

        const actionLines = doc.splitTextToSize(item.actions, 160);
        actionLines.forEach(line => {
          doc.text(line, 40, yPosition);
          yPosition += 5;
        });
        yPosition += 8;
      }

      yPosition += 5; // Extra space between questions
    });
  }

  return doc;
};

// Download PDF to user's machine
export const downloadPDF = (doc, filename = 'toolkit-recommendations.pdf') => {
  doc.save(filename);
};
