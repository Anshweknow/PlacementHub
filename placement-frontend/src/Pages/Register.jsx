import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/auth/login", form);

      // Save token & role
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      alert("Login successful!");

      // Redirect based on role
      if (res.data.role === "hr") {
        navigate("/dashboard-hr");   // HR dashboard
      } else {
        navigate("/dashboard");      // Student dashboard
      }

    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Login</h2>

      <form style={styles.form} onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={form.email}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={form.password}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "10px" }}>
        Don't have an account?{" "}
        <a href="/register" style={{ color: "#007bff" }}>
          Register
        </a>
      </p>
    </div>
  );
}

const styles = {
  container: {
    width: "40%",
    margin: "40px auto",
    padding: "25px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  title: { textAlign: "center", marginBottom: "20px", fontSize: "24px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "15px",
  },
  button: {
    padding: "12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default Login;
