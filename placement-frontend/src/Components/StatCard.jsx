import "./StatCard.css";

const StatCard = ({ icon, value, label, accent }) => {
  // optional accent color override per card
  const style = accent ? { "--stat-accent": accent } : {};

  return (
    <div className="stat-card" style={style}>
      {icon && <div className="stat-icon">{icon}</div>}

      <div className="stat-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
