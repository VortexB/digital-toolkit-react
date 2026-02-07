// Utility functions for export functionality
import { jsPDF } from 'jspdf';
import { loadQuestionFile, parseMarkdownContent } from './questionLoader';

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
      const content = await loadQuestionFile(group, `${subject}-q${id}`);

      if (content) {
        const parsed = parseMarkdownContent(content);
        // New logic: Yes/Do not know = needs actions, No/Not applicable = good job
        const needsActions = answerObj.answer === 'yes' || answerObj.answer === 'do_not_know';
        const isGoodJob = answerObj.answer === 'no' || answerObj.answer === 'not_applicable';

        collectedData.push({
          questionId,
          subject,
          questionNum: id,
          questionText: parsed.questionText,
          answer: answerObj.answer,
          needsActions,
          isGoodJob,
          actions: parsed.recommendedActions.replace(/^#+\s*/gm, '')
        });
      }
    } catch (error) {
      console.error(`Error loading content for ${questionId}:`, error);
    }
  }

  // Sort by subject and question number
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
    collectedData.forEach((item) => {
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
      const answerText = `Your answer: ${item.answer.replaceAll('_', ' ')}`;
      doc.text(answerText, 30, yPosition);
      yPosition += 8;

      if (item.isGoodJob) {
        doc.setFontSize(11);
        doc.setTextColor(0, 128, 0);
        doc.text('Good Job!', 30, yPosition);
        yPosition += 10;
        doc.setTextColor(0, 0, 0);
      } else if (item.needsActions && item.actions.trim()) {
        doc.setFontSize(10);
        doc.setTextColor(128, 0, 0);
        doc.text('Recommended Actions:', 30, yPosition);
        yPosition += 8;
        doc.setTextColor(0, 0, 0);

        const actionLines = doc.splitTextToSize(item.actions, 160);
        actionLines.forEach(line => {
          doc.text(line, 40, yPosition);
          yPosition += 5;
        });
        yPosition += 8;
      }

      yPosition += 5;
    });
  }

  return doc;
};

// Download PDF to user's machine
export const downloadPDF = (doc, filename = 'toolkit-recommendations.pdf') => {
  doc.save(filename);
};
