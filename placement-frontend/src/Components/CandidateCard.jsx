import { useNavigate } from "react-router-dom";
import "./CandidateCard.css";

const CandidateCard = ({ candidate }) => {
  const navigate = useNavigate();

  // Defensive check: handle if candidate data is missing
  if (!candidate) return null;

  // Use the ID provided by the parent (DashboardHR)
  const studentId = candidate._id;

  const initial = candidate.fullName?.charAt(0).toUpperCase() || "U";

  const handleViewProfile = () => {
    if (studentId) {
      console.log("Navigating to Profile with ID:", studentId);
      navigate(`/profile/${studentId}`);
    } else {
      console.error("Candidate ID is missing:", candidate);
    }
  };

  return (
    <div className="candidate-card">
      <div className="candidate-left">
        <div className="candidate-avatar">{initial}</div>
        <div className="candidate-info">
          <h4>{candidate.fullName}</h4>
          <p style={{ fontSize: "0.85rem", color: "#666" }}>Match Score: {candidate.matchScore}%</p>
        </div>
      </div>

      <div className="candidate-right">
        <button
          className="candidate-btn"
          onClick={handleViewProfile}
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default CandidateCard;