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
const BASE_URL = import.meta.env.BASE_URL;

export const loadQuestionFile = async (lang, group, questionId) => {
  const base = lang === 'fr' ? 'data/questions/fr' : 'data/questions';

  const groupContent = await loadMarkdownFile(`${BASE_URL}${base}/${group}/${questionId}.md`);
  if (groupContent) return groupContent;

  if (group !== 'general') {
    const generalContent = await loadMarkdownFile(`${BASE_URL}${base}/general/${questionId}.md`);
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
 * Handles both English ("## Recommended Actions") and French ("## Actions Recommandées") headers.
 * Comparison is case-insensitive to account for inconsistent casing in source files.
 */
export const parseMarkdownContent = (content) => {
  const lines = content.split('\n');
  let questionText = '';
  let recommendedActions = '';
  let inRecommendedActions = false;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.startsWith('# ') && !questionText) {
      questionText = line.substring(2).trim();
    } else if (
      lower.startsWith('## recommended actions') ||
      lower.startsWith('## actions recommandées')
    ) {
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
 * Results are cached at the module level so subsequent calls are synchronous.
 */
let cachedManifest = null;

export const getCachedManifest = async () => {
  if (cachedManifest) return cachedManifest;
  cachedManifest = await loadManifest();
  return cachedManifest;
};

export const loadManifest = async () => {
  try {
    const response = await fetch(`${BASE_URL}data/questions/manifest.json`);
    if (!response.ok) throw new Error('Failed to load manifest');
    const data = await response.json();
    cachedManifest = data;
    return data;
  } catch (error) {
    console.error('Error loading question manifest:', error);
    return null;
  }
};

/**
 * Combine general and group-specific markdown content,
 * merging their recommended actions sections.
 * Handles both English ("## Recommended Actions") and French ("## Actions Recommandées") headers.
 */
const isRecommendedActions = (line) => {
  const lower = line.toLowerCase();
  return (
    lower.startsWith('## recommended actions') ||
    lower.startsWith('## actions recommandées')
  );
};

export const combineMarkdownContent = (generalContent, groupContent) => {
  const generalLines = generalContent.split('\n');
  const groupLines = groupContent.split('\n');

  let combinedLines = [];
  let inRecommendedActions = false;
  let generalActionsEndIndex = -1;

  // Find where general recommended actions end
  for (let i = 0; i < generalLines.length; i++) {
    combinedLines.push(generalLines[i]);

    if (isRecommendedActions(generalLines[i])) {
      inRecommendedActions = true;
    } else if (inRecommendedActions && generalLines[i].startsWith('## ')) {
      generalActionsEndIndex = i - 1;
      break;
    }
  }

  if (inRecommendedActions && generalActionsEndIndex === -1) {
    generalActionsEndIndex = generalLines.length - 1;
  }

  if (generalActionsEndIndex >= 0) {
    let groupActionsStart = -1;
    for (let i = 0; i < groupLines.length; i++) {
      if (isRecommendedActions(groupLines[i])) {
        groupActionsStart = i + 1;
        break;
      }
    }

    if (groupActionsStart >= 0) {
      const beforeNextSection = combinedLines.slice(0, generalActionsEndIndex + 1);
      const afterNextSection = combinedLines.slice(generalActionsEndIndex + 1);

      let groupActionsEnd = groupActionsStart;
      for (let i = groupActionsStart; i < groupLines.length; i++) {
        if (groupLines[i].startsWith('## ') && !isRecommendedActions(groupLines[i])) {
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
