import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useState } from "react";
import GlossaryModal from "../components/GlossaryModal";
import QuestionTable from "../components/QuestionTable";
import { useEffect } from "react";

export default function NavigationPage() {
  const { group } = useUser();
  const [showGlossary, setShowGlossary] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!group) {
      navigate("/");
      return;
    }

  }, []);

  const domains = {"Technology":"Domain 2: Technology", "Value":"Domain 3: Value proposition"};
  const questions = [
    ["2.1", "2.2"],
    ["3.1", "3.2", "3.3"]
  ];

  return (
    <div style={{textAlign:"center"}}>
      <h2>Navigation ({group})</h2>
      <QuestionTable domains={domains} questions={questions} />

      <button onClick={() => setShowGlossary(true)}>Open Glossary</button>

      {showGlossary && <GlossaryModal onClose={() => setShowGlossary(false)} />}
    </div>
  );
}
