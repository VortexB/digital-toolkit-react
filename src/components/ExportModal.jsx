import { useState } from "react";
import emailjs from "@emailjs/browser";
import { useLanguage } from "../context/LanguageContext";
import { EMAILJS_CONFIG, INTERNAL_EMAILS } from "../utils/emailConfig";
import "./ExportModal.css";

export default function ExportModal({ isOpen, onClose, onGeneratePDF }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState(null); // null = choose, 'pdf', 'email'
  const [email, setEmail] = useState('');
  const [consentShare, setConsentShare] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // null, 'success', 'error'

  if (!isOpen) return null;

  const handleReset = () => {
    setMode(null);
    setEmail('');
    setConsentShare(false);
    setSending(false);
    setStatus(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // ── PDF Download ──────────────────────────
  const handlePDFSave = async () => {
    setSending(true);
    try {
      const doc = await onGeneratePDF();

      doc.save('toolkit-recommendations.pdf');

      if (consentShare) {
        await sendToInternal(doc);
      }

      setStatus('success');
    } catch (err) {
      console.error('PDF export error:', err);
      alert(err);
      setStatus('error');
    } finally {
      setSending(false);
    }
  };

  // ── Email Send ────────────────────────────
  const handleEmailSend = async () => {
    if (!email.trim()) return;
    setSending(true);

    try {
      const doc = await onGeneratePDF();
      const pdfBase64 = doc.output('datauristring').split(',')[1];

      const recipients = [email.trim()];
      if (consentShare) {
        recipients.push(...INTERNAL_EMAILS);
      }

      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        {
          to_email: recipients.join(', '),
          user_email: email.trim(),
          subject: 'D3SM Digital Assessment Toolkit — Your Results',
          message: 'Please find your Digital Assessment Toolkit results attached.',
          pdf_attachment: pdfBase64,
        },
        EMAILJS_CONFIG.publicKey,
      );

      setStatus('success');
    } catch (err) {
      console.error('Email send error:', err);
      setStatus('error');
    } finally {
      setSending(false);
    }
  };

  // ── Send PDF to internal emails only ──────
  const sendToInternal = async (doc) => {
    try {
      const pdfBase64 = doc.output('datauristring').split(',')[1];

      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        {
          to_email: INTERNAL_EMAILS.join(', '),
          user_email: 'consent-share@toolkit',
          subject: 'D3SM Toolkit — Shared Assessment Data (Consent Given)',
          message: 'A user has consented to share their assessment data.',
          pdf_attachment: pdfBase64,
        },
        EMAILJS_CONFIG.publicKey,
      );
    } catch (err) {
      console.error('Failed to send to internal emails:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-panel export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t("exportTitle")}</h2>
          <button className="modal-close" onClick={handleClose}>&times;</button>
        </div>

        {/* ── Status Screen ── */}
        {status && (
          <div className="modal-body export-status">
            {status === 'success' ? (
              <>
                <div className="status-icon success">✓</div>
                <h3>{mode === 'pdf' ? t("pdfDownloaded") : t("emailSent")}</h3>
                <p>
                  {mode === 'pdf'
                    ? t("pdfSaved")
                    : `${t("resultsSent", "", { email })}`}
                  {consentShare && t("sharedWithTeam")}
                </p>
              </>
            ) : (
              <>
                <div className="status-icon error">✗</div>
                <h3>{t("somethingWentWrong")}</h3>
                <p>{t("tryAgain")}</p>
              </>
            )}
            <div className="modal-footer">
              <button className="btn-primary" onClick={handleClose}>{t("done")}</button>
            </div>
          </div>
        )}

        {/* ── Step 1: Choose mode ── */}
        {!status && !mode && (
          <div className="modal-body">
            <div className="export-choices">
              <button className="export-choice-btn" onClick={() => setMode('pdf')}>
                <span className="choice-icon">📄</span>
                <span className="choice-label">{t("downloadPdf")}</span>
                <span className="choice-desc">{t("saveToDevice")}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: PDF options ── */}
        {!status && mode === 'pdf' && (
          <div className="modal-body">
            <p>{t("willBeDownloaded")}</p>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleReset}>{t("back")}</button>
              <button
                className="btn-primary"
                onClick={handlePDFSave}
                disabled={sending}
              >
                {sending ? t("saving") : t("savePdf")}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Email options ── */}
        {!status && mode === 'email' && (
          <div className="modal-body">
            <label className="email-label">
              {t("emailAddress")}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="email-input"
              />
            </label>

            <label className="consent-checkbox">
              <input
                type="checkbox"
                checked={consentShare}
                onChange={(e) => setConsentShare(e.target.checked)}
              />
              <span>{t("consentShare")}</span>
            </label>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleReset}>{t("back")}</button>
              <button
                className="btn-primary"
                onClick={handleEmailSend}
                disabled={sending || !email.trim()}
              >
                {sending ? t("sending") : t("sendEmail")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
