import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useState } from "react";

export default function HomePage() {
  const { setGroup } = useUser();
  const [selectedGroup, setSelectedGroup] = useState("");
  const navigate = useNavigate();

  const handleBegin = () => {
    if (selectedGroup) {
      setGroup(selectedGroup);
      navigate("/navigation");
    }
  };

  return (
    //TODO: Extract the data out externally? might not be needed
      <div class="container">
      <a href="https://douglas.research.mcgill.ca/">
        <img src="imgs/douglas-logo.png" alt="Douglas logo" />
      </a>
      <h1 class="header">Toolkit Renderer</h1>
      <h4 class="subtitle"><strong>What is this about?</strong></h4>
      <p>
        This toolkit developed by adapting the NASSS (non-adoption, abandonment
        and challenges to scale-up, spread, sustainability) framework, combined
        with a Complexity Assessment Toolkit, aims to provide ideas and
        resources to support research and/or implementation teams when planning,
        implementing, and evaluating digital mental health innovations.
      </p>
      <h4 class="subtitle">
        <strong>The assessment will help readers</strong>
      </h4>
      <ul>
        <li>
          <p>
            Be aware of complexity in different domains of a technology
            implementation project
          </p>
        </li>
        <li><p>Monitor how the identified complexity changes over time</p></li>
        <li>
          <p>
            Consider measures to reduce or respond to complexity in different
            domains of the digital innovations
          </p>
        </li>
      </ul>
      <h4 class="subtitle"><strong>Who is this toolkit for?</strong></h4>
      <ul>
        <li>
          <p>
            Researchers who develop implement digital mental health innovations
            for implementation
          </p>
        </li>
        <li>
          <p>
            Health care organizations that plan to adopt digital mental health
            innovations for implementation
          </p>
        </li>
      </ul>
      <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
        <option value="">Select your group</option>
        <option value="group1">Group 1</option>
        <option value="group2">Group 2</option>
      </select>

      <button onClick={handleBegin} disabled={!selectedGroup}>
        Begin
      </button>
      <footer>
        <p>Footer text</p>
      </footer>
    </div>
  );
}