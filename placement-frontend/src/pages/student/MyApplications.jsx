import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { BriefcaseBusiness, CalendarDays, Eye, FileText, MessageSquareText, Target, Trophy, UserCheck, XCircle } from "../../components/dashboard/Icons";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../../config/api";
import { CareerShell, EmptyState, GlassCard, GradientButton, LoadingGrid, SkillBadges } from "../../components/dashboard/CareerUI";
import { authHeaders, formatDate } from "../../components/dashboard/CareerUtils";
import "./career-actions.css";

const filters = [
  ["all", "All Applications"], ["active", "Active"], ["Selected", "Selected"], ["Rejected", "Rejected"], ["interviews", "Interviews"],
];
const stages = ["Applied", "Under Review", "Shortlisted", "Interview Scheduled", "Selected", "Rejected"];

function getJob(app) { return app.jobId || app.job || {}; }
function getCompany(job) { return job.company?.name || job.postedBy?.fullName || "PlacementHub Partner"; }
function statusIndex(status) { const index = stages.indexOf(status); return index >= 0 ? index : 0; }

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ totalApplications: 0, shortlistedCount: 0, interviewCount: 0, offersReceived: 0, successRate: 0 });
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadApplications = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data } = await axios.get(getApiUrl(`/api/applications?status=${activeFilter}`), { headers: authHeaders() });
      setApplications(data.applications || data || []);
      setStats((current) => data.stats || current);
    } catch (err) { setError(err.response?.data?.msg || "Unable to load applications."); }
    finally { setLoading(false); }
  }, [activeFilter]);

  useEffect(() => { loadApplications(); }, [loadApplications]);

  const withdraw = async (applicationId) => {
    if (!window.confirm("Withdraw this application?")) return;
    setBusy(applicationId); setError("");
    try { await axios.delete(getApiUrl(`/api/applications/${applicationId}`), { headers: authHeaders() }); await loadApplications(); }
    catch (err) { setError(err.response?.data?.msg || "Unable to withdraw application."); }
    finally { setBusy(""); }
  };

  return (
    <CareerShell eyebrow="Career Actions · My Applications" title="Track every opportunity" description="Follow applications from submission to interviews and offers with recruiter updates in one clean pipeline." action={<GradientButton onClick={() => navigate("/jobs")}><BriefcaseBusiness size={17} /> Browse More Jobs</GradientButton>}>
      <section className="stats-row">
        <Stat icon={<BriefcaseBusiness />} label="Total Applications" value={stats.totalApplications} />
        <Stat icon={<Target />} label="Shortlisted" value={stats.shortlistedCount} />
        <Stat icon={<CalendarDays />} label="Interviews" value={stats.interviewCount} />
        <Stat icon={<Trophy />} label="Offers Received" value={stats.offersReceived} />
        <Stat icon={<UserCheck />} label="Success Rate" value={`${stats.successRate || 0}%`} />
      </section>
      <div className="application-toolbar">{filters.map(([key, label]) => <button key={key} className={activeFilter === key ? "active" : ""} onClick={() => setActiveFilter(key)}>{label}</button>)}</div>
      {error ? <div className="error-banner">{error}</div> : null}
      {loading ? <LoadingGrid count={4} /> : applications.length === 0 ? <EmptyState icon={<FileText />} title="No applications found" description="Apply to jobs to see timelines, recruiter notes, interview schedules, and outcomes here." action={<GradientButton onClick={() => navigate("/jobs")}>Browse Jobs</GradientButton>} /> : (
        <div className="application-list">
          {applications.map((app) => <ApplicationCard key={app._id} app={app} navigate={navigate} withdraw={withdraw} busy={busy === app._id} />)}
        </div>
      )}
    </CareerShell>
  );
}

function Stat({ icon, label, value }) { return <div className="stat-tile"><div style={{ color: "#4f46e5" }}>{icon}</div><strong>{value}</strong><span>{label}</span></div>; }

function ApplicationCard({ app, navigate, withdraw, busy }) {
  const job = getJob(app);
  const index = statusIndex(app.status);
  const logo = job.company?.logo;
  const submittedResume = app.resumeUrl ? (app.resumeUrl.startsWith("http") ? app.resumeUrl : getApiUrl(app.resumeUrl)) : "";
  return (
    <GlassCard className="application-card">
      <div>
        <div className="job-card-header" style={{ justifyContent: "flex-start" }}>
          <div className="company-logo">{logo ? <img src={logo} alt="" /> : getCompany(job).charAt(0)}</div>
          <div><h2 className="job-title">{job.title || "Role unavailable"}</h2><p className="job-company">{getCompany(job)} · Applied {formatDate(app.appliedAt || app.createdAt)}</p></div>
        </div>
        <div style={{ marginTop: 14 }}><SkillBadges skills={job.skills || []} limit={5} /></div>
      </div>
      <div>
        <span className="status-badge">{app.status}</span>
        <div className="timeline" style={{ marginTop: 14 }}>{stages.map((stage, i) => <span className={`timeline-step ${i <= index && app.status !== "Rejected" ? "done" : ""}`} title={stage} key={stage} />)}</div>
        <p className="notes"><MessageSquareText size={15} /> {app.recruiterNotes || "No recruiter notes yet."}</p>
        {app.interviewDate ? <p className="notes"><CalendarDays size={15} /> Interview: {formatDate(app.interviewDate)}</p> : null}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button className="ghost-btn" onClick={() => navigate(`/job/${job._id}`)}><Eye size={16} /> View Job</button>
        {submittedResume ? <a className="ghost-btn" href={submittedResume} target="_blank" rel="noreferrer"><FileText size={16} /> View Resume Submitted</a> : <button className="ghost-btn" disabled><FileText size={16} /> No Resume</button>}
        {!['Selected', 'Rejected', 'Withdrawn'].includes(app.status) ? <button className="danger-btn" disabled={busy} onClick={() => withdraw(app._id)}><XCircle size={16} /> {busy ? "Withdrawing..." : "Withdraw Application"}</button> : null}
      </div>
    </GlassCard>
  );
}
