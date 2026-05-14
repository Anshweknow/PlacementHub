export function CareerShell({ eyebrow, title, description, action, children }) {
  return (
    <main className="career-shell">
      <section className="career-hero">
        <div>
          <p className="career-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {action ? <div className="career-hero-action">{action}</div> : null}
      </section>
      {children}
    </main>
  );
}

export function GlassCard({ children, className = "", ...props }) {
  return (
    <div className={`glass-card career-card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function GradientButton({ children, className = "", as = "button", ...props }) {
  const Component = as;
  return (
    <Component className={`gradient-btn ${className}`} {...props}>
      {children}
    </Component>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="career-empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function LoadingGrid({ count = 6 }) {
  return (
    <div className="career-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <span />
          <strong />
          <p />
          <p />
          <div />
        </div>
      ))}
    </div>
  );
}

export function SkillBadges({ skills = [], limit = 8 }) {
  const visible = skills.slice(0, limit);
  return (
    <div className="skill-badges">
      {visible.map((skill) => (
        <span key={skill}>{skill}</span>
      ))}
      {skills.length > limit ? <span>+{skills.length - limit}</span> : null}
    </div>
  );
}

