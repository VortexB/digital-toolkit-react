import "./GlossaryModal.css"

export default function GlossaryModal({ onClose }) {
  //TODO: populate with data or extract from external file
  const glossary = [
    { category: "Digital mental health interventions", description: "Mental health services and information delivery using the Internet and related to technologies, including mobile app, virtual reality, artificial intelligence, wearable, telehealth, instant messaging" },
    { category: "c2", description: "Lorem Ipsum" },
  ];
  return (
    <div className="modal-glossary">
      <div className="modal-content">
        <h3>Glossary</h3>
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
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
