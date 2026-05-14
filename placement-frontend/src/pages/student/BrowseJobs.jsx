import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Briefcase, Building2, CalendarClock, Heart, IndianRupee, MapPin, Search, SlidersHorizontal, Sparkles, Users } from "../../components/dashboard/Icons";
import { getApiUrl } from "../../config/api";
import { CareerShell, EmptyState, GlassCard, GradientButton, LoadingGrid, SkillBadges } from "../../components/dashboard/CareerUI";
import { authHeaders, formatDate } from "../../components/dashboard/CareerUtils";
import "./career-actions.css";

const initialFilters = { search: "", location: "", salaryMin: "", salaryMax: "", experienceLevel: "", jobType: "", skills: "", sort: "latest" };

function companyName(job) {
  return job.company?.name || job.postedBy?.fullName || "PlacementHub Partner";
}

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [busyJob, setBusyJob] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [error, setError] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: pagination.page, limit: 9 });
    Object.entries(filters).forEach(([key, value]) => value && params.set(key, value));
    return params.toString();
  }, [filters, pagination.page]);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(getApiUrl(`/api/jobs?${query}`), { headers: authHeaders() });
      setJobs(data.jobs || data || []);
      setPagination((current) => ({ ...current, ...(data.pagination || {}) }));
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load jobs right now.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const updateFilter = (key, value) => {
    setPagination((current) => ({ ...current, page: 1 }));
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const applyToJob = async (jobId) => {
    setBusyJob(jobId);
    try {
      await axios.post(getApiUrl(`/api/jobs/${jobId}/apply`), {}, { headers: authHeaders() });
      await loadJobs();
      if (selectedJob?._id === jobId) setSelectedJob((job) => ({ ...job, applied: true, applicationStatus: "Applied" }));
    } catch (err) {
      setError(err.response?.data?.msg || "Application could not be submitted.");
    } finally {
      setBusyJob("");
    }
  };

  const toggleSave = async (jobId) => {
    setBusyJob(jobId);
    try {
      const { data } = await axios.post(getApiUrl(`/api/jobs/${jobId}/save`), {}, { headers: authHeaders() });
      setJobs((current) => current.map((job) => job._id === jobId ? { ...job, saved: data.saved } : job));
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to update saved jobs.");
    } finally {
      setBusyJob("");
    }
  };

  const viewDetails = async (jobId) => {
    setBusyJob(jobId);
    try {
      const { data } = await axios.get(getApiUrl(`/api/jobs/${jobId}`), { headers: authHeaders() });
      setSelectedJob(data);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to open job details.");
    } finally {
      setBusyJob("");
    }
  };

  return (
    <CareerShell
      eyebrow="Career Actions · Browse Jobs"
      title="Discover premium opportunities"
      description="Search active jobs, match skills, save favorites, and apply with a placement-ready profile."
      action={<GradientButton onClick={() => updateFilter("sort", "relevant")}><Sparkles size={18} /> Most Relevant</GradientButton>}
    >
      <section className="career-filter-bar" aria-label="Job filters">
        <div style={{ position: "relative" }}>
          <Search size={17} style={{ position: "absolute", left: 13, top: 14, color: "#64748b" }} />
          <input className="career-input" style={{ paddingLeft: 40 }} placeholder="Search title, company, or skills" value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} />
        </div>
        <input className="career-input" placeholder="Location" value={filters.location} onChange={(e) => updateFilter("location", e.target.value)} />
        <input className="career-input" type="number" placeholder="Min salary" value={filters.salaryMin} onChange={(e) => updateFilter("salaryMin", e.target.value)} />
        <select className="career-select" value={filters.experienceLevel} onChange={(e) => updateFilter("experienceLevel", e.target.value)}>
          <option value="">Experience</option><option>Fresher</option><option>0-1 Years</option><option>1-3 Years</option><option>3+ Years</option>
        </select>
        <select className="career-select" value={filters.jobType} onChange={(e) => updateFilter("jobType", e.target.value)}>
          <option value="">Job type</option><option>Internship</option><option>Full-Time</option><option>Remote</option><option>Part-Time</option><option>Contract</option>
        </select>
        <select className="career-select" value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}>
          <option value="latest">Latest</option><option value="highestSalary">Highest Salary</option><option value="relevant">Most Relevant</option>
        </select>
        <input className="career-input" placeholder="Skills: React, Node" value={filters.skills} onChange={(e) => updateFilter("skills", e.target.value)} />
        <input className="career-input" type="number" placeholder="Max salary" value={filters.salaryMax} onChange={(e) => updateFilter("salaryMax", e.target.value)} />
        <button className="ghost-btn" onClick={() => { setFilters(initialFilters); setPagination((p) => ({ ...p, page: 1 })); }}><SlidersHorizontal size={16} /> Reset filters</button>
      </section>

      {error ? <div className="error-banner">{error}</div> : null}
      {loading ? <LoadingGrid /> : jobs.length === 0 ? (
        <EmptyState icon={<Briefcase />} title="No matching jobs yet" description="Try broadening filters or save your skills in profile for better recommendations." action={<GradientButton onClick={() => setFilters(initialFilters)}>Show all jobs</GradientButton>} />
      ) : (
        <div className="career-grid">
          {jobs.map((job) => (
            <GlassCard key={job._id}>
              <div className="job-card-header">
                <div style={{ display: "flex", gap: 14 }}>
                  <div className="company-logo">{job.company?.logo ? <img src={job.company.logo} alt="" /> : companyName(job).charAt(0)}</div>
                  <div><h2 className="job-title">{job.title}</h2><p className="job-company"><Building2 size={14} /> {companyName(job)}</p></div>
                </div>
                <button className={`save-btn-icon ${job.saved ? "saved" : ""}`} onClick={() => toggleSave(job._id)} disabled={busyJob === job._id} aria-label="Save job"><Heart size={19} fill={job.saved ? "currentColor" : "none"} /></button>
              </div>
              <div className="meta-grid">
                <span className="meta-pill"><MapPin size={16} /> {job.location}</span>
                <span className="meta-pill"><IndianRupee size={16} /> {job.salaryRange?.display || job.salary}</span>
                <span className="meta-pill"><CalendarClock size={16} /> {formatDate(job.deadline)}</span>
                <span className="meta-pill"><Users size={16} /> {job.openings || 1} openings</span>
              </div>
              <SkillBadges skills={job.skills || []} />
              <p className="notes"><strong>Eligibility:</strong> {job.eligibility}</p>
              <div className="job-card-footer">
                {job.applied ? <span className="status-badge">{job.applicationStatus || "Applied"}</span> : <GradientButton disabled={busyJob === job._id} onClick={() => applyToJob(job._id)}>Apply Now</GradientButton>}
                <button className="ghost-btn" onClick={() => viewDetails(job._id)}>View Details</button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {pagination.pages > 1 ? <div className="application-toolbar" style={{ justifyContent: "center", marginTop: 24 }}><button disabled={pagination.page <= 1} onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}>Previous</button><button className="active">Page {pagination.page} of {pagination.pages}</button><button disabled={pagination.page >= pagination.pages} onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}>Next</button></div> : null}

      {selectedJob ? <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} onApply={applyToJob} busy={busyJob === selectedJob._id} /> : null}
    </CareerShell>
  );
}

function JobDetailsModal({ job, onClose, onApply, busy }) {
  return <div className="detail-overlay" onClick={onClose}><section className="detail-modal" onClick={(e) => e.stopPropagation()}><div className="modal-head"><div><p className="career-eyebrow">{job.jobType} · {job.experienceLevel}</p><h2>{job.title}</h2><p>{companyName(job)} · {job.location}</p></div><button className="modal-close" onClick={onClose}>×</button></div><div className="detail-sections"><div><h3>Full job description</h3><p>{job.description}</p><h3>Responsibilities</h3><ul>{(job.responsibilities?.length ? job.responsibilities : ["Collaborate with product and engineering teams", "Deliver high-quality outcomes against sprint goals"]).map((item) => <li key={item}>{item}</li>)}</ul><h3>Required qualifications</h3><ul>{(job.qualifications?.length ? job.qualifications : [job.eligibility]).map((item) => <li key={item}>{item}</li>)}</ul><h3>Preferred skills</h3><SkillBadges skills={[...(job.preferredSkills || []), ...(job.skills || [])]} /></div><aside><h3>Company information</h3><p>{job.company?.about || "Verified PlacementHub hiring partner."}</p><h3>Hiring process</h3><ul>{(job.hiringProcess || []).map((item) => <li key={item}>{item}</li>)}</ul><div className="meta-grid" style={{ gridTemplateColumns: "1fr" }}><span className="meta-pill"><Users size={16} /> {job.openings || 1} openings</span><span className="meta-pill"><CalendarClock size={16} /> Deadline {formatDate(job.deadline)}</span></div>{job.applied ? <span className="status-badge">Already {job.applicationStatus || "Applied"}</span> : <GradientButton disabled={busy} onClick={() => onApply(job._id)}>Apply Now</GradientButton>}</aside></div></section></div>;
}
