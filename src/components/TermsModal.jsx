import "./TermsModal.css";

export default function TermsModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel terms-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Terms and Conditions</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="terms-content">
          <p>
            The D3SM Digital Assessment Toolkit ('D3SM Toolkit') was developed as part of the
            Douglas Digital Data Science for Mental Health initiative (D3SM), which aims to support
            the implementation of digital technologies into mental health care settings in the
            domains of 1) technology, 2) value proposition, 3) intended adopters, 4) health care
            organizations, and 5) external context. Further information about how to use the D3SM
            Toolkit can be found in{" "}
            <a href="/#">
              "How do I use the D3SM toolkit?"
            </a>
          </p>
          <p>
            This Toolkit was created based on the NASSS-CAT originally developed by the
            Interdisciplinary Research in Health Sciences group at the University of Oxford. The
            D3SM Toolkit is undergoing continual updates, and members of D3SM assume no liability
            arising from the use of this Toolkit. Neither D3SM members nor employees, directors,
            or agents of the Douglas Research Centre assume any legal liability or responsibility
            for the accuracy, reliability, completeness, or usefulness of any information presented
            in this Toolkit.
          </p>
          <p>
            The Toolkit may not be modified or adapted without the written consent of the D3SM.
            The Toolkit may be reproduced and disseminated for non-commercial purposes, but only
            in the original format and must include this notice: Please contact us by email at{" "}
            <a href="mailto:implementation.d3sm.comtl@ssss.gouv.qc.ca">
              implementation.d3sm.comtl@ssss.gouv.qc.ca
            </a>{" "}
            for any questions.
          </p>
        </div>
      </div>
    </div>
  );
}
