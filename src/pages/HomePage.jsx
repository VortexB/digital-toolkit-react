import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useState } from "react";
import TermsModal from "../components/TermsModal";
import "./HomePage.css";

export default function HomePage() {
  const { user, setUser } = useUser();
  const [selectedGroup, setSelectedGroup] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const navigate = useNavigate();

  const handleBegin = () => {
    if (
      selectedGroup &&
      user.agreedToTerms &&
      user.projectTitle.trim() &&
      user.projectLocation.trim()
    ) {
      setUser((prev) => ({ ...prev, group: selectedGroup }));
      navigate("/navigation");
    }
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
  };

  const handleTermsChange = (e) => {
    setUser((prev) => ({ ...prev, agreedToTerms: e.target.checked }));
  };

  const handleProjectTitleChange = (e) => {
    setUser((prev) => ({ ...prev, projectTitle: e.target.value }));
  };

  const handleProjectLocationChange = (e) => {
    setUser((prev) => ({ ...prev, projectLocation: e.target.value }));
  };

  const openTermsModal = () => {
    setShowTermsModal(true);
  };

  const closeTermsModal = () => {
    setShowTermsModal(false);
  };

  return (
    //TODO: Extract the data out externally? might not be needed
    <div class="home-page">
      <a href="https://douglas.research.mcgill.ca/">
        <img src="imgs/douglas-logo.png" alt="Douglas logo" />
      </a>
      <h1 class="header" >D3SM Digital Assessment Toolkit</h1>
      <h4 class="subtitle">
        <strong>What is this about?</strong>
      </h4>
      <p>
        This D3SM toolkit aims to provide ideas, steps, and resources to support
        researchers, clinicians, health care managers, and project leads when
        planning, implementing, and evaluating digital mental health
        innovations. It also considers how to plan sustainability through
        implementation. We created this toolkit by adapting the non-adoption,
        abandonment and challenges to scale-up, spread, sustainability (NASSS)
        framework, combined with a Complexity Assessment Tool (CAT), developed
        by Greenhalgh and her colleagues.  The assessment will help users  
        <ul>
          <li>
            Assess the readiness level of technology integration into health
            care settings according to the key domains (technology, value
            proposition, intended adopters, healthcare organizations, and
            external context)  
          </li>
          <li>
            Identify barriers and facilitators related to technology integration
            in health care settings 
          </li>
          <li>
            Access to resources and tools that can help overcome existing
            barriers and support integration of technology 
          </li>
        </ul>
        We recommend that users apply this tool in different phases of the
        implementation process (e.g., conceptualization, planning,
        implementation, evaluation, sustainability, commercialization) as
        barriers and facilitators can change over time as well as the policy
        context.  
      </p>
      <p>
        <h4>Who is this toolkit for?</h4>
        <ul>
          <li>
            -Researchers and clinicians who develop and plan to implement
            digital mental health innovations 
          </li>
          <li>
            -Health care managers, program leads, and clinicians, who plan to
            adopt digital mental health innovations for implementation in their
            clinical settings 
          </li>
        </ul>

        <h4>How do I use the D3SM toolkit? </h4>
        <p>
          By answering No. questions in five domains, 1) technology, 2) value
          proposition, 3) intended adopters, 4) healthcare organizations, and 5)
          external context, you will be able to assess challenges and resources
          of each domain during your pathway for implementation and sustainment.
          Depending on your responses, you will receive a list of recommended
          actions and resources to address the identified challenges at the end
          of the assessment. By completing questions of all domains, you will
          also be able to identify which domains need more input and measures to
          respond to specific complexity. In addition, conducting assessment
          regularly (three to six months) can also help the project team monitor
          and evaluate the process of digital technology integration over time. 
        </p>

        <h4>How was this D3SM Toolkit developed? </h4>
        <p>
          The Douglas Data and Digital Science for Mental Health (D3SM)
          Implementation team identified and adapted the NASSS (non-adoption,
          abandonment and challenges to scale-up, spread, sustainability)
          framework, combined with a Complexity Assessment Toolkit (CAT). The
          NASSS-CAT was originally developed by the Interdisciplinary Research
          in Health Sciences group led by Dr. Trisha Greenhalgh at the
          University of Oxford in 2021. Considering its specific focus on
          complexities and interdependent characteristics of health technology
          projects, we adapted the tool to the Canadian/Quebec health care
          context after selecting relevant questions and administering the
          modified questionnaire with selected D3SM research teams. We
          identified resource information through literature review, meetings
          and consultations with people working on development and
          implementation of digital mental health interventions in clinical
          settings. 
        </p>
        <p>
          Reference: Greenhalgh T, Maylor H, Shaw S, Wherton J, Papoutsi C,
          Betton V, Nelissen N, Gremyr A, Rushforth A, Koshkouei M, Taylor J The
          NASSS-CAT Tools for Understanding, Guiding, Monitoring, and
          Researching Technology Implementation Projects in Health and Social
          Care: Protocol for an Evaluation Study in Real-World Settings, JMIR
          Res Protoc 2020;9(5):e16861 
        </p>
      </p>
      <select value={selectedGroup} onChange={handleGroupChange}>
        <option value="">Select your group</option>
        <option value="general">General</option>
        <option value="quebec">Quebec</option>
        <option value="douglasciuss">Douglas/CIUSSS</option>
      </select>

      <div>
        <label>
          Project Title:{" "}
          <input
            type="text"
            value={user.projectTitle}
            onChange={handleProjectTitleChange}
          />
        </label>
      </div>

      <div>
        <label>
          Project Location:{" "}
          <input
            type="text"
            value={user.projectLocation}
            onChange={handleProjectLocationChange}
          />
        </label>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={user.agreedToTerms}
            onChange={handleTermsChange}
          />
          Agree to{" "}
          <a href="#" onClick={openTermsModal}>
            terms and conditions
          </a>
        </label>
      </div>

      <button
        onClick={handleBegin}
        disabled={
          !selectedGroup ||
          !user.agreedToTerms ||
          !user.projectTitle.trim() ||
          !user.projectLocation.trim()
        }
      >
        Begin
      </button>

      {showTermsModal && <TermsModal onClose={closeTermsModal} />}
      <footer>
        <p></p>
      </footer>
    </div>
  );
}
