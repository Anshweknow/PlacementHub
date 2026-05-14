import React, { useState } from "react";
import axios from "axios";
import { getApiUrl, storeSession } from "../config/api";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "student" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(getApiUrl("/auth/register"), form);
      storeSession(data);
      alert("Registration successful.");
      navigate(data.role === "hr" ? "/dashboard-hr" : "/student-dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Create Account</h2>
      <form style={styles.form} onSubmit={handleSubmit}>
        <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required style={styles.input} />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required style={styles.input} />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required style={styles.input} />
        <select name="role" value={form.role} onChange={handleChange} style={styles.input}>
          <option value="student">Student</option>
          <option value="hr">HR</option>
        </select>
        <button type="submit" style={styles.button}>Register</button>
      </form>
      <p style={{ textAlign: "center", marginTop: 10 }}>Already have an account? <Link to="/">Login</Link></p>
    </div>
  );
}

const styles = {
  container: { width: "40%", margin: "40px auto", padding: 25, background: "white", borderRadius: 10, boxShadow: "0 2px 10px rgba(0,0,0,0.1)" },
  title: { textAlign: "center", marginBottom: 20, fontSize: 24 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: { padding: 12, borderRadius: 6, border: "1px solid #ccc", fontSize: 15 },
  button: { padding: 12, backgroundColor: "#007bff", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 16 },
};

export default Register;
