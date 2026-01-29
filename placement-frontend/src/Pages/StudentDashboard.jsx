import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import StatCard from "../Components/StatCard";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  // State for Test History Modal
  const [showHistory, setShowHistory] = useState(false);
  const [testHistory, setTestHistory] = useState([]);

  // Fetch history from localStorage
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("testHistory") || "[]");
    setTestHistory(savedHistory);
  }, [showHistory]); // Refresh whenever modal opens

  const stats = {
    applicationsCount: 0,
    testsCompleted: testHistory.length,
    avgScore: testHistory.length 
      ? Math.round(testHistory.reduce((acc, curr) => acc + (curr.score / curr.total * 100), 0) / testHistory.length)
      : 0,
  };

  return (
    <div className={`student-dashboard ${theme} animated-bg`}>
      {/* NAVBAR */}
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

      {/* HERO SECTION */}
      <header className="dashboard-hero">
        <div className="hero-text">
          <h1>Welcome back 👋</h1>
          <p>Your career growth dashboard</p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="dashboard-main">
        <div className="stats-container">
          <StatCard icon="📝" value={stats.applicationsCount} label="Applications" />
          <StatCard icon="✅" value={stats.testsCompleted} label="Tests Completed" />
          <StatCard icon="🎯" value={`${stats.avgScore}%`} label="Average Score" />
        </div>

        <div className="main-grid">
          {/* SKILL TEST CARD */}
          <div className="section-card">
            <h3>Skill Assessment</h3>
            <p className="small-text">Improve your profile visibility with tests.</p>
            <div className="actions-list">
              <button className="quick-btn primary-gradient" onClick={() => navigate("/skill-test")}>
                Take Skill Test
              </button>
              {/* FIXED: Ensure this button sets showHistory to true */}
              <button className="quick-btn outline-btn" onClick={() => setShowHistory(true)}>
                📜 Test Taken History
              </button>
            </div>
          </div>

          <div className="section-card">
            <h3>Account Settings</h3>
            <div className="actions-list">
              <button className="quick-btn" onClick={() => navigate("/profile")}>View Profile</button>
              <button className="quick-btn" onClick={() => navigate("/my-applications")}>My Applications</button>
            </div>
          </div>
        </div>
      </div>

      {/* FIXED: TEST HISTORY MODAL (Rendered outside the main grid but inside the wrapper) */}
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
                  <thead>
                    <tr>
                      <th>Domain</th>
                      <th>Score</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testHistory.map((test, index) => (
                      <tr key={index}>
                        <td>{test.category}</td>
                        <td className="score-cell-green">{test.score} / {test.total}</td>
                        <td>{test.date}</td>
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