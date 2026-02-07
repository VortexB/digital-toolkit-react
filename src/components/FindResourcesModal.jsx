import "./FindResourcesModal.css";

const RESOURCES = [
  {
    title: "Guide de soutien à l'appréciation de la valeur",
    url: "https://extranetcemtl.cemtl.rtss.qc.ca/fileadmin/intranet/enseignement-recherche/innovation/INESSS_Guide_appreciation_valeur_VF.pdf",
    note: "(in French) (2024) INESSS",
  },
  {
    title: "6-Step Guide to mHealth Implementation",
    url: "https://ssaquebec.ca/en/news/guide-to-mhealth-implementation/",
    note: "(Unite de soutien SSA Quebec) (2024)",
  },
  {
    title: "Toolkit for e-Mental Health Implementation",
    url: "https://mentalhealthcommission.ca/wp-content/uploads/2021/05/E_Mental_Health_Implementation_Toolkit_2018_eng.pdf",
    note: "(Mental Health Commission of Canada 2018)",
  },
  {
    title: "Implementation science research development (ImpRes) tool: A practical guide to using the ImpRes tool",
    url: "https://impsci.tracs.unc.edu/wp-content/uploads/ImpRes-Guide.pdf",
    note: "(2018) King's College London",
  },
];

export default function FindResourcesModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel resources-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Find Resources</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <ul className="resources-list">
            {RESOURCES.map((resource, index) => (
              <li key={index}>
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  {resource.title}
                </a>
                <span className="resource-note"> {resource.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
