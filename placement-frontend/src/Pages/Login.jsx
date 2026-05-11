import { useState } from "react";
import axios from "axios";
import { getApiUrl } from "../config/api";
import { useNavigate } from "react-router-dom";
import loginbg from "../assets/loginbg.jpg";
import "./Login.css";
import { useTheme } from "../Context/ThemeContext";

function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [form, setForm] = useState({
    role: "student",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(getApiUrl("/auth/login"), form);

      localStorage.setItem("token", res.data.token || "trial-mode-token");
      localStorage.setItem("role", res.data.role);

      if (res.data.role === "hr") {
        navigate("/dashboard-hr");
      } else {
        navigate("/student-dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Unable to start trial session");
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
