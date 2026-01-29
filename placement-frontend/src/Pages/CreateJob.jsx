import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateJob() {
  const navigate = useNavigate();

  // REMOVED: Local isDarkMode state to prevent button collision

  const [form, setForm] = useState({
    companyName: "",
    jobTitle: "",
    jobDescription: "",
    location: "",
    salaryRange: "",
    skillsRequired: "",
  });

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // REMOVED: toggleDarkMode function as it should be handled globally

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/job/create",
        {
          ...form,
          skillsRequired: form.skillsRequired.split(",").map((s) => s.trim()),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Job posted successfully!");
      navigate("/dashboard-hr");
    } catch (err) {
      console.log(err);
      alert("Error posting job");
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* REMOVED: The duplicate <button> that was colliding in the top right */}

      <div style={styles.glassCard}>
        <h2 style={styles.title}>Post a New Job</h2>
        <p style={styles.subtitle}>Fill in the details to find the best talent</p>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Company Name</label>
            <input
              name="companyName"
              placeholder="e.g. Google, Microsoft"
              value={form.companyName}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Job Title</label>
            <input
              name="jobTitle"
              placeholder="e.g. Full Stack Developer"
              value={form.jobTitle}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Job Description</label>
            <textarea
              name="jobDescription"
              placeholder="Describe the role and responsibilities..."
              value={form.jobDescription}
              onChange={handleChange}
              required
              style={styles.textarea}
            />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Location</label>
              <input
                name="location"
                placeholder="Remote / City"
                value={form.location}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Salary Range</label>
              <input
                name="salaryRange"
                placeholder="e.g. 10 - 15 LPA"
                value={form.salaryRange}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Required Skills</label>
            <input
              name="skillsRequired"
              placeholder="React, Node.js, MongoDB (comma separated)"
              value={form.skillsRequired}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button}>
            🚀 Post Job Opening
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #1e1b4b)",
    backgroundSize: "400% 400%",
    padding: "60px 20px",
  },
  // REMOVED: themeToggle style from this file to avoid confusion
  glassCard: {
    width: "100%",
    maxWidth: "650px",
    background: "rgba(255, 255, 255, 0.95)", 
    padding: "40px",
    borderRadius: "28px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(10px)",
  },
  title: {
    textAlign: "center",
    color: "#0f172a",
    fontSize: "28px",
    fontWeight: "800",
    margin: "0 0 5px 0",
  },
  subtitle: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
    marginBottom: "30px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  row: {
    display: "flex",
    gap: "15px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#4f46e5",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    padding: "14px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    background: "#ffffff",
    fontSize: "15px",
    color: "#1e293b",
    outline: "none",
  },
  textarea: {
    padding: "14px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    background: "#ffffff",
    height: "100px",
    fontSize: "15px",
    color: "#1e293b",
    outline: "none",
    resize: "none",
  },
  button: {
    padding: "16px",
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    color: "white",
    borderRadius: "14px",
    fontWeight: "800",
    fontSize: "16px",
    cursor: "pointer",
    border: "none",
    marginTop: "10px",
    boxShadow: "0 10px 20px rgba(99, 102, 241, 0.4)",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
};

export default CreateJob;