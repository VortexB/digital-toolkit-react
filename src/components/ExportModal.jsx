import { useState } from "react";
import "./ExportModal.css";

export default function ExportModal({ onClose, onSendEmail, isOpen }) {
  const [email, setEmail] = useState('');

  const handleSend = () => {
    if (email.trim()) {
      onSendEmail(email);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-export">
      <div className="modal-content">
        <h3>PDF Downloaded Successfully</h3>
        <p>The PDF has been saved to your downloads folder.</p>

        <div className="email-section">
          <label>
            Email address to send PDF:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
            />
          </label>
          <div className="button-group">
            <button onClick={handleSend} disabled={!email.trim()}>
              Send Email
            </button>
            <button onClick={onClose} className="secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
