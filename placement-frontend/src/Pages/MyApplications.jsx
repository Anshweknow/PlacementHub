import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MyApplications.css";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:5000/application/my", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setApplications(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <h3 style={{ textAlign: "center" }}>Loading...</h3>;
  }

  if (applications.length === 0) {
    return (
      <h3 style={{ textAlign: "center", marginTop: "40px" }}>
        You haven’t applied to any jobs yet.
      </h3>
    );
  }

  return (
    <div className="myapps-page">
      <h2 className="myapps-title">My Applications</h2>

      <div className="myapps-grid">
        {applications.map((app) => (
          <div key={app._id} className="myapp-card">
            <h3 className="myapp-title">
              {app.jobId?.jobTitle || "Job Title"}
            </h3>

            <p className="myapp-detail">
              <strong>🏢 Company:</strong> {app.jobId?.companyName}
            </p>

            <p className="myapp-detail">
              <strong>💰 Salary:</strong> {app.jobId?.salaryRange}
            </p>

            <p className="myapp-detail">
              <strong>📅 Applied On:</strong>{" "}
              {new Date(app.createdAt).toLocaleDateString()}
            </p>

            <div className="myapp-skills">
              {app.jobId?.skillsRequired?.map((skill, i) => (
                <span key={i} className="myapp-skill">
                  {skill}
                </span>
              ))}
            </div>

            <button
              className="view-job-btn"
              onClick={() => navigate(`/job/${app.jobId?._id}`)}
            >
              View Job
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyApplications;
