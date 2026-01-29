import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";

function EditProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    skills: "",
    college: "",
    branch: "",
    cgpa: "",
    twelfthMarks: "",
    resume: null
  });

  const [success, setSuccess] = useState(false);
  const token = localStorage.getItem("token");

  /* FETCH PROFILE */
  useEffect(() => {
    if (!token) return;

    axios
      .get("http://localhost:5000/profile/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const user = res.data.user;
        const profile = res.data.profile || {};

        setForm({
          fullName: user?.fullName || user?.name || "",
          phone: profile?.phone || "",
          skills: Array.isArray(profile?.skills)
            ? profile.skills.join(", ")
            : profile?.skills || "",
          college: profile?.college || "",
          branch: profile?.branch || "",
          cgpa: profile?.cgpa || "",
          twelfthMarks: profile?.twelfthMarks || "",
          resume: null
        });
      })
      .catch((err) => console.log("FETCH ERROR:", err));
  }, [token]);

  /* INPUT HANDLERS */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    setForm({ ...form, resume: e.target.files[0] });
  };

  /* SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    const data = new FormData();
    Object.keys(form).forEach((key) => {
      if (key !== "resume") data.append(key, form[key]);
    });

    if (form.resume) data.append("resume", form.resume);

    try {
      await axios.post("http://localhost:5000/profile/update", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      setSuccess(true);
      // Optional: Navigate back to profile after short delay
      setTimeout(() => navigate("/profile"), 2000);
    } catch (err) {
      console.log("UPDATE ERROR:", err);
    }
  };

  return (
    <div className="edit-profile-page animated-bg">
      {/* NOTE: No Dark Mode button here. 
        It will be handled by your global Navbar. 
      */}
      
      <div className="edit-profile-card">
        <div className="edit-header">
           <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
           <h2>Edit Profile</h2>
        </div>

        {success && (
          <div className="success-message">
            ✅ Profile updated successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-grid">
            <div className="input-group">
              <label>Full Name</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter your full name" />
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Contact number" />
            </div>

            <div className="input-group">
              <label>College</label>
              <input name="college" value={form.college} onChange={handleChange} placeholder="College Name" />
            </div>

            <div className="input-group">
              <label>Branch</label>
              <input name="branch" value={form.branch} onChange={handleChange} placeholder="e.g. Computer Science" />
            </div>

            <div className="input-group">
              <label>CGPA</label>
              <input name="cgpa" value={form.cgpa} onChange={handleChange} placeholder="Current CGPA" />
            </div>

            <div className="input-group">
              <label>12th Marks (%)</label>
              <input name="twelfthMarks" value={form.twelfthMarks} onChange={handleChange} placeholder="Percentage" />
            </div>
          </div>

          <div className="input-group full-width">
            <label>Skills (comma separated)</label>
            <input name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node, Express..." />
          </div>

          <div className="input-group full-width">
            <label>Upload Resume (PDF)</label>
            <div className="file-input-wrapper">
              <input type="file" accept=".pdf" onChange={handleFile} />
            </div>
          </div>

          <button type="submit" className="save-btn">
            Save Profile Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;