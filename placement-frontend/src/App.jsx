import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import StudentDashboard from "./Pages/StudentDashboard";
import Jobs from "./pages/student/BrowseJobs";
import Profile from "./pages/student/ViewProfile";
import EditProfile from "./Pages/EditProfile";
import MyApplications from "./pages/student/MyApplications";
import JobDetails from "./Pages/JobDetails";
import CreateJob from "./Pages/CreateJob";
import DashboardHR from "./Pages/DashboardHR";
import ApplicationsHR from "./Pages/ApplicationsHR";
import MatchCandidates from "./Pages/MatchCandidates";
import { useTheme } from "./Context/useTheme";
import SkillTest from "./Pages/SkillTest";

function App() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const hideGlobalThemeToggle = location.pathname === "/dashboard-hr";

  return (
    <>
      {!hideGlobalThemeToggle && <button
        onClick={toggleTheme}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "10px 15px",
          borderRadius: "8px",
          background: "var(--card-bg)",
          color: "var(--text)",
          border: "1px solid var(--border)",
          cursor: "pointer",
          zIndex: 999,
        }}
      >
        {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
      </button>}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/job/:id" element={<JobDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/skill-test" element={<SkillTest />} />

        <Route path="/dashboard-hr" element={<DashboardHR />} />
        <Route path="/create-job" element={<CreateJob />} />
        <Route path="/applications-hr" element={<ApplicationsHR />} />
        <Route path="/match/:jobId" element={<MatchCandidates />} />
        <Route path="/profile/:id" element={<Profile />} />
      </Routes>
    </>
  );
}

export default App;
