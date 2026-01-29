import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const baseUrl = "http://localhost:5000/profile";
    const url = id && id !== "undefined" ? `${baseUrl}/${id}` : `${baseUrl}/me`;

    axios
      .get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data.user || res.data);
        setProfile(res.data.profile || res.data || {});
      })
      .catch((err) => {
        console.error("Fetch Error:", err.response?.data || err.message);
      });
  }, [id, token]);

  if (!profile || !user) {
    return (
      <div className="profile-page animated-bg">
        <h3 className="loading-text">Loading Profile...</h3>
      </div>
    );
  }

  return (
    <div className="profile-page animated-bg">
      <div className="profile-card glass-card">
        {/* HEADER SECTION */}
        <div className="profile-header">
          <div className="profile-avatar">
            {(profile.fullName || user.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="profile-title-area">
            <h2 className="profile-name">{profile.fullName || user.name}</h2>
            <p className="profile-subtitle">{profile.college || "Student at PlacementHub"}</p>
          </div>
        </div>

        <div className="profile-divider" />

        {/* BASIC & EDUCATION INFO */}
        <div className="profile-grid">
          <div className="profile-section">
            <h4>Basic Information</h4>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {profile.phone || "Not provided"}</p>
          </div>

          <div className="profile-section">
            <h4>Academic Details</h4>
            <p><strong>Branch:</strong> {profile.branch || "N/A"}</p>
            <p><strong>CGPA:</strong> <span className="highlight-text">{profile.cgpa || "N/A"}</span></p>
            <p><strong>12th Marks:</strong> {profile.twelfthMarks || "N/A"}%</p>
          </div>
        </div>

        <div className="profile-divider" />

        {/* SKILLS SECTION */}
        <div className="profile-section">
          <h4>Technical Skills</h4>
          <div className="skill-list">
            {profile.skills && Array.isArray(profile.skills) ? (
              profile.skills.map((skill, i) => (
                <span key={i} className="skill-tag">{skill}</span>
              ))
            ) : (
              <p>No skills listed</p>
            )}
          </div>
        </div>

        <div className="profile-divider" />

        {/* ASSESSMENT PERFORMANCE (For HR to See) */}
        <div className="profile-section">
          <h4>Skill Assessment Results</h4>
          {profile.testHistory && profile.testHistory.length > 0 ? (
            <div className="test-history-grid">
              {profile.testHistory.map((test, index) => (
                <div key={index} className="test-result-item">
                  <div className="test-meta">
                    <span className="test-cat">{test.category}</span>
                    <span className="test-date">{test.date}</span>
                  </div>
                  <div className="test-score-box">
                    <span className="score-percent">
                      {Math.round((test.score / test.total) * 100)}%
                    </span>
                    <span className="score-raw">({test.score}/{test.total})</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data-text">No assessments completed yet.</p>
          )}
        </div>

        <div className="profile-divider" />

        {/* RESUME SECTION */}
        <div className="profile-section">
          <h4>Resume</h4>
          {profile.resumeUrl ? (
            <div className="resume-actions">
              <a
                href={`http://localhost:5000${profile.resumeUrl}`}
                target="_blank"
                rel="noreferrer"
                className="resume-view-btn"
              >
                📄 View Full Resume
              </a>
            </div>
          ) : (
            <p>No resume uploaded</p>
          )}
        </div>

        {/* EDIT BUTTON (Only shown to the student, not HR) */}
        {!id && (
          <button className="edit-profile-btn" onClick={() => navigate("/edit-profile")}>
            ✏️ Edit My Profile
          </button>
        )}
        
        {/* BACK BUTTON (For HR viewing from dashboard) */}
        {id && (
          <button className="back-btn-secondary" onClick={() => navigate(-1)}>
            ← Back to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;