// Utility functions for export functionality
import { jsPDF } from "jspdf";
import {
  loadMarkdownFile,
  parseMarkdownContent,
  combineMarkdownContent,
} from "./questionLoader";
import { DOMAIN_ORDER, DOMAIN_CONFIG } from "./domainConfig";

// Font URLs for embedding in PDF
const FONT_URLS = {
  montserratRegular: "/fonts/Montserrat/static/Montserrat-Regular.ttf",
  montserratBold: "/fonts/Montserrat/static/Montserrat-Bold.ttf",
  montserratSemiBold: "/fonts/Montserrat/static/Montserrat-SemiBold.ttf",
  latoRegular: "/fonts/Lato/Lato-Regular.ttf",
  latoBold: "/fonts/Lato/Lato-Bold.ttf",
};

// Load font as base64
const loadFont = async (url) => {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return base64;
  } catch (error) {
    console.error(`Error loading font ${url}:`, error);
    return null;
  }
};

// Image URLs for embedding in PDF
const IMAGE_URLS = {
  d3sm: "/imgs/d3sm.png",
  douglas: "/imgs/douglas-logo.png",
  hbhl: "/imgs/hbhl.png",
  ludicmind: "/imgs/ludicmind.png",
};

// Load image as base64
const loadImage = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Error loading image ${url}:`, error);
    return null;
  }
};

// Initialize fonts in jsPDF
const initializeFonts = async (doc) => {
  const loadedFonts = {};

  // Load fonts into VFS and track which ones succeeded
  for (const [key, url] of Object.entries(FONT_URLS)) {
    try {
      const fontData = await loadFont(url);
      if (fontData) {
        doc.addFileToVFS(`${key}.ttf`, fontData);
        loadedFonts[key] = true;
      }
    } catch (error) {
      console.warn(`Failed to load font ${key}:`, error);
    }
  }

  // Only register fonts that were successfully loaded to VFS
  if (loadedFonts.montserratRegular) {
    doc.addFont("montserratRegular.ttf", "Montserrat", "normal");
  }
  if (loadedFonts.montserratBold) {
    doc.addFont("montserratBold.ttf", "Montserrat", "bold");
  }
  if (loadedFonts.montserratSemiBold) {
    doc.addFont("montserratSemiBold.ttf", "Montserrat", "semibold");
  }
  if (loadedFonts.latoRegular) {
    doc.addFont("latoRegular.ttf", "Lato", "normal");
  }
  if (loadedFonts.latoBold) {
    doc.addFont("latoBold.ttf", "Lato", "bold");
  }

  // Return which fonts are available
  return {
    hasMontserrat: loadedFonts.montserratRegular && loadedFonts.montserratBold,
    hasLato: loadedFonts.latoRegular && loadedFonts.latoBold,
  };
};

// Get font names with fallback to Helvetica
const getFont = (fontAvailability, preferredFonts) => {
  if (
    preferredFonts.includes("Montserrat") &&
    fontAvailability.hasMontserrat
  ) {
    return "Montserrat";
  }
  if (preferredFonts.includes("Lato") && fontAvailability.hasLato) {
    return "Lato";
  }
  return "helvetica";
};

// Collect all question data for answered questions
export const collectRecommendedActions = async (answers, group, lang) => {
  const collectedData = [];

  for (const questionId in answers) {
    const answerObj = answers[questionId];

    // Parse questionId to get subject and id (format: "subject-q<number>")
    const match = questionId.match(/^(.+)-q(\d+)$/);
    if (!match) continue;

    const subject = match[1];
    const id = match[2];

    try {
      // Load and combine content in the correct language, like QuestionPage does
      let combinedContent = "";
      const base = lang === 'fr' ? '/data/questions/fr' : '/data/questions';

      const generalPath = `${base}/general/${subject}-q${id}.md`;
      const generalContent = await loadMarkdownFile(generalPath);

      if (generalContent) {
        combinedContent = generalContent;
      }

      if (group !== "general") {
        const groupPath = `${base}/${group}/${subject}-q${id}.md`;
        const groupContent = await loadMarkdownFile(groupPath);

        if (groupContent) {
          combinedContent = combinedContent
            ? combineMarkdownContent(combinedContent, groupContent)
            : groupContent;
        }
      }

      if (!combinedContent) continue;

      const parsed = parseMarkdownContent(combinedContent);
      // New logic: Yes/Do not know = needs actions, No/Not applicable = good job
      const needsActions =
        answerObj.answer === "yes" || answerObj.answer === "do_not_know";
      const isGoodJob = answerObj.answer === "no";

      collectedData.push({
        questionId,
        subject,
        questionNum: id,
        questionText: parsed.questionText,
        answer: answerObj.answer,
        needsActions,
        isGoodJob,
        actions: parsed.recommendedActions.replace(/^#+\s*/gm, ""),
      });
    } catch (error) {
      console.error(`Error loading content for ${questionId}:`, error);
    }
  }

  // Sort by subject (using DOMAIN_ORDER) and question number
  const subjectOrder = DOMAIN_ORDER.reduce((acc, subject, index) => {
    acc[subject] = index;
    return acc;
  }, {});

  return collectedData.sort((a, b) => {
    if (a.subject !== b.subject) {
      return (
        (subjectOrder[a.subject] ?? 999) - (subjectOrder[b.subject] ?? 999)
      );
    }
    return parseInt(a.questionNum) - parseInt(b.questionNum);
  });
};

// Process text with markdown links and render with clickable links in PDF
const renderTextWithLinks = (
  doc,
  text,
  x,
  startY,
  maxWidth,
  lineHeight = 5,
  dryRun = false
) => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let yPosition = startY;

  // Parse segments (text and links)
  const segments = [];
  let lastIndex = 0;
  let match;

  linkRegex.lastIndex = 0;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: text.substring(lastIndex, match.index),
      });
    }
    segments.push({ type: "link", text: match[1], url: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.substring(lastIndex) });
  }

  // If no links, calculate or render simple text wrapping
  if (
    segments.length === 0 ||
    (segments.length === 1 && segments[0].type === "text")
  ) {
    const lines = doc.splitTextToSize(text, maxWidth);
    if (!dryRun) {
      lines.forEach((line) => {
        doc.text(line, x, yPosition);
        yPosition += lineHeight;
      });
    } else {
      // In dry run mode, just calculate the position
      yPosition += lines.length * lineHeight;
    }
    return yPosition;
  }

  // Build lines with word wrapping, tracking segments
  const lines = [];
  let currentLineSegments = [];
  let currentLineWidth = 0;

  const getTextWidth = (text) => doc.getTextWidth(text);

  const flushLine = () => {
    if (currentLineSegments.length > 0) {
      lines.push([...currentLineSegments]);
      currentLineSegments = [];
      currentLineWidth = 0;
    }
  };

  for (const segment of segments) {
    if (segment.type === "text") {
      // Split text content into words
      const words = segment.content
        .split(/(\s+)/)
        .filter((w) => w.length > 0);

      for (const word of words) {
        const wordWidth = getTextWidth(word);
        const spaceWidth = currentLineWidth > 0 ? getTextWidth(" ") : 0;

        if (
          currentLineWidth > 0 &&
          currentLineWidth + spaceWidth + wordWidth > maxWidth
        ) {
          flushLine();
        }

        currentLineSegments.push({
          type: "text",
          content: word,
          width: wordWidth,
        });
        currentLineWidth +=
          (currentLineWidth > 0 ? spaceWidth : 0) + wordWidth;
      }
    } else if (segment.type === "link") {
      const linkWidth = getTextWidth(segment.text);
      const spaceWidth = currentLineWidth > 0 ? getTextWidth(" ") : 0;

      if (
        currentLineWidth > 0 &&
        currentLineWidth + spaceWidth + linkWidth > maxWidth
      ) {
        flushLine();
      }

      currentLineSegments.push({
        type: "link",
        text: segment.text,
        url: segment.url,
        width: linkWidth,
      });
      currentLineWidth +=
        (currentLineWidth > 0 ? spaceWidth : 0) + linkWidth;
    }
  }
  flushLine();

  // In dry run mode, just calculate the position and return
  if (dryRun) {
    return startY + lines.length * lineHeight;
  }

  // Render each line segment by segment
  for (const line of lines) {
    let currentX = x;

    for (const segment of line) {
      if (segment.type === "text") {
        // Render text in black
        doc.setTextColor(0, 0, 0);
        doc.text(segment.content.trimEnd(), currentX, yPosition);
        currentX += segment.width;
      } else if (segment.type === "link") {
        // Render link in blue with underline
        doc.setTextColor(0, 0, 255);
        doc.text(segment.text, currentX, yPosition);

        // Draw underline
        doc.setDrawColor(0, 0, 255);
        doc.line(
          currentX,
          yPosition + 1,
          currentX + segment.width,
          yPosition + 1
        );

        // Add clickable link
        doc.link(currentX, yPosition - 3, segment.width, 6, {
          url: segment.url,
        });

        currentX += segment.width;
      }
    }

    // Reset colors
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);

    yPosition += lineHeight;
  }

  return yPosition;
};

// Helper to add header to each page
const addPageHeader = (doc, pageWidth, fontAvailability = {}) => {
  const font = (preferred) => getFont(fontAvailability, [preferred]);
  const headerY = 15;

  // Add subtle line under header
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(20, headerY + 5, pageWidth - 20, headerY + 5);

  // Header text - use font fallback
  doc.setFont(font("Montserrat"), "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(t("pdfTitle"), 20, headerY);

  // Right side - date
  const dateStr = new Date().toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA");
  const dateWidth = doc.getTextWidth(dateStr);
  doc.text(dateStr, pageWidth - 20 - dateWidth, headerY);

  // Reset
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);
};

// Helper to add footer to each page
const addPageFooter = (doc, pageNum, totalPages, pageWidth, fontAvailability = {}) => {
  const font = (preferred) => getFont(fontAvailability, [preferred]);
  const footerY = 285;

  // Footer line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);

  // Page number - use font fallback
  doc.setFont(font("Lato"), "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);

  const pageText = `${t("pdfPage")} ${pageNum}`;
  doc.text(pageText, pageWidth / 2, footerY, { align: "center" });

  // Reset
  doc.setTextColor(0, 0, 0);
};

// Calculate height needed for a question item
const calculateQuestionHeight = (doc, item, pageWidth) => {
  let height = 0;

  // Question header
  height += 12;

  // Question text
  const questionLines = doc.splitTextToSize(item.questionText, pageWidth - 50);
  height += questionLines.length * 4.5 + 8;

  // Answer badge
  height += 12;

  if (item.isGoodJob) {
    height += 8;
  } else if (item.needsActions && item.actions.trim()) {
    // Recommended actions header
    height += 6;
    // Actions text
    const actionLines = doc.splitTextToSize(item.actions, pageWidth - 60);
    height += actionLines.length * 4 + 10;
  }

  // Bottom spacing
  height += 8;

  return height;
};

// Draw cover page
const drawCoverPage = (
  doc,
  user,
  pageWidth,
  pageHeight,
  logoImages = {},
  fontAvailability = {}
) => {
  const font = (preferred) => getFont(fontAvailability, [preferred]);
  const centerX = pageWidth / 2;
  let yPos = 40;

  // Title section with background
  doc.setFillColor(248, 249, 250);
  doc.rect(0, 0, pageWidth, 120, "F");

  // Main title - use font fallback
  doc.setFont(font("Montserrat"), "bold");
  doc.setFontSize(28);
  doc.setTextColor(33, 37, 41);
  doc.text(t("pdfTitle"), centerX, yPos, {
    align: "center",
  });
  yPos += 15;

  // Subtitle
  doc.setFont(font("Montserrat"), "normal");
  doc.setFontSize(18);
  doc.setTextColor(73, 80, 87);
  doc.text(t("pdfSubtitle"), centerX, yPos, { align: "center" });
  yPos += 30;

  // Project Information Section
  doc.setFont(font("Montserrat"), "bold");
  doc.setFontSize(14);
  doc.setTextColor(33, 37, 41);
  doc.text(t("pdfProjectInfo"), 30, yPos);
  yPos += 12;

  // Project details box
  const boxStartY = yPos - 5;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);

  // Project Title
  doc.setFont(font("Lato"), "bold");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(t("pdfProjectTitle"), 35, yPos);
  doc.setFont(font("Lato"), "normal");
  doc.setTextColor(33, 37, 41);
  const titleLines = doc.splitTextToSize(
    user.projectTitle || t("pdfNotSpecified"),
    pageWidth - 70
  );
  doc.text(titleLines, 35, yPos + 5);
  yPos += 10 + (titleLines.length - 1) * 5;

  // Location
  yPos += 8;
  doc.setFont(font("Lato"), "bold");
  doc.setTextColor(100, 100, 100);
  doc.text(t("pdfLocation"), 35, yPos);
  doc.setFont(font("Lato"), "normal");
  doc.setTextColor(33, 37, 41);
  const locationParts = [
    user.projectCountry,
    user.projectProvince,
    user.projectCity,
  ].filter(Boolean);
  const locationStr = locationParts.join(", ") || t("pdfNotSpecified");
  doc.text(locationStr, 70, yPos);
  yPos += 10;

  // Organization/Group
  if (user.cisssciusss) {
    doc.setFont(font("Lato"), "bold");
    doc.setTextColor(100, 100, 100);
    doc.text(t("pdfOrganization"), 35, yPos);
    doc.setFont(font("Lato"), "normal");
    doc.setTextColor(33, 37, 41);
    doc.text(user.cisssciusss, 70, yPos);
    yPos += 10;
  }

  // Project Types
  if (user.projectTypes && user.projectTypes.length > 0) {
    yPos += 5;
    doc.setFont(font("Lato"), "bold");
    doc.setTextColor(100, 100, 100);
    doc.text(t("pdfProjectTypes"), 35, yPos);
    yPos += 6;
    doc.setFont(font("Lato"), "normal");
    doc.setTextColor(33, 37, 41);
    const typesStr = user.projectTypes.join(", ");
    const typeLines = doc.splitTextToSize(typesStr, pageWidth - 70);
    doc.text(typeLines, 35, yPos);
    yPos += typeLines.length * 5;
  }

  // Draw box around project info
  const boxHeight = yPos - boxStartY + 5;
  doc.roundedRect(30, boxStartY, pageWidth - 60, boxHeight, 3, 3, "S");

  yPos += 25;

  // Description section
  doc.setFont(font("Lato"), "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const description = t("pdfCoverDescription");
  const descLines = doc.splitTextToSize(description, pageWidth - 60);
  doc.text(descLines, centerX, yPos, { align: "center" });

  yPos = pageHeight - 50;

  // Generated date at bottom
  doc.setFont(font("Lato"), "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `${t("pdfReportGenerated")} ${new Date().toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    centerX,
    yPos,
    { align: "center" }
  );

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Add logos at the bottom of cover page
  const logoHeight = 20;
  const logoY = pageHeight - 90;
  let currentX = 15;
  const logoSpacing = 10;

  const logos = [
    { key: "d3sm", width: 35 },
    { key: "douglas", width: 40 },
    { key: "hbhl", width: 25 },
    { key: "ludicmind", width: 48 },
  ];

  logos.forEach((logo) => {
    const imageData = logoImages[logo.key];
    if (imageData) {
      try {
        doc.addImage(imageData, "PNG", currentX, logoY, logo.width, logoHeight);
        currentX += logo.width + logoSpacing;
      } catch (error) {
        console.warn(`Failed to add logo ${logo.key}:`, error);
      }
    }
  });
};

// Generate PDF document
export const generatePDF = async (collectedData, user, lang, t) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Initialize custom fonts and get availability
  const fontAvailability = await initializeFonts(doc);

  // Helper to get font with fallback
  const font = (preferred) => getFont(fontAvailability, [preferred]);

  // Load logo images
  const logoImages = {};
  for (const [key, url] of Object.entries(IMAGE_URLS)) {
    const imageData = await loadImage(url);
    if (imageData) {
      logoImages[key] = imageData;
    }
  }

  // Draw cover page
  drawCoverPage(doc, user, pageWidth, pageHeight, logoImages, fontAvailability);

  // Add new page for content
  doc.addPage();

  // Add header
  addPageHeader(doc, pageWidth, fontAvailability);

  let yPosition = 35;
  let currentSubject = null;
  let pageCount = 2; // Cover is page 1

  // Assessment Results Title - use font fallback
  doc.setFont(font("Montserrat"), "bold");
  doc.setFontSize(18);
  doc.setTextColor(33, 37, 41);
  doc.text(t("pdfAssessmentResults"), 20, yPosition);
  yPosition += 10;

  // Description
  doc.setFont(font("Lato"), "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(t("pdfResultsDescription"), 20, yPosition);
  yPosition += 15;

  if (collectedData.length === 0) {
    doc.setFont(font("Lato"), "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(t("pdfNoQuestionsYet"), 20, yPosition);
  } else {
    collectedData.forEach((item, index) => {
      // Calculate required height for this question
      const requiredHeight = calculateQuestionHeight(doc, item, pageWidth);

      // Check if we need a new page (leave 40px margin at bottom)
      if (yPosition + requiredHeight > 270) {
        doc.addPage();
        pageCount++;
        addPageHeader(doc, pageWidth, fontAvailability);
        yPosition = 35;
      }

      // Domain header - only show when subject changes
      if (item.subject !== currentSubject) {
        currentSubject = item.subject;
        const domainConfig = DOMAIN_CONFIG[item.subject];

        // Check if domain header fits
        if (yPosition + 20 > 270) {
          doc.addPage();
          pageCount++;
          addPageHeader(doc, pageWidth, fontAvailability);
          yPosition = 35;
        }

        // Add some space before new domain
        yPosition += 10;

        // Domain header with colored background
        if (domainConfig) {
          // Convert hex color to RGB
          const hex = domainConfig.color.replace("#", "");
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);

          // Light background for domain header
          doc.setFillColor(r, g, b);
          doc.setDrawColor(r, g, b);
          doc.roundedRect(15, yPosition - 6, pageWidth - 30, 14, 2, 2, "FD");

          // Domain name - use font fallback
          doc.setFont(font("Montserrat"), "bold");
          doc.setFontSize(12);
          doc.setTextColor(255, 255, 255);
          doc.text((t(`domain${item.subject.charAt(0).toUpperCase() + item.subject.slice(1)}Name`, domainConfig.name) || domainConfig.name).toUpperCase(), 20, yPosition + 2);

          // Reset colors
          doc.setTextColor(0, 0, 0);
          yPosition += 18;
        } else {
          doc.setFont(font("Montserrat"), "bold");
          doc.setFontSize(12);
          doc.setTextColor(33, 37, 41);
          doc.text(item.subject.toUpperCase(), 20, yPosition);
          yPosition += 12;
        }
      }

      // Question card background - light gray with border
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(20, yPosition - 3, pageWidth - 40, 8, 1, 1, "FD");

      // Question header - use font fallback
      doc.setFont(font("Montserrat"), "normal");
      doc.setFontSize(10);
      doc.setTextColor(33, 37, 41);
      doc.text(`${t("pdfQuestion")} ${item.questionNum}`, 25, yPosition + 2);
      yPosition += 10;

      // Question text (with link support) - use font fallback
      doc.setFont(font("Lato"), "normal");
      doc.setFontSize(9);
      doc.setTextColor(73, 80, 87);
      yPosition = renderTextWithLinks(
        doc,
        item.questionText,
        25,
        yPosition,
        pageWidth - 50,
        4.5
      );
      yPosition += 6;

      // Answer badge
      const answerLabelMap = {
        yes: t("pdfAnswerYes"),
        no: t("pdfAnswerNo"),
        not_applicable: t("pdfAnswerNotApplicable"),
        do_not_know: t("pdfAnswerDoNotKnow"),
      };
      const answerLabel = answerLabelMap[item.answer] || item.answer.replaceAll("_", " ").toUpperCase();
      let badgeColor = [150, 150, 150];
      let textColor = [255, 255, 255];

      if (item.answer === "no") {
        badgeColor = [34, 197, 94]; // Green
      } else if (item.answer === "yes") {
        badgeColor = [239, 68, 68]; // Red
      } else if (item.answer === "do_not_know") {
        badgeColor = [245, 158, 11]; // Amber
      } else if (item.answer === "not_applicable") {
        badgeColor = [107, 114, 128]; // Gray
      }

      // Draw answer badge
      const badgeWidth = doc.getTextWidth(answerLabel) + 10;
      doc.setFillColor(...badgeColor);
      doc.roundedRect(25, yPosition - 4, badgeWidth, 8, 2, 2, "F");
      doc.setFont(font("Lato"), "bold");
      doc.setFontSize(8);
      doc.setTextColor(...textColor);
      doc.text(answerLabel, 25 + 5, yPosition + 1);
      yPosition += 10;

      if (item.isGoodJob) {
        doc.setFont(font("Lato"), "normal");
        doc.setFontSize(10);
        doc.setTextColor(34, 197, 94);
        doc.text(t("pdfGoodJob"), 25, yPosition);
        yPosition += 6;
        doc.setTextColor(0, 0, 0);
      } else if (item.needsActions && item.actions.trim()) {
        // Recommended actions header - use font fallback
        doc.setFont(font("Montserrat"), "normal");
        doc.setFontSize(9);
        doc.setTextColor(239, 68, 68);
        doc.text(t("pdfRecommendedActions"), 25, yPosition);
        yPosition += 8;
        doc.setTextColor(0, 0, 0);

        // Actions box - white background with simple gray outline
        const actionsStartY = yPosition - 4;
        const actionsPadding = 4; // Interior margin

        // Calculate height first (dry run - no actual rendering)
        const tempY = renderTextWithLinks(
          doc,
          item.actions,
          30 + actionsPadding,
          yPosition,
          pageWidth - 60 - actionsPadding * 2,
          4,
          true
        );
        const actionsHeight = tempY - yPosition + 1 + actionsPadding * 2;

        // Now draw the box with proper colors
        doc.setFillColor(255, 255, 255); // White fill
        doc.setDrawColor(180, 40, 40); // border
        doc.roundedRect(
          25,
          actionsStartY,
          pageWidth - 50,
          actionsHeight,
          2,
          2,
          "FD"
        );

        // Render actions text with interior margin (actual rendering) - use font fallback
        doc.setFont(font("Lato"), "normal");
        doc.setFontSize(9);
        doc.setTextColor(73, 80, 87);
        yPosition = renderTextWithLinks(
          doc,
          item.actions,
          30 + actionsPadding,
          yPosition + actionsPadding - 2,
          pageWidth - 60 - actionsPadding * 2,
          4
        );
        yPosition += 6;
      }

      yPosition += 8;
    });
  }

  // Update total pages in all footers
  const totalPages = doc.getNumberOfPages();
  const contentPages = totalPages - 1; // Exclude cover page from count

  // Add footers to all content pages
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    addPageFooter(doc, i - 1, contentPages, pageWidth, fontAvailability);
  }

  return doc;
};

// Download PDF to user's machine
export const downloadPDF = (doc, filename = "toolkit-recommendations.pdf") => {
  doc.save(filename);
};
