import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";

export default function QuestionPage() {
  const { group } = useUser();
  const { subject, id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState("");

  useEffect(() => {
  if (!group) {
    navigate("/");
    return;
  }

  fetch(`/data/questions/${group}/${subject.toLowerCase()}-q${id}.md`)
    .then((r) => r.ok ? r.text() : "# Not Found")
    .then(setContent)
    .catch(() => setContent("# Not Found"));
}, [group, subject, id]);


  return (
    <div>
      <h2>
        {subject} - Question {id}
      </h2>
      {/* TODO: parse and display this data appropiately. the idea was to use markdown headers but the question data can be formatted however we like*/}
      {content}
    </div>
  );
}
