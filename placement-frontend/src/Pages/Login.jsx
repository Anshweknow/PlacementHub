import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import loginbg from "../assets/loginbg.jpg";
import "./Login.css";
import { useTheme } from "../context/ThemeContext";

function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "student",
  });

  // HANDLE INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // SUBMIT LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/auth/login",
        form
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      if (res.data.role === "hr") {
        navigate("/dashboard-hr");
      } else {
        navigate("/student-dashboard");
      }

    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className={`login-container ${theme}`}>
      {/* LEFT IMAGE */}
      <div className="login-background">
        <img src={loginbg} alt="login" />
      </div>

      {/* RIGHT CARD */}
      <div className="login-content">
        <div className="login-card">

          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <h1>PlacementHub</h1>
          <p>Connect talent with opportunities</p>

          <form onSubmit={handleSubmit} className="login-form">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <label>Select Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="student">Student</option>
              <option value="hr">HR</option>
            </select>

            <button type="submit" className="btn-login">
              Login
            </button>
          </form>

          <p className="login-footer">
            Don’t have an account? <Link to="/register">Register</Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;
