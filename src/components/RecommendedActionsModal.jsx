import ReactMarkdown from 'react-markdown';
import './RecommendedActionsModal.css';

// Custom link component that opens external links in new tab
const LinkRenderer = ({ href, children }) => {
  const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'));
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return <a href={href}>{children}</a>;
};

export default function RecommendedActionsModal({ isOpen, onClose, content, title }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel actions-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <ReactMarkdown components={{ a: LinkRenderer }}>{content}</ReactMarkdown>
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
