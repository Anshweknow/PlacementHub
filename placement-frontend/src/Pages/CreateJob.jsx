import React, { useState } from "react";
import axios from "axios";
import { getApiUrl } from "../config/api";
import { useNavigate } from "react-router-dom";

function CreateJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", salary: "", skills: "" });
  const token = localStorage.getItem("token");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        getApiUrl("/job/create"),
        {
          title: form.title,
          description: form.description,
          salary: form.salary,
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Job posted successfully!");
      navigate("/dashboard-hr");
    } catch (err) {
      alert(err.response?.data?.msg || "Error posting job");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Create Job</h2>
      <form style={styles.form} onSubmit={handleSubmit}>
        <input style={styles.input} name="title" placeholder="Job title" value={form.title} onChange={handleChange} required />
        <textarea style={styles.input} name="description" placeholder="Job description" value={form.description} onChange={handleChange} required />
        <input style={styles.input} name="salary" placeholder="Salary" value={form.salary} onChange={handleChange} />
        <input style={styles.input} name="skills" placeholder="React, Node.js" value={form.skills} onChange={handleChange} required />
        <button style={styles.btn} type="submit">Post Job</button>
      </form>
    </div>
  );
}

const styles = {
  container: { width: "50%", margin: "30px auto" },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: { padding: 12, borderRadius: 8, border: "1px solid #ccc" },
  btn: { padding: 12, background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8 },
};

export default CreateJob;
