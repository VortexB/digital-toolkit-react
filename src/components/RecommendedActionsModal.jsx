import ReactMarkdown from 'react-markdown';
import '../components/RecommendedActionsModal.css';

export default function RecommendedActionsModal({ isOpen, onClose, content, title }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        <div className="modal-footer">
          <button className="modal-continue" onClick={onClose}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
