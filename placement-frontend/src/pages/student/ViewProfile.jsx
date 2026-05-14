import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Download, Eye, FileText, Github, Globe, Linkedin, Plus, Save, ShieldCheck, Upload, UserRound } from "../../components/dashboard/Icons";
import { getApiUrl } from "../../config/api";
import { CareerShell, EmptyState, GlassCard, GradientButton, LoadingGrid, SkillBadges } from "../../components/dashboard/CareerUI";
import { authHeaders } from "../../components/dashboard/CareerUtils";
import "./career-actions.css";

const sections = ["Personal", "Education", "Skills", "Projects", "Experience", "Certifications", "Resume", "Social"];
const emptyItem = { title: "", description: "", technologies: "", link: "", company: "", role: "", duration: "", issuer: "", year: "", institution: "", degree: "", branch: "", score: "" };

export default function ViewProfile() {
  const [active, setActive] = useState("Personal");
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [insights, setInsights] = useState({ completion: 0, missingSections: [], suggestions: [], atsScore: 0 });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);

  const resumeHref = profile?.resumeUrl ? (profile.resumeUrl.startsWith("http") ? profile.resumeUrl : getApiUrl(profile.resumeUrl)) : "";
  const photoHref = profile?.photoUrl ? (profile.photoUrl.startsWith("http") ? profile.photoUrl : getApiUrl(profile.photoUrl)) : "";

  const form = useMemo(() => ({
    fullName: profile?.fullName || user?.fullName || "",
    headline: profile?.headline || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
    college: profile?.college || "",
    branch: profile?.branch || "",
    cgpa: profile?.cgpa || "",
    twelfthMarks: profile?.twelfthMarks || "",
    skills: (profile?.skills || []).join(", "),
    linkedin: profile?.socialLinks?.linkedin || "",
    github: profile?.socialLinks?.github || "",
    portfolio: profile?.socialLinks?.portfolio || "",
    education: profile?.education || [],
    projects: profile?.projects || [],
    experience: profile?.experience || [],
    certifications: profile?.certifications || [],
  }), [profile, user]);

  const [draft, setDraft] = useState(form);
  useEffect(() => setDraft(form), [form]);

  const loadProfile = async () => {
    setLoading(true); setError("");
    try {
      const { data } = await axios.get(getApiUrl("/api/profile"), { headers: authHeaders() });
      setUser(data.user); setProfile(data.profile || {}); setInsights(data.insights || {});
    } catch (err) { setError(err.response?.data?.msg || "Unable to load profile."); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadProfile(); }, []);

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const updateList = (key, index, field, value) => setDraft((current) => ({ ...current, [key]: current[key].map((item, i) => i === index ? { ...item, [field]: value } : item) }));
  const addList = (key) => setDraft((current) => ({ ...current, [key]: [...(current[key] || []), { ...emptyItem }] }));
  const removeList = (key, index) => setDraft((current) => ({ ...current, [key]: current[key].filter((_, i) => i !== index) }));

  const saveProfile = async () => {
    setSaving(true); setError("");
    try {
      const payload = { ...draft, education: JSON.stringify(draft.education), projects: JSON.stringify(draft.projects), experience: JSON.stringify(draft.experience), certifications: JSON.stringify(draft.certifications) };
      const { data } = await axios.put(getApiUrl("/api/profile"), payload, { headers: authHeaders() });
      setProfile(data.profile); setInsights(data.insights || insights);
    } catch (err) { setError(err.response?.data?.msg || "Unable to save profile."); }
    finally { setSaving(false); }
  };

  const uploadFile = async (type, file) => {
    if (!file) return;
    setSaving(true); setError("");
    try {
      const body = new FormData();
      body.append(type === "resume" ? "resume" : "photo", file);
      const endpoint = type === "resume" ? "/api/profile/upload-resume" : "/api/profile/upload-photo";
      const { data } = await axios.post(getApiUrl(endpoint), body, { headers: { ...authHeaders(), "Content-Type": "multipart/form-data" } });
      setProfile(data.profile); if (data.insights) setInsights(data.insights);
    } catch (err) { setError(err.response?.data?.msg || "Upload failed."); }
    finally { setSaving(false); }
  };

  if (loading) return <CareerShell eyebrow="Career Actions · View Profile" title="Preparing your placement profile" description="Loading your latest profile data."><LoadingGrid count={3} /></CareerShell>;

  return (
    <CareerShell eyebrow="Career Actions · View Profile" title="Build a placement-ready profile" description="Manage resume, skills, projects, internships, education, and social proof from one polished workspace." action={<GradientButton onClick={saveProfile} disabled={saving}><Save size={17} /> {saving ? "Saving..." : "Save Changes"}</GradientButton>}>
      {error ? <div className="error-banner">{error}</div> : null}
      <div className="profile-layout">
        <aside className="profile-panel">
          <div className="profile-avatar-large">{photoHref ? <img src={photoHref} alt="Profile" /> : (draft.fullName || "S").charAt(0)}</div>
          <h2>{draft.fullName || "Student"}</h2><p className="notes">{draft.headline || draft.college || "Aspiring professional"}</p>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${insights.completion || 0}%` }} /></div>
          <strong>{insights.completion || 0}% profile complete</strong>
          <p className="notes"><ShieldCheck size={15} /> ATS score indicator: <strong>{insights.atsScore || 0}/100</strong></p>
          <input id="photo-upload" type="file" accept="image/*" hidden onChange={(e) => uploadFile("photo", e.target.files?.[0])} />
          <label htmlFor="photo-upload" className="ghost-btn" style={{ marginTop: 14, display: "inline-flex" }}><Upload size={16} /> Upload photo</label>
          <h3 style={{ marginTop: 24 }}>Missing sections</h3>
          {(insights.missingSections || []).length ? <SkillBadges skills={insights.missingSections} /> : <p className="status-badge">Profile is complete</p>}
          <h3 style={{ marginTop: 24 }}>Suggestions</h3>
          {(insights.suggestions || []).map((item) => <p className="notes" key={item}>• {item}</p>)}
        </aside>

        <section className="profile-panel">
          <div className="section-tabs">{sections.map((section) => <button key={section} className={active === section ? "active" : ""} onClick={() => setActive(section)}>{section}</button>)}</div>
          {active === "Personal" && <PersonalForm draft={draft} update={update} user={user} />}
          {active === "Education" && <RepeatEditor title="Education" listKey="education" fields={["institution", "degree", "branch", "score"]} draft={draft} addList={addList} updateList={updateList} removeList={removeList} />}
          {active === "Skills" && <div><label className="form-field"><span>Skills and technologies</span><input className="career-input" value={draft.skills} onChange={(e) => update("skills", e.target.value)} placeholder="React, Node.js, MongoDB, Python" /></label><h3>Detected skill badges</h3><SkillBadges skills={draft.skills.split(",").map((s) => s.trim()).filter(Boolean)} /><h3>Resume parser results</h3><SkillBadges skills={profile?.parsedResumeSkills || []} /></div>}
          {active === "Projects" && <RepeatEditor title="Projects" listKey="projects" fields={["title", "description", "technologies", "link"]} draft={draft} addList={addList} updateList={updateList} removeList={removeList} />}
          {active === "Experience" && <RepeatEditor title="Internship Experience" listKey="experience" fields={["role", "company", "duration", "description"]} draft={draft} addList={addList} updateList={updateList} removeList={removeList} />}
          {active === "Certifications" && <RepeatEditor title="Certifications" listKey="certifications" fields={["title", "issuer", "year", "link"]} draft={draft} addList={addList} updateList={updateList} removeList={removeList} />}
          {active === "Resume" && <ResumePanel resumeHref={resumeHref} profile={profile} uploadFile={uploadFile} preview={preview} setPreview={setPreview} />}
          {active === "Social" && <SocialForm draft={draft} update={update} />}
        </section>
      </div>

      {preview ? <PublicPreview draft={draft} photoHref={photoHref} resumeHref={resumeHref} onClose={() => setPreview(false)} /> : null}
    </CareerShell>
  );
}

function PersonalForm({ draft, update, user }) {
  return <div className="form-grid">{[["fullName", "Full name"], ["headline", "Professional headline"], ["phone", "Phone"], ["location", "Location"], ["college", "College"], ["branch", "Branch"], ["cgpa", "CGPA"], ["twelfthMarks", "12th marks"]].map(([key, label]) => <label className="form-field" key={key}><span>{label}</span><input className="career-input" value={draft[key] || ""} onChange={(e) => update(key, e.target.value)} /></label>)}<label className="form-field"><span>Email</span><input className="career-input" value={user?.email || ""} disabled /></label></div>;
}

function RepeatEditor({ title, listKey, fields, draft, addList, updateList, removeList }) {
  return <div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><h2>{title}</h2><button className="ghost-btn" onClick={() => addList(listKey)}><Plus size={16} /> Add</button></div>{(draft[listKey] || []).length === 0 ? <EmptyState icon={<Plus />} title={`No ${title.toLowerCase()} added`} description="Add concise, measurable details to improve placement chances." action={<GradientButton onClick={() => addList(listKey)}>Add {title}</GradientButton>} /> : (draft[listKey] || []).map((item, index) => <div className="repeat-card" key={index}><div className="form-grid">{fields.map((field) => <label className="form-field" key={field}><span>{field}</span>{field === "description" ? <textarea className="career-textarea" value={item[field] || ""} onChange={(e) => updateList(listKey, index, field, e.target.value)} /> : <input className="career-input" value={item[field] || ""} onChange={(e) => updateList(listKey, index, field, e.target.value)} />}</label>)}</div><button className="danger-btn" onClick={() => removeList(listKey, index)}>Remove</button></div>)}</div>;
}

function ResumePanel({ resumeHref, profile, uploadFile, preview, setPreview }) {
  return <div><h2>Resume</h2><p className="notes">Upload a PDF, preview it, download it, and let PlacementHub detect likely skills for recruiter matching.</p><input id="resume-upload" type="file" accept="application/pdf" hidden onChange={(e) => uploadFile("resume", e.target.files?.[0])} /><label htmlFor="resume-upload" className="gradient-btn"><FileText size={17} /> Upload resume PDF</label>{resumeHref ? <div style={{ marginTop: 18 }}><p><strong>{profile?.resumeOriginalName || "Resume.pdf"}</strong></p><div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "12px 0" }}><button className="ghost-btn" onClick={() => setPreview(!preview)}><Eye size={16} /> Public preview</button><a className="ghost-btn" href={resumeHref} download><Download size={16} /> Download resume</a></div><iframe title="Resume preview" src={resumeHref} width="100%" height="420" style={{ border: "1px solid #e2e8f0", borderRadius: 20 }} /></div> : <EmptyState icon={<FileText />} title="No resume uploaded" description="Upload a PDF resume to unlock ATS score and recruiter-ready previews." />}</div>;
}

function SocialForm({ draft, update }) {
  const fields = [
    ["linkedin", "LinkedIn", <Linkedin size={14} />],
    ["github", "GitHub", <Github size={14} />],
    ["portfolio", "Portfolio Website", <Globe size={14} />],
  ];
  return <div className="form-grid">{fields.map(([key, label, icon]) => <label className="form-field" key={key}><span>{icon} {label}</span><input className="career-input" value={draft[key] || ""} onChange={(e) => update(key, e.target.value)} placeholder="https://" /></label>)}</div>;
}

function PublicPreview({ draft, photoHref, resumeHref, onClose }) { return <div className="detail-overlay" onClick={onClose}><section className="detail-modal" onClick={(e) => e.stopPropagation()}><div className="modal-head"><div style={{ display: "flex", gap: 16, alignItems: "center" }}><div className="profile-avatar-large" style={{ width: 74, height: 74 }}>{photoHref ? <img src={photoHref} alt="" /> : <UserRound />}</div><div><h2>{draft.fullName || "Student"}</h2><p>{draft.headline || draft.college}</p></div></div><button className="modal-close" onClick={onClose}>×</button></div><SkillBadges skills={draft.skills.split(",").map((s) => s.trim()).filter(Boolean)} />{resumeHref ? <iframe title="Public resume" src={resumeHref} width="100%" height="360" style={{ marginTop: 18, borderRadius: 20, border: "1px solid #e2e8f0" }} /> : null}</section></div>; }
