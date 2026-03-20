import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { DOMAIN_ORDER, DOMAIN_CONFIG, ANSWER_COLORS } from '../utils/domainConfig';
import './DomainWheel.css';

// ─── SVG Geometry Constants ────────────────────────────────
const CX = 300;
const CY = 300;
const INNER_R = 100;
const OUTER_R = 190;
const SLICE_GAP = 2;
const SLICE_ANGLE = 360 / DOMAIN_ORDER.length;

const SEG_START = 205;
const SEG_THICK = 12;
const SEG_GAP = 3;
const SEG_ANGLE_PAD = 4;

const HOVER_EXPAND = 15;

const ICON_SIZE = 36;
const LABEL_R = 148;

// ─── Geometry Helpers ──────────────────────────────────────
function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, innerR, outerR, startAngle, endAngle) {
  const s1 = polarToCartesian(cx, cy, outerR, endAngle);
  const e1 = polarToCartesian(cx, cy, outerR, startAngle);
  const s2 = polarToCartesian(cx, cy, innerR, startAngle);
  const e2 = polarToCartesian(cx, cy, innerR, endAngle);
  const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;

  return [
    'M', s1.x, s1.y,
    'A', outerR, outerR, 0, largeArc, 0, e1.x, e1.y,
    'L', s2.x, s2.y,
    'A', innerR, innerR, 0, largeArc, 1, e2.x, e2.y,
    'Z',
  ].join(' ');
}

function starPath(outerR, innerR, points = 5) {
  const step = Math.PI / points;
  const pts = [];
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    pts.push(`${r * Math.cos(angle)},${r * Math.sin(angle)}`);
  }
  return `M${pts.join('L')}Z`;
}

// ─── Component ─────────────────────────────────────────────
export default function DomainWheel({ domains, onHoveredDomainChange }) {
  const navigate = useNavigate();
  const { user, getAnswer } = useUser();
  const { t } = useLanguage();
  const [hoveredDomain, setHoveredDomain] = useState(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);

  // Pipe hover changes to parent
  const handleDomainHover = (key) => {
    setHoveredDomain(key);
    onHoveredDomainChange?.(key);
  };

  // Build domain data with answer states
  const domainData = useMemo(() => {
    return DOMAIN_ORDER.map((key, index) => {
      const config = DOMAIN_CONFIG[key];
      const domainInfo = domains.find(d => d.key === key);
      const questionCount = domainInfo?.questions?.length || 0;

      const startAngle = index * SLICE_ANGLE;
      const endAngle = startAngle + SLICE_ANGLE;
      const bisectorAngle = startAngle + SLICE_ANGLE / 2;

      const questions = [];
      let firstUnanswered = 1;
      let foundUnanswered = false;

      for (let q = 1; q <= questionCount; q++) {
        const questionId = `${key}-q${q}`;
        const answer = getAnswer(questionId);
        questions.push({
          num: q,
          questionId,
          answer: answer?.answer || null,
        });
        if (!foundUnanswered && !answer) {
          firstUnanswered = q;
          foundUnanswered = true;
        }
      }

      // If all answered, default to Q1
      if (!foundUnanswered) firstUnanswered = 1;

      const allAnswered = questions.length > 0 && questions.every(q => q.answer !== null);
      const allGreen = allAnswered && questions.every(q => q.answer === 'no');

      return {
        ...config,
        startAngle,
        endAngle,
        bisectorAngle,
        questions,
        allGreen,
        questionCount,
        firstUnanswered,
      };
    });
  }, [domains, getAnswer]);

  const getSliceTransform = (domain) => {
    if (hoveredDomain !== domain.key) return '';
    const rad = (domain.bisectorAngle - 90) * Math.PI / 180;
    const tx = HOVER_EXPAND * Math.cos(rad);
    const ty = HOVER_EXPAND * Math.sin(rad);
    return `translate(${tx}, ${ty})`;
  };

  // Navigate to first unanswered question for this domain
  const handleDomainClick = (domain) => {
    navigate(`/question/${domain.key}/${domain.firstUnanswered}`);
  };

  // Compute tooltip position in SVG space (center of the segment arc)
  const getTooltipPos = (domainKey, qNum) => {
    const domain = domainData.find(d => d.key === domainKey);
    if (!domain) return { x: CX, y: CY };

    const qIdx = qNum - 1;
    const segMidR = SEG_START + qIdx * (SEG_THICK + SEG_GAP) + SEG_THICK / 2;
    const segMidAngle = (domain.startAngle + domain.endAngle) / 2;
    return polarToCartesian(CX, CY, segMidR + SEG_THICK + 8, segMidAngle);
  };

  const maxSegments = Math.max(...domainData.map(d => d.questionCount));
  const maxRadius = SEG_START + maxSegments * (SEG_THICK + SEG_GAP) + 20;
  const viewSize = Math.max(600, (maxRadius + 10) * 2);
  const offset = (viewSize - 600) / 2;

  const tooltipPos = hoveredSegment
    ? getTooltipPos(hoveredSegment.domain, hoveredSegment.q)
    : null;

  return (
    <div className="wheel-wrapper">
      <div className="wheel-spinner">
        <svg
          viewBox={`${-offset} ${-offset} ${viewSize} ${viewSize}`}
          className="wheel-svg"
        >
          {/* Slices */}
          {domainData.map((domain) => {
            const slicePath = describeArc(
              CX, CY,
              INNER_R + 2,
              OUTER_R,
              domain.startAngle + SLICE_GAP / 2,
              domain.endAngle - SLICE_GAP / 2,
            );

            return (
              <g
                key={domain.key}
                className={`wheel-slice ${hoveredDomain === domain.key ? 'hovered' : ''}`}
                style={{ transform: getSliceTransform(domain) }}
                onMouseEnter={() => handleDomainHover(domain.key)}
                onMouseLeave={() => handleDomainHover(null)}
                onClick={() => handleDomainClick(domain)}
              >
                <path
                  d={slicePath}
                  fill={domain.color}
                  stroke="#a6a6a668"
                  strokeWidth="1"
                  className="slice-path"
                />
              </g>
            );
          })}

          {/* Question Segments */}
          {domainData.map((domain) => {
            if (domain.allGreen) {
              const starAngle = domain.bisectorAngle;
              const starR = SEG_START + 25;
              const starCenter = polarToCartesian(CX, CY, starR, starAngle);

              return (
                <g
                  key={`star-${domain.key}`}
                  className="star-badge"
                  style={{ transform: getSliceTransform(domain) }}
                  onMouseEnter={() => handleDomainHover(domain.key)}
                  onMouseLeave={() => handleDomainHover(null)}
                >
                  <path
                    d={starPath(18, 8)}
                    fill="#FFD700"
                    stroke="#DAA520"
                    strokeWidth="1"
                    transform={`translate(${starCenter.x}, ${starCenter.y})`}
                  />
                </g>
              );
            }

            return domain.questions.map((q, qIdx) => {
              const segInner = SEG_START + qIdx * (SEG_THICK + SEG_GAP);
              const segOuter = segInner + SEG_THICK;
              const segStart = domain.startAngle + SEG_ANGLE_PAD;
              const segEnd = domain.endAngle - SEG_ANGLE_PAD;

              const answerColor = q.answer
                ? ANSWER_COLORS[q.answer] || ANSWER_COLORS.unanswered
                : ANSWER_COLORS.unanswered;

              const isSegHovered = hoveredSegment?.domain === domain.key && hoveredSegment?.q === q.num;

              return (
                <path
                  key={`seg-${domain.key}-${q.num}`}
                  d={describeArc(CX, CY, segInner, segOuter, segStart, segEnd)}
                  fill={answerColor}
                  stroke="#a6a6a617"
                  strokeWidth="1"
                  className={`question-segment ${isSegHovered ? 'seg-hovered' : ''}`}
                  style={{ transform: getSliceTransform(domain) }}
                  onMouseEnter={() => {
                    setHoveredSegment({ domain: domain.key, q: q.num });
                    handleDomainHover(domain.key);
                  }}
                  onMouseLeave={() => {
                    setHoveredSegment(null);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/question/${domain.key}/${q.num}`);
                  }}
                />
              );
            });
          })}
        </svg>

        {/* Domain Labels — counter-rotate to stay upright */}
        {domainData.map((domain) => {
          const labelPos = polarToCartesian(CX, CY, LABEL_R, domain.bisectorAngle);

          return (
            <div
              key={`label-${domain.key}`}
              className="domain-label"
              style={{
                left: `${((labelPos.x + offset) / viewSize) * 100}%`,
                top: `${((labelPos.y + offset) / viewSize) * 100}%`,
              }}
              onMouseEnter={() => handleDomainHover(domain.key)}
              onMouseLeave={() => handleDomainHover(null)}
              onClick={() => handleDomainClick(domain)}
            >
              <img
                src={domain.icon}
                alt={t(`domain${domain.key.charAt(0).toUpperCase() + domain.key.slice(1)}ShortName`, domain.shortName)}
                className="domain-icon"
                width={ICON_SIZE}
                height={ICON_SIZE}
              />
              <span className="domain-name">{t(`domain${domain.key.charAt(0).toUpperCase() + domain.key.slice(1)}ShortName`, domain.shortName)}</span>
            </div>
          );
        })}

        {/* Segment Tooltip — always mounted so counter-spin stays in sync */}
        <div
          className="segment-tooltip"
          style={{
            left: tooltipPos ? `${((tooltipPos.x + offset) / viewSize) * 100}%` : '50%',
            top: tooltipPos ? `${((tooltipPos.y + offset) / viewSize) * 100}%` : '50%',
            opacity: hoveredSegment ? 1 : 0,
          }}
        >
          {hoveredSegment ? `Q${hoveredSegment.q}` : ''}
        </div>
      </div>

      {/* Center Circle */}
      <div className="wheel-center">
        <span className="project-title">
          {user.projectTitle || t("yourProject")}
        </span>
      </div>
    </div>
  );
}
