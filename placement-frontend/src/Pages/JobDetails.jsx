import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getApiUrl } from "../config/api";

function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(getApiUrl(`/job/${id}`))
      .then((res) => {
        setJob(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [id]);

  const applyJob = async () => {
    try {
      await axios.post(
        getApiUrl("/application/apply"),
        { jobId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Application Submitted!");
    } catch (err) {
      console.log(err);
      alert("Error applying");
    }
  };

  if (loading) return <h3 style={{ textAlign: "center" }}>Loading...</h3>;
  if (!job) return <h3 style={{ textAlign: "center" }}>Job not found</h3>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{job.title}</h2>

      <p><strong>Company:</strong> {job.postedBy?.fullName || "PlacementHub"}</p>
      <p><strong>Location:</strong> {job.location}</p>
      <p><strong>Salary:</strong> {job.salary || "Not disclosed"}</p>

      <h3>Description</h3>
      <p>{job.description}</p>

      <h3>Skills Required</h3>
      <div style={styles.skillsBox}>
        {(job.skills || []).map((skill, i) => (
          <span key={i} style={styles.skillBadge}>{skill}</span>
        ))}
      </div>

      {/* APPLY BUTTON FOR STUDENTS ONLY */}
      {role === "student" && (
        <button style={styles.applyBtn} onClick={applyJob}>
          Apply Now
        </button>
      )}
    </div>
  );
}

const styles = {
  container: { width: "60%", margin: "30px auto" },
  title: { fontSize: "28px", fontWeight: "bold", marginBottom: "20px" },
  skillsBox: { display: "flex", gap: "10px", marginTop: "10px" },
  skillBadge: {
    backgroundColor: "#007bff",
    padding: "6px 12px",
    borderRadius: "20px",
    color: "white",
  },
  applyBtn: {
    marginTop: "20px",
    padding: "12px",
    backgroundColor: "#28a745",
    color: "white",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
};

export default JobDetails;
