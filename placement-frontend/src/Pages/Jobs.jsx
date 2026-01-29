import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Jobs.css";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const loadJobs = () => {
    axios
      .get("http://localhost:5000/job/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setJobs(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleApply = async (jobId) => {
    try {
      await axios.post(
        "http://localhost:5000/application/apply",
        { jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Application submitted!");
      loadJobs();
    } catch (err) {
      if (err.response?.status === 400) {
        alert("You already applied for this job.");
      } else {
        alert("Error applying.");
      }
    }
  };

  if (loading) return <h3 style={{ textAlign: "center" }}>Loading...</h3>;
  if (jobs.length === 0) return <h3 style={{ textAlign: "center" }}>No jobs available</h3>;

  return (
    <div className="jobs-page">
      <h2 className="jobs-title">Available Jobs</h2>

      <div className="jobs-grid">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="job-card"
            onClick={() => navigate(`/job/${job._id}`)}
          >
            <h3 className="job-title">{job.jobTitle}</h3>

            <p className="job-detail"><strong>🏢 Company:</strong> {job.companyName}</p>
            <p className="job-detail"><strong>📍 Location:</strong> {job.location || "Not specified"}</p>
            <p className="job-detail"><strong>💰 Salary:</strong> {job.salaryRange}</p>

            <div className="skills-heading">Required Skills</div>

            <div className="skills-box">
              {(job.skillsRequired || []).map((skill, i) => (
                <span key={i} className="skill-badge">{skill}</span>
              ))}
            </div>

            {/* STUDENT */}
            {role === "student" && (
              <button
                className={`job-btn ${job.applied ? "applied-btn" : "apply-btn"}`}
                disabled={job.applied}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!job.applied) handleApply(job._id);
                }}
              >
                {job.applied ? "Applied" : "Apply Now"}
              </button>
            )}

            {/* HR */}
            {role === "hr" && (
              <button
                className="job-btn match-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/match/${job._id}`);
                }}
              >
                🔍 Find Matching Candidates
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Jobs;
