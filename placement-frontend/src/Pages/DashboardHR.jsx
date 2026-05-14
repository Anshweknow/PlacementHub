import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../config/api";
import { useTheme } from "../Context/useTheme";
import "./HRDashboard.css";

const SKILL_SUGGESTIONS = [
  "React",
  "Node.js",
  "Python",
  "MongoDB",
  "AWS",
  "Docker",
  "Machine Learning",
  "Data Science",
  "TypeScript",
  "SQL",
  "Java",
  "Spring Boot",
  "DevOps",
  "Figma",
  "Cybersecurity",
];

const fallbackCandidates = [
  {
    id: "demo-1",
    fullName: "Ansh Kulshreshtha",
    college: "Delhi Technical Campus",
    degree: "B.Tech Computer Science",
    gpa: "8.9",
    matchScore: 94,
    resumeScore: 91,
    assessmentScore: 88,
    skills: ["React", "Node.js", "MongoDB", "AWS"],
    matchedSkills: ["React", "Node.js", "MongoDB"],
    languages: ["English", "Hindi"],
    availability: "Immediate",
    location: "Delhi NCR",
    resumeUrl: "",
  },
  {
    id: "demo-2",
    fullName: "Meera Sharma",
    college: "Pune Institute of Technology",
    degree: "B.Tech AI & Data Science",
    gpa: "9.1",
    matchScore: 89,
    resumeScore: 86,
    assessmentScore: 92,
    skills: ["Python", "Machine Learning", "SQL", "AWS"],
    matchedSkills: ["Python", "Machine Learning", "SQL"],
    languages: ["English", "Marathi"],
    availability: "2 weeks",
    location: "Pune",
    resumeUrl: "",
  },
  {
    id: "demo-3",
    fullName: "Rahul Nair",
    college: "SRM University",
    degree: "B.Tech Information Technology",
    gpa: "8.5",
    matchScore: 82,
    resumeScore: 80,
    assessmentScore: 84,
    skills: ["Java", "Spring Boot", "Docker", "SQL"],
    matchedSkills: ["Java", "Docker", "SQL"],
    languages: ["English", "Malayalam"],
    availability: "30 days",
    location: "Chennai",
    resumeUrl: "",
  },
];

const fallbackDashboard = {
  company: { name: "PlacementHub Talent Cloud", industry: "AI Recruitment", website: "placementhub.ai", about: "Hire verified campus talent faster with AI-powered matching." },
  metrics: { activeJobs: 14, totalApplications: 1248, candidatesShortlisted: 186, interviewsScheduled: 42, offersSent: 18, hiringSuccessRate: 76 },
  jobs: [
    { _id: "job-1", title: "Frontend Engineer Intern", department: "Engineering", status: "active", openings: 6, deadline: new Date(Date.now() + 12 * 86400000).toISOString(), createdAt: new Date().toISOString(), skills: ["React", "TypeScript"] },
    { _id: "job-2", title: "Data Analyst Trainee", department: "Analytics", status: "paused", openings: 4, deadline: new Date(Date.now() + 20 * 86400000).toISOString(), createdAt: new Date().toISOString(), skills: ["Python", "SQL"] },
    { _id: "job-3", title: "Cloud DevOps Associate", department: "Platform", status: "active", openings: 3, deadline: new Date(Date.now() + 8 * 86400000).toISOString(), createdAt: new Date().toISOString(), skills: ["AWS", "Docker"] },
  ],
  applications: [],
  interviews: [],
  messages: [],
  offers: [],
  analytics: {
    monthlyApplications: [
      { month: "Nov", applications: 18 },
      { month: "Dec", applications: 28 },
      { month: "Jan", applications: 35 },
      { month: "Feb", applications: 42 },
      { month: "Mar", applications: 56 },
      { month: "Apr", applications: 68 },
      { month: "May", applications: 82 },
    ],
    sourceMix: [
      { name: "PlacementHub AI", value: 52 },
      { name: "Campus Drives", value: 24 },
      { name: "Referrals", value: 14 },
      { name: "Direct", value: 10 },
    ],
    funnel: ["Applied", "Under Review", "Shortlisted", "Interview Scheduled", "Selected", "Rejected"].map((stage, index) => ({ stage, count: [420, 260, 186, 92, 44, 36][index] })),
    skillDemand: ["React", "Python", "AWS", "SQL", "Node.js", "ML"].map((skill, index) => ({ skill, demand: [36, 32, 28, 25, 22, 18][index] })),
  },
  activity: [
    { type: "candidate", label: "AI matched 24 candidates", detail: "Frontend Engineer Intern", date: new Date().toISOString() },
    { type: "offer", label: "Offer accepted", detail: "SDE Trainee", date: new Date(Date.now() - 3600000).toISOString() },
    { type: "interview", label: "Interview scheduled", detail: "Google Meet at 3:30 PM", date: new Date(Date.now() - 7200000).toISOString() },
  ],
};

const apiHeaders = { "x-trial-role": "hr" };

const StatSparkline = ({ values = [2, 5, 4, 7, 9, 8, 11] }) => {
  const max = Math.max(...values);
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${34 - (value / max) * 28}`).join(" ");
  return (
    <svg className="hr-sparkline" viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const BarChart = ({ data = [], labelKey, valueKey }) => {
  const max = Math.max(...data.map((item) => Number(item[valueKey]) || 0), 1);
  return (
    <div className="hr-bar-chart">
      {data.map((item) => (
        <div className="hr-bar-row" key={item[labelKey]}>
          <span>{item[labelKey]}</span>
          <div className="hr-bar-track"><div style={{ width: `${((Number(item[valueKey]) || 0) / max) * 100}%` }} /></div>
          <strong>{item[valueKey]}</strong>
        </div>
      ))}
    </div>
  );
};

const LineChart = ({ data = [] }) => {
  const max = Math.max(...data.map((item) => item.applications), 1);
  const points = data.map((item, index) => `${40 + index * 70},${180 - (item.applications / max) * 130}`).join(" ");
  return (
    <svg className="hr-line-chart" viewBox="0 0 520 220" role="img" aria-label="Applications over time chart">
      <defs>
        <linearGradient id="lineGradient" x1="0" x2="1"><stop stopColor="#6366f1" /><stop offset="1" stopColor="#ec4899" /></linearGradient>
      </defs>
      {[40, 80, 120, 160].map((y) => <line key={y} x1="30" x2="500" y1={y} y2={y} stroke="rgba(148,163,184,.22)" />)}
      <polyline points={points} fill="none" stroke="url(#lineGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((item, index) => <text key={item.month} x={40 + index * 70} y="210" textAnchor="middle">{item.month}</text>)}
    </svg>
  );
};

const DashboardHR = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModule, setActiveModule] = useState("Dashboard Overview");
  const [dashboard, setDashboard] = useState(fallbackDashboard);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState(["React", "Node.js", "MongoDB"]);
  const [minScore, setMinScore] = useState(70);
  const [selectedJob, setSelectedJob] = useState("job-1");
  const [filters, setFilters] = useState({ gpa: "", graduationYear: "2026", location: "", experience: "", atsScore: "" });
  const [candidates, setCandidates] = useState(fallbackCandidates);
  const [jobDraft, setJobDraft] = useState({ title: "", department: "Engineering", location: "Hybrid", jobType: "Full-Time", salary: "₹8 - 12 LPA", openings: 3, deadline: "", skills: "React, Node.js", description: "", responsibilities: "Build scalable product features", eligibility: "CGPA 7.0+, 2026 batch", assessmentDomain: "Full Stack", autoGenerateQuiz: true, hiringStages: "Applied, Under Review, Shortlisted, Interview Scheduled, Selected" });
  const [offerDraft, setOfferDraft] = useState({ candidateName: "", role: "Software Engineer Trainee", salary: "₹10 LPA", joiningDate: "" });
  const [messageDraft, setMessageDraft] = useState("Hi, we loved your profile and would like to invite you for the next round.");

  useEffect(() => {
    let ignore = false;
    const loadDashboard = async () => {
      try {
        const { data } = await axios.get(getApiUrl("/api/hr/dashboard"), { headers: apiHeaders });
        if (!ignore) setDashboard({ ...fallbackDashboard, ...data, analytics: { ...fallbackDashboard.analytics, ...(data.analytics || {}) } });
      } catch {
        if (!ignore) setDashboard(fallbackDashboard);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadDashboard();
    return () => { ignore = true; };
  }, []);

  const suggestions = useMemo(() => input.trim() ? SKILL_SUGGESTIONS.filter((skill) => skill.toLowerCase().includes(input.toLowerCase()) && !selectedSkills.includes(skill)) : [], [input, selectedSkills]);
  const pipeline = useMemo(() => {
    const stages = ["Applied", "Under Review", "Shortlisted", "Interview Scheduled", "Selected", "Rejected"];
    return stages.map((stage, index) => ({ stage, cards: fallbackCandidates.slice(0, Math.max(1, 3 - Math.floor(index / 2))).map((candidate, cardIndex) => ({ ...candidate, matchScore: candidate.matchScore - index * 3 - cardIndex, appliedAt: `${index + cardIndex + 1}d ago`, notes: stage === "Rejected" ? "Skill mismatch" : "Strong campus profile" })) }));
  }, []);

  const addSkill = (skill) => {
    setSelectedSkills((current) => [...current, skill]);
    setInput("");
  };

  const findCandidates = async () => {
    try {
      const { data } = await axios.post(getApiUrl("/api/hr/match-candidates"), { skills: selectedSkills, minScore, jobId: selectedJob, filters }, { headers: apiHeaders });
      setCandidates(data.candidates?.length ? data.candidates : fallbackCandidates);
    } catch {
      setCandidates(fallbackCandidates.filter((candidate) => candidate.matchScore >= minScore - 10));
    }
    setActiveModule("AI Candidate Matcher");
  };

  const publishJob = async (status = "active") => {
    const payload = { ...jobDraft, status, skills: jobDraft.skills.split(",").map((skill) => skill.trim()), hiringStages: jobDraft.hiringStages.split(",").map((stage) => stage.trim()) };
    try {
      const { data } = await axios.post(getApiUrl("/api/jobs"), payload, { headers: apiHeaders });
      setDashboard((current) => ({ ...current, jobs: [data.job, ...(current.jobs || [])] }));
    } catch {
      setDashboard((current) => ({ ...current, jobs: [{ ...payload, _id: Date.now().toString(), createdAt: new Date().toISOString() }, ...(current.jobs || [])] }));
    }
    setActiveModule("Manage Jobs");
  };

  const createOffer = async () => {
    const payload = { ...offerDraft, candidateId: candidates[0]?.id || "demo-1" };
    try {
      const { data } = await axios.post(getApiUrl("/api/hr/offers"), payload, { headers: apiHeaders });
      setDashboard((current) => ({ ...current, offers: [data.offer, ...(current.offers || [])] }));
    } catch {
      setDashboard((current) => ({ ...current, offers: [{ ...payload, _id: Date.now().toString(), status: "Draft" }, ...(current.offers || [])] }));
    }
  };

  const exportCsv = () => {
    const rows = [["Name", "College", "Match", "Skills"], ...candidates.map((candidate) => [candidate.fullName, candidate.college, candidate.matchScore, candidate.skills?.join(" | ")])];
    const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "placementhub-candidates.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const navItems = ["Dashboard Overview", "AI Candidate Matcher", "Post Job", "Manage Jobs", "Applications", "Shortlisted Candidates", "Interview Scheduler", "Messages", "Offer Letters", "Analytics", "Company Profile", "Settings"];
  const metrics = [
    ["Active Jobs", dashboard.metrics.activeJobs, "+12%", "💼"],
    ["Total Applications", dashboard.metrics.totalApplications, "+28%", "📥"],
    ["Candidates Shortlisted", dashboard.metrics.candidatesShortlisted, "+18%", "⭐"],
    ["Interviews Scheduled", dashboard.metrics.interviewsScheduled, "+9%", "🗓️"],
    ["Offers Sent", dashboard.metrics.offersSent, "+6%", "📄"],
    ["Hiring Success Rate", `${dashboard.metrics.hiringSuccessRate}%`, "+4%", "🏆"],
  ];

  return (
    <div className="hr-shell">
      <aside className={`hr-sidebar ${sidebarOpen ? "" : "is-collapsed"}`}>
        <button className="hr-collapse" onClick={() => setSidebarOpen((open) => !open)}>{sidebarOpen ? "←" : "→"}</button>
        <div className="hr-brand"><span>PH</span><div><strong>PlacementHub</strong><small>Recruiter ATS</small></div></div>
        <nav>{navItems.map((item) => <button key={item} className={activeModule === item ? "active" : ""} onClick={() => setActiveModule(item)}><span>{item.split(" ")[0]}</span>{sidebarOpen && item}</button>)}</nav>
      </aside>

      <main className="hr-main">
        <header className="hr-topbar">
          <div className="hr-search"><span>⌕</span><input placeholder="Search candidates, jobs, skills, notes..." /></div>
          <button className="hr-icon-btn">🔔<b>7</b></button>
          <button className="hr-icon-btn">📅</button>
          <button className="hr-theme" onClick={toggleTheme}>{theme === "light" ? "🌙 Dark" : "☀️ Light"}</button>
          <div className="hr-company-logo">{dashboard.company.name?.slice(0, 2).toUpperCase()}</div>
          <div className="hr-avatar"><span>AR</span><div><strong>Recruiter</strong><small>Talent Lead</small></div></div>
        </header>

        <section className="hr-hero">
          <div>
            <p className="hr-eyebrow">AI Talent Intelligence</p>
            <h1>Find Matching Candidates 🎯</h1>
            <p>Use AI-powered skill matching to discover the most relevant student candidates instantly.</p>
            <div className="hr-skill-builder">
              <div className="hr-tags">{selectedSkills.map((skill) => <span key={skill}>{skill}<button onClick={() => setSelectedSkills((items) => items.filter((item) => item !== skill))}>×</button></span>)}</div>
              <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Add skills: React, Python, AWS..." />
              {!!suggestions.length && <div className="hr-suggestions">{suggestions.map((skill) => <button key={skill} onClick={() => addSkill(skill)}>{skill}</button>)}</div>}
            </div>
          </div>
          <div className="hr-hero-panel">
            <label>Job requisition<select value={selectedJob} onChange={(event) => setSelectedJob(event.target.value)}>{dashboard.jobs.map((job) => <option value={job._id} key={job._id}>{job.title}</option>)}</select></label>
            <label>Minimum match score <strong>{minScore}%</strong><input type="range" min="40" max="95" value={minScore} onChange={(event) => setMinScore(Number(event.target.value))} /></label>
            <div className="hr-quick-actions"><button onClick={findCandidates}>Find Candidates</button><button onClick={() => setActiveModule("Post Job")}>+ Post Job</button><button>Import JD</button><button onClick={exportCsv}>Export Results</button></div>
          </div>
        </section>

        <section className="hr-kpis">{metrics.map(([label, value, change, icon], index) => <article className="hr-kpi" key={label} style={{ animationDelay: `${index * 70}ms` }}><div><span>{icon}</span><small>{change} vs last month</small></div><h3>{value}</h3><p>{label}</p><StatSparkline values={[2 + index, 4 + index, 3 + index, 7 + index, 8 + index, 10 + index]} /></article>)}</section>

        {loading && <div className="hr-loading">Syncing recruiter command center...</div>}

        <section className="hr-grid">
          <article className="hr-card hr-wide" id="candidate-matcher">
            <div className="hr-section-head"><div><p className="hr-eyebrow">AI Candidate Matcher</p><h2>Ranked student talent</h2></div><button onClick={findCandidates}>Refresh matches</button></div>
            <div className="hr-filter-grid">{Object.keys(filters).map((key) => <input key={key} value={filters[key]} onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))} placeholder={key.replace(/([A-Z])/g, " $1")} />)}</div>
            <div className="hr-candidates">{candidates.map((candidate) => <div className="hr-candidate" key={candidate.id}><div className="hr-candidate-top"><div className="hr-photo">{candidate.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><div><h3>{candidate.fullName}</h3><p>{candidate.college} · {candidate.degree}</p></div><strong>{candidate.matchScore}%</strong></div><div className="hr-badges">{(candidate.skills || []).slice(0, 5).map((skill) => <span key={skill}>{skill}</span>)}</div><dl><div><dt>GPA</dt><dd>{candidate.gpa}</dd></div><div><dt>Resume</dt><dd>{candidate.resumeScore}%</dd></div><div><dt>Assessment</dt><dd>{candidate.assessmentScore}%</dd></div><div><dt>Availability</dt><dd>{candidate.availability}</dd></div></dl><div className="hr-card-actions"><button onClick={() => navigate(`/profile/${candidate.id}`)}>View Profile</button><button onClick={() => candidate.resumeUrl ? window.open(candidate.resumeUrl, "_blank") : null}>Download Resume</button><button>Shortlist</button><button>Message</button><button>Schedule Interview</button><button>Compare</button></div></div>)}</div>
          </article>

          <article className="hr-card" id="post-job"><div className="hr-section-head"><div><p className="hr-eyebrow">Post Job</p><h2>Advanced requisition builder</h2></div></div><div className="hr-form-grid">{["title", "department", "location", "jobType", "salary", "openings", "deadline", "skills", "assessmentDomain", "eligibility"].map((field) => <input key={field} type={field === "deadline" ? "date" : "text"} value={jobDraft[field]} onChange={(event) => setJobDraft((current) => ({ ...current, [field]: event.target.value }))} placeholder={field} />)}<textarea value={jobDraft.description} onChange={(event) => setJobDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Description" /><textarea value={jobDraft.responsibilities} onChange={(event) => setJobDraft((current) => ({ ...current, responsibilities: event.target.value }))} placeholder="Responsibilities" /></div><label className="hr-check"><input type="checkbox" checked={jobDraft.autoGenerateQuiz} onChange={(event) => setJobDraft((current) => ({ ...current, autoGenerateQuiz: event.target.checked }))} /> Auto-generate quiz from required skills</label><div className="hr-card-actions"><button onClick={() => publishJob("draft")}>Save Draft</button><button onClick={() => publishJob("active")}>Publish Job</button><button>Preview Job</button></div></article>

          <article className="hr-card" id="manage-jobs"><div className="hr-section-head"><div><p className="hr-eyebrow">Manage Jobs</p><h2>Open roles</h2></div></div><div className="hr-table">{dashboard.jobs.map((job) => <div className="hr-table-row" key={job._id}><div><strong>{job.title}</strong><small>{job.department || "Hiring"} · {(job.skills || []).join(", ")}</small></div><span className={`status ${job.status}`}>{job.status}</span><span>{job.openings || 1} openings</span><span>{new Date(job.deadline || Date.now()).toLocaleDateString()}</span><div><button>Edit</button><button>Duplicate</button><button>Pause</button><button>Close</button><button>Delete</button><button>Analytics</button></div></div>)}</div></article>

          <article className="hr-card hr-wide" id="pipeline"><div className="hr-section-head"><div><p className="hr-eyebrow">Applications Pipeline</p><h2>Drag-ready hiring board</h2></div></div><div className="hr-kanban">{pipeline.map((column) => <div className="hr-kanban-column" key={column.stage}><h3>{column.stage}<span>{column.cards.length}</span></h3>{column.cards.map((card) => <div draggable className="hr-mini-card" key={`${column.stage}-${card.id}`}><strong>{card.fullName}</strong><p>{card.matchScore}% match · Resume {card.resumeScore}%</p><small>{card.appliedAt} · {card.notes}</small></div>)}</div>)}</div></article>

          <article className="hr-card" id="scheduler"><div className="hr-section-head"><div><p className="hr-eyebrow">Interview Scheduler</p><h2>Upcoming slots</h2></div><button>Send invitations</button></div><div className="hr-calendar">{Array.from({ length: 14 }).map((_, index) => <button className={index === 3 || index === 8 ? "selected" : ""} key={index}>{index + 14}<small>{index % 3 === 0 ? "2 slots" : "Open"}</small></button>)}</div><div className="hr-integrations"><span>Google Meet</span><span>Zoom</span><span>Microsoft Teams</span></div><textarea placeholder="Record interview feedback and scorecards..." /></article>

          <article className="hr-card" id="messages"><div className="hr-section-head"><div><p className="hr-eyebrow">Messages</p><h2>Recruiter inbox</h2></div><button>Bulk send</button></div><textarea value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} /><div className="hr-templates"><button>Interview reminder</button><button>Assessment invite</button><button>Offer follow-up</button></div><div className="hr-inbox">{["Meera Sharma", "Rahul Nair", "Ansh Kulshreshtha"].map((name) => <p key={name}><strong>{name}</strong><span>Candidate replied to your message</span></p>)}</div></article>

          <article className="hr-card" id="offers"><div className="hr-section-head"><div><p className="hr-eyebrow">Offer Letters</p><h2>Template generator</h2></div></div><div className="hr-form-grid">{Object.keys(offerDraft).map((field) => <input key={field} type={field === "joiningDate" ? "date" : "text"} value={offerDraft[field]} onChange={(event) => setOfferDraft((current) => ({ ...current, [field]: event.target.value }))} placeholder={field} />)}</div><div className="hr-card-actions"><button onClick={createOffer}>Generate Offer</button><button>Export PDF</button><button>Export DOCX</button></div></article>

          <article className="hr-card hr-wide" id="analytics"><div className="hr-section-head"><div><p className="hr-eyebrow">Analytics</p><h2>Hiring performance command center</h2></div><button onClick={exportCsv}>Export reports</button></div><div className="hr-analytics-grid"><div><h3>Applications over time</h3><LineChart data={dashboard.analytics.monthlyApplications} /></div><div><h3>Conversion funnel</h3><BarChart data={dashboard.analytics.funnel} labelKey="stage" valueKey="count" /></div><div><h3>Source of candidates</h3><BarChart data={dashboard.analytics.sourceMix} labelKey="name" valueKey="value" /></div><div><h3>Skill demand heatmap</h3><div className="hr-heatmap">{dashboard.analytics.skillDemand.map((item) => <span key={item.skill} style={{ opacity: Math.min(1, .45 + item.demand / 60) }}>{item.skill}<b>{item.demand}</b></span>)}</div></div></div></article>

          <article className="hr-card" id="company"><div className="hr-section-head"><div><p className="hr-eyebrow">Company Profile</p><h2>{dashboard.company.name}</h2></div></div><div className="hr-company-card"><div className="hr-company-mark">{dashboard.company.name?.slice(0, 2).toUpperCase()}</div><p>{dashboard.company.about}</p><span>{dashboard.company.industry}</span><span>{dashboard.company.website}</span></div><div className="hr-culture"><div /><div /><div /></div></article>

          <article className="hr-card" id="settings"><div className="hr-section-head"><div><p className="hr-eyebrow">Settings</p><h2>Workspace controls</h2></div></div>{["Dark/light theme", "Notification preferences", "Team members", "API keys", "Security settings", "Audit logs"].map((item) => <label className="hr-setting" key={item}><span>{item}</span><input type="checkbox" defaultChecked /></label>)}</article>
        </section>
      </main>
    </div>
  );
};

export default DashboardHR;
