import { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginbg from "../assets/loginbg.jpg";
import "./Login.css";
import { useTheme } from "../Context/useTheme";

function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [form, setForm] = useState({
    role: "student",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const role = form.role === "hr" ? "hr" : "student";

    localStorage.setItem("token", "trial-mode-token");
    localStorage.setItem("role", role);

    if (role === "hr") {
      navigate("/dashboard-hr");
    } else {
      navigate("/student-dashboard");
    }
  };

  return (
    <div className={`login-container ${theme}`}>
      <div className="login-background">
        <img src={loginbg} alt="login" />
      </div>

      <div className="login-content">
        <div className="login-card">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <h1>PlacementHub</h1>
          <p>Trial mode: explore features without authentication</p>

          <form onSubmit={handleSubmit} className="login-form">
            <label>Select Role</label>
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="student">Student</option>
              <option value="hr">HR</option>
            </select>

            <button type="submit" className="btn-login">
              Continue as Trial User
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
