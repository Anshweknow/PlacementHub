import { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginbg from "../assets/loginbg.jpg";
import "./Login.css";
import { useTheme } from "../Context/useTheme";
import { clearSession, storeSession } from "../config/api";

function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const trialUsers = {
    student: {
      email: "student.trial@placementhub.dev",
      password: "Student@123",
      fullName: "Student Trial",
      role: "student",
    },
    hr: {
      email: "hr.trial@placementhub.dev",
      password: "HR@123456",
      fullName: "HR Trial",
      role: "hr",
    },
  };

  const [form, setForm] = useState({
    email: trialUsers.student.email,
    password: trialUsers.student.password,
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTrialPrefill = (role) => {
    setForm({
      email: trialUsers[role].email,
      password: trialUsers[role].password,
    });
    setError("");
  };

  const redirectByRole = (role) => {
    if (role === "hr") navigate("/dashboard-hr");
    else navigate("/student-dashboard");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = String(form.email).trim().toLowerCase();
    const match = Object.values(trialUsers).find(
      (trial) => trial.email === normalizedEmail && trial.password === form.password
    );

    if (!match) {
      setError("Use one of the trial accounts to continue.");
      return;
    }

    clearSession();
    storeSession({
      role: match.role,
      fullName: match.fullName,
      user: {
        email: match.email,
        role: match.role,
        fullName: match.fullName,
      },
    });
    redirectByRole(match.role);
  };

  return (
    <div className={`login-container ${theme}`}>
      <div className="login-background">
        <img src={loginbg} alt="PlacementHub login" />
      </div>

      <div className="login-content">
        <div className="login-card">
          <button className="theme-toggle" onClick={toggleTheme} type="button" aria-label="Toggle theme">
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <h1>PlacementHub</h1>
          <p>Sign in with a trial account to explore student and HR workflows.</p>

          <div className="trial-users" aria-label="Trial login users">
            <p className="trial-users-title">Trial account access</p>
            <div className="trial-users-actions">
              <button type="button" onClick={() => handleTrialPrefill("student")} className="trial-btn">Use Student Trial</button>
              <button type="button" onClick={() => handleTrialPrefill("hr")} className="trial-btn">Use HR Trial</button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" />

            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" value={form.password} onChange={handleChange} required autoComplete="current-password" />

            {error && <p className="login-error" role="alert">{error}</p>}

            <button type="submit" className="btn-login">
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
