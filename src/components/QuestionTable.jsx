import { Link } from "react-router-dom";

export default function QuestionTable({ domains, questions }) {
  const domainEntries = Object.entries(domains); // [[folderName, displayName], ...]

  const maxRows = Math.max(...questions.map(qList => qList.length));

  return (
    <table>
      <thead>
        <tr>
          {domainEntries.map(([folderName, displayName]) => (
            <th key={folderName}>{displayName}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: maxRows }, (_, rowIndex) => (
          <tr key={rowIndex}>
            {domainEntries.map(([folderName], colIndex) => {
              const questionText =
                questions[colIndex] && questions[colIndex][rowIndex]
                  ? questions[colIndex][rowIndex]
                  : null;

              return (
                <td key={colIndex}>
                  {questionText && (
                    <div>
                      <Link to={`/question/${folderName}/${rowIndex + 1}`}>
                        {questionText}
                      </Link>
                      <div>
                        {/* TODO: add extra indicator if the question was completed before. */}
                      </div>
                    </div>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
