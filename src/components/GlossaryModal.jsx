import "./GlossaryModal.css"

export default function GlossaryModal({ onClose }) {
  const glossary = [
    { category: "Acceptability", description: "Perception of satisfaction and agreement among interested parties involved in various aspects related to implementing innovations (e.g., content, complexity, delivery, credibility, safety)" },
    { category: "Adoption", description: "Intention, decision or action to test or employ an innovation" },
    { category: "Appropriateness", description: "Perceived fit, relevance, suitability of the innovation for a given provider, target users, settings, and/or perceived fit of the innovation to address an identified issue" },
    { category: "Co-design", description: "Human-centered approach to design involving collaboration and engagement with users alongside researchers, designers, and stakeholders in the identification of problems and development of solutions (Vial et al., 2023)" },
    { category: "Digital mental health interventions", description: "Mental health services and information delivery using the Internet and related to technologies, including mobile apps, virtual reality, artificial intelligence, wearables, telehealth, instant messaging" },
    { category: "Digital navigator", description: "A dedicated health care professional whose task in hospitals and clinics is to select evidence-based apps, troubleshoot, and interpret digital data outputs in a clinically meaningful way" },
    { category: "Effectiveness", description: "The degree to which an innovation achieves its intended outcomes in addressing a specific health problem or need" },
    { category: "Engagement", description: "The state in which users actively invest their physical, affective, and cognitive energies into a stimulus or task related to the digital innovation (Nahum-Shani et al., 2022)" },
    { category: "Feasibility", description: "The degree to which an innovation can be successfully used within a given setting" },
    { category: "Innovation", description: "A novel set of behaviors, routines and ways of working that are discontinuous with previous practices, directed at improving health outcomes, administrative efficiency, cost effectiveness, or user experience, and that are implemented by planned and coordinated actions (Greenhalgh et al., 2004)" },
    { category: "Innovation readiness", description: "Level of maturity in an organization to successfully adopt new innovations based on four major themes: strategic course of innovation, climate for innovation, leadership for innovation, commitment to innovation (van den Hoed et al., 2022)" },
    { category: "Interoperability", description: "Ability of computer systems to communicate with each other in order to share and use information. For example, sustainability of the project can be established in the health system by connecting data from an app to online patient health care records." },
    { category: "Patient-partner", description: "An individual with lived experience of a health issue, or a caregiver, family member, or friend who actively contributes to health research or quality improvement initiatives (CIHR)" },
    { category: "Sustainment", description: "The extent to which a newly introduced innovation is integrated, maintained or institutionalized within the ongoing operations of a service setting" },
    { category: "Usability", description: "The ease of use or extent to which the innovation may accomplish its goals" },
    { category: "Value proposition", description: "A statement that explains both features of the innovation and benefits that the innovation will deliver to a health care organization" },
    { category: "Sustainment", description: "The extent to which a newly introduced innovation is integrated, maintained or institutionalized within the ongoing operations of a service setting(s)" },

  ];
  return (
    <div className="modal-glossary">
      <div className="modal-content">
        <h3>Glossary</h3>
            <button onClick={onClose}>Close</button>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {glossary.map((item, index) => (
              <tr key={index}>
                <td>{item.category}</td>
                <td>{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
