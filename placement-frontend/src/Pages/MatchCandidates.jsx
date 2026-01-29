import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import CandidateCard from "../Components/CandidateCard";

function MatchCandidates() {
  const { jobId } = useParams();
  const token = localStorage.getItem("token");

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/profile/match-candidates/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCandidates(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Match candidates error:", err);
        setLoading(false);
      });
  }, [jobId, token]);

  if (loading) {
    return (
      <h3 style={{ textAlign: "center", marginTop: "40px" }}>
        Loading candidates...
      </h3>
    );
  }

  if (!candidates.length) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "40px", color: "gray" }}>
        ❌ No matching candidates found
      </h2>
    );
  }

  return (
    <div style={{ width: "90%", margin: "30px auto" }}>
      <h1 style={{ marginBottom: "25px" }}>🎯 Matching Candidates</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "25px",
        }}
      >
        {candidates.map((candidate, index) => (
          <CandidateCard key={index} candidate={candidate} />
        ))}
      </div>
    </div>
  );
}

export default MatchCandidates;