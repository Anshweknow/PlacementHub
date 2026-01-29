import React, { useEffect, useState } from "react";
import axios from "axios";

function ApplicationsHR() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/application/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setApplications(res.data || []);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  if (loading) return <h3 style={{ textAlign: "center" }}>Loading...</h3>;

  if (applications.length === 0)
    return <h3 style={{ textAlign: "center" }}>No applications found</h3>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Job Applications</h2>

      <div style={styles.grid}>
        {applications.map((app) => (
          <div key={app._id} style={styles.card}>
            <h3 style={styles.jobTitle}>{app.job?.jobTitle}</h3>

            <p><strong>Applicant:</strong> {app.student?.name}</p>
            <p><strong>Email:</strong> {app.student?.email}</p>
            <p><strong>Job:</strong> {app.job?.companyName}</p>

            <p><strong>Applied On:</strong> {new Date(app.createdAt).toDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "90%",
    margin: "30px auto",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "28px",
    fontWeight: "600",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "25px",
  },
  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  jobTitle: {
    marginBottom: "10px",
    fontSize: "20px",
    fontWeight: "600",
  },
};

export default ApplicationsHR;
