import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getApiUrl } from "../config/api";
import { useTheme } from "../Context/useTheme";
import StatCard from "../Components/StatCard";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);
  const [testHistory, setTestHistory] = useState([]);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get(getApiUrl("/profile/test-history"), { headers })
      .then((res) => setTestHistory(res.data.testHistory || []))
      .catch(() => setTestHistory([]));

    axios
      .get(getApiUrl("/application/my"), { headers })
      .then((res) => setApplicationsCount((res.data || []).length))
      .catch(() => setApplicationsCount(0));
  }, [token, showHistory]);

  const stats = {
    applicationsCount,
    testsCompleted: testHistory.length,
    avgScore: testHistory.length
      ? Math.round(
          testHistory.reduce((acc, curr) => acc + (curr.score / curr.total) * 100, 0) /
            testHistory.length
        )
      : 0,
  };

  return (
    <div className={`student-dashboard ${theme} animated-bg`}>
      <nav className="dashboard-navbar">
        <h2 className="brand" onClick={() => navigate("/")}>PlacementHub</h2>
        <div className="nav-actions">
          <img
            src="/avatar-placeholder.png"
            alt="profile"
            className="navbar-profile-avatar"
            onClick={() => navigate("/profile")}
          />
        </div>
      </nav>

      <header className="dashboard-hero">
        <div className="hero-text">
          <h1>Welcome back 👋</h1>
          <p>Track tests, update your profile, and apply to jobs.</p>
        </div>
      </header>

      <div className="dashboard-main">
        <div className="stats-container">
          <StatCard icon="📝" value={stats.applicationsCount} label="Applications" />
          <StatCard icon="✅" value={stats.testsCompleted} label="Tests Completed" />
          <StatCard icon="🎯" value={`${stats.avgScore}%`} label="Average Score" />
        </div>

        <div className="main-grid">
          <div className="section-card">
            <h3>Skill Assessment Module 2.0</h3>
            <p className="small-text">Timed quizzes with domain-specific question banks.</p>
            <div className="actions-list">
              <button className="quick-btn primary-gradient" onClick={() => navigate("/skill-test")}>
                Take Skill Test
              </button>
              <button className="quick-btn outline-btn" onClick={() => setShowHistory(true)}>
                📜 Test History
              </button>
            </div>
          </div>

          <div className="section-card">
            <h3>Career Actions</h3>
            <div className="actions-list">
              <button className="quick-btn" onClick={() => navigate("/jobs")}>Browse Jobs</button>
              <button className="quick-btn" onClick={() => navigate("/profile")}>View Profile</button>
              <button className="quick-btn" onClick={() => navigate("/my-applications")}>My Applications</button>
            </div>
          </div>
        </div>
      </div>

      {showHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="history-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="dark-text">Assessment History</h2>
              <button className="close-x" onClick={() => setShowHistory(false)}>&times;</button>
            </div>

            <div className="history-content-scroll">
              {testHistory.length > 0 ? (
                <table className="history-table">
                  <thead><tr><th>Domain</th><th>Score</th><th>Date</th></tr></thead>
                  <tbody>
                    {testHistory.map((test, index) => (
                      <tr key={index}>
                        <td>{test.category}</td>
                        <td className="score-cell-green">{test.score} / {test.total}</td>
                        <td>{new Date(test.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <p>No tests taken yet.</p>
                  <button className="quick-btn" onClick={() => { setShowHistory(false); navigate("/skill-test"); }}>
                    Start Your First Test
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
