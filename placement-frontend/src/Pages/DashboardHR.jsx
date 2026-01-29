import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HRDashboard.css";
import CandidateCard from "../Components/CandidateCard";

// Skill suggestions
const SKILL_SUGGESTIONS = [
  "React",
  "React.js",
  "Node.js",
  "Express.js",
  "MongoDB",
  "SQL",
  "MySQL",
  "PostgreSQL",
  "Python",
  "Django",
  "Flask",
  "Java",
  "Spring Boot",
  "AWS",
  "Docker",
  "Git",
  "GitHub",
  "Machine Learning",
  "Data Science",
  "AI",
  "Next.js",
  "TypeScript"
];

const DashboardHR = () => {
  const navigate = useNavigate(); // ✅ MUST be inside component

  const [input, setInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [candidates, setCandidates] = useState([]);

  // Handle typing
  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (!value.trim()) {
      setFilteredSkills([]);
      return;
    }

    const matches = SKILL_SUGGESTIONS.filter(
      (skill) =>
        skill.toLowerCase().includes(value.toLowerCase()) &&
        !selectedSkills.includes(skill)
    );

    setFilteredSkills(matches);
  };

  // Add skill
  const addSkill = (skill) => {
    setSelectedSkills([...selectedSkills, skill]);
    setInput("");
    setFilteredSkills([]);
  };

  // Remove skill
  const removeSkill = (skill) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  // Dummy handler
  const handleFindCandidates = () => {
    setCandidates([
      {
        _id: "1",
        fullName: "Ansh Kulshreshtha",
        college: "XYZ Institute",
        branch: "CSE",
        matchScore: 85,
      },
      {
        _id: "2",
        fullName: "Rahul Sharma",
        college: "ABC University",
        branch: "IT",
        matchScore: 78,
      },
    ]);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <h1>Find Matching Candidates 🎯</h1>
        <p>Select skills to find the best candidates</p>
      </div>

      <div className="dashboard-main">
        <div className="card">
          <h3>Required Skills</h3>

          <input
            type="text"
            placeholder="Type skills (e.g. React, Python, AWS)"
            value={input}
            onChange={handleChange}
            className="skill-input"
          />

          {filteredSkills.length > 0 && (
            <div className="suggestion-box">
              {filteredSkills.map((skill, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => addSkill(skill)}
                >
                  {skill}
                </div>
              ))}
            </div>
          )}

          <div className="selected-skills">
            {selectedSkills.map((skill, index) => (
              <span key={index} className="skill-chip">
                {skill}
                <button onClick={() => removeSkill(skill)}>×</button>
              </span>
            ))}
          </div>

          <button
            className="primary-btn"
            disabled={selectedSkills.length === 0}
            onClick={handleFindCandidates}
          >
            Find Candidates ({selectedSkills.length})
          </button>
        </div>

        {/* POST JOB BUTTON */}
        <button
          className="primary-btn"
          style={{ marginTop: "20px" }}
          onClick={() => navigate("/create-job")}
        >
          + Post Job
        </button>

        {/* CANDIDATE RESULTS */}
        {candidates.length > 0 && (
          <div className="candidates-grid">
            {candidates.map((c) => (
              <CandidateCard key={c._id} candidate={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHR;