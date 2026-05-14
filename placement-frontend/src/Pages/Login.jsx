import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import loginbg from "../assets/loginbg.jpg";
import "./Login.css";
import { useTheme } from "../Context/useTheme";
import { getApiUrl, storeSession } from "../config/api";

function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const trialUsers = {
    student: {
      email: "student.trial@placementhub.dev",
      password: "Student@123",
    },
    hr: {
      email: "hr.trial@placementhub.dev",
      password: "HR@123456",
    },
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTrialPrefill = (role) => {
    setForm(trialUsers[role]);
    setError("");
  };

  const redirectByRole = (role) => {
    if (role === "hr") {
      navigate("/dashboard-hr");
    } else {
      navigate("/student-dashboard");
    }
  };

  const isTrialUser = (email) => Object.values(trialUsers).some((trial) => trial.email === String(email).toLowerCase());

  const tryAutoProvisionTrialAccount = async (email, password) => {
    const match = Object.entries(trialUsers).find(([, trial]) => trial.email === String(email).toLowerCase() && trial.password === password);
    if (!match) return false;

    const [role] = match;
    const fullName = role === "hr" ? "HR Trial" : "Student Trial";

    await axios.post(getApiUrl("/auth/register"), {
      fullName,
      email: String(email).toLowerCase(),
      password,
      role,
    });

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(getApiUrl("/auth/login"), form);
      storeSession(data);
      redirectByRole(data.role);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.msg || "";
      const canAutoProvision = status === 401 && message.toLowerCase().includes("invalid") && isTrialUser(form.email);

      if (canAutoProvision) {
        try {
          await tryAutoProvisionTrialAccount(form.email, form.password);
          const { data } = await axios.post(getApiUrl("/auth/login"), form);
          storeSession(data);
          redirectByRole(data.role);
          return;
        } catch {
          // fall through to shared error message below
        }
      }

      setError(err.response?.data?.msg || "Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
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
          <p>Sign in to manage placements, jobs, applications, and assessments.</p>

          <div className="trial-users" aria-label="Trial login users">
            <p className="trial-users-title">Try a trial account</p>
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

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="login-footer">
            New to PlacementHub? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
