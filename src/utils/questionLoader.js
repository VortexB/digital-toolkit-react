// Shared utilities for loading and parsing question markdown files

/**
 * Check if content is actually markdown (not an HTML error page)
 */
export const isMarkdownContent = (content) => {
  return content.trim() && !content.trim().startsWith('<!DOCTYPE html>');
};

/**
 * Load and validate a markdown file from a given path.
 * Returns the content string if valid markdown, or null otherwise.
 */
export const loadMarkdownFile = async (path) => {
  try {
    const response = await fetch(path);
    if (!response.ok) return null;
    const content = await response.text();
    return isMarkdownContent(content) ? content : null;
  } catch {
    return null;
  }
};

/**
 * Load a question file, trying the language/group-specific version first,
 * then falling back to general within the same language.
 */
export const loadQuestionFile = async (lang, group, questionId) => {
  const base = lang === 'fr' ? '/data/questions/fr' : '/data/questions';

  const groupContent = await loadMarkdownFile(`${base}/${group}/${questionId}.md`);
  if (groupContent) return groupContent;

  if (group !== 'general') {
    const generalContent = await loadMarkdownFile(`${base}/general/${questionId}.md`);
    if (generalContent) return generalContent;
  }

  return null;
};

/**
 * Check if a question file exists for a given language and group.
 */
export const questionFileExists = async (lang, group, questionId) => {
  const content = await loadQuestionFile(lang, group, questionId);
  return content !== null;
};

/**
 * Parse markdown content to extract question text and recommended actions.
 */
export const parseMarkdownContent = (content) => {
  const lines = content.split('\n');
  let questionText = '';
  let recommendedActions = '';
  let inRecommendedActions = false;

  for (const line of lines) {
    if (line.startsWith('# ') && !questionText) {
      questionText = line.substring(2).trim();
    } else if (line.startsWith('## Recommended Actions')) {
      inRecommendedActions = true;
      continue;
    } else if (inRecommendedActions) {
      if (line.startsWith('## ')) {
        break;
      }
      recommendedActions += line + '\n';
    }
  }

  return {
    questionText,
    recommendedActions: recommendedActions.trim()
  };
};

/**
 * Load the question manifest (domain/question counts).
 */
export const loadManifest = async () => {
  try {
    const response = await fetch('/data/questions/manifest.json');
    if (!response.ok) throw new Error('Failed to load manifest');
    return await response.json();
  } catch (error) {
    console.error('Error loading question manifest:', error);
    return null;
  }
};

/**
 * Combine general and group-specific markdown content,
 * merging their recommended actions sections.
 */
export const combineMarkdownContent = (generalContent, groupContent) => {
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
      generalActionsEndIndex = i - 1;
      break;
    }
  }

  // If recommended actions was the last section (no subsequent ## section found),
  // set the end index to the last line of the file
  if (inRecommendedActions && generalActionsEndIndex === -1) {
    generalActionsEndIndex = generalLines.length - 1;
  }

  // If we found recommended actions in general content, append group-specific actions
  if (generalActionsEndIndex >= 0) {
    let groupActionsStart = -1;
    for (let i = 0; i < groupLines.length; i++) {
      if (groupLines[i].startsWith('## Recommended Actions')) {
        groupActionsStart = i + 1;
        break;
      }
    }

    if (groupActionsStart >= 0) {
      const beforeNextSection = combinedLines.slice(0, generalActionsEndIndex + 1);
      const afterNextSection = combinedLines.slice(generalActionsEndIndex + 1);

      let groupActionsEnd = groupActionsStart;
      for (let i = groupActionsStart; i < groupLines.length; i++) {
        if (groupLines[i].startsWith('## ') && groupLines[i] !== '## Recommended Actions') {
          break;
        }
        groupActionsEnd = i;
      }

      const groupActions = groupLines.slice(groupActionsStart, groupActionsEnd + 1);

      combinedLines = [
        ...beforeNextSection,
        ...groupActions.filter(line => line.trim()),
        ...afterNextSection
      ];
    }
  }

  return combinedLines.join('\n');
};

/**
 * Format an answer value for display (e.g., "do_not_know" → "do not know")
 */
export const formatAnswerDisplay = (answer) => {
  return answer.replaceAll('_', ' ');
};

/**
 * Format an answer value for CSS class (e.g., "do_not_know" → "do-not-know")
 */
export const formatAnswerClass = (answer) => {
  return answer.replaceAll('_', '-');
};
