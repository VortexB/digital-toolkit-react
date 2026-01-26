import "./TermsModal.css";

export default function TermsModal({ onClose }) {
  return (
    <div className="modal-terms">
      <div className="modal-content">
        <h2>Terms and Conditions</h2>
        <div className="terms-content">
          
            The D3SM Digital Assessment Toolkit (the ‘D3SM Toolkit’) was developed as part of the Douglas Digital Data Science for Mental Health initiative (D3SM), which aims to support implementation of digital technologies into mental health care settings in the domains of 1) technology, 2) value proposition, 3) intended adopters, 4) healthcare organizations, and 5) external context. Further information about how to use the D3SM Toolkit can be found in “How do I use this D3SM toolkit?”.This Toolkit was created based on the NASSS-CAT  originally developed by the Interdisciplinary Research in Health Sciences group at the University of Oxford. The D3SM Toolkit is the subject of ongoing update, and members of D3SM assume no liability arising from the use of this Toolkit. Neither D3SM members nor employees, directors, or agents of the Douglas Research Centre assumes any legal liability or responsibility for the accuracy, reliability, completeness, or usefulness of any information presented in this Toolkit. The Toolkit may not be modified or adapted without the written consent of the D3SM. The Toolkit may be reproduced and disseminated for non-commercial purposes, but only in the original format with this notice. Please contact us by email at XXXXX for any questions. 
             

        </div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
