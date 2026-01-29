import React from "react";
import "./ComponentCard.css";

const ComponentCard = ({
  icon,
  title,
  value,
  subtitle,
  onClick,
  actionText,
  actionOnClick,
}) => {
  const handleCardClick = (e) => {
    // prevent button click from also triggering card click
    if (e.target.closest(".component-card-btn")) return;
    onClick && onClick();
  };

  return (
    <div
      className={`component-card ${onClick ? "is-clickable" : ""}`}
      onClick={handleCardClick}
    >
      {icon && <div className="component-card-icon">{icon}</div>}

      <div className="component-card-content">
        {value !== undefined && (
          <h2 className="component-card-value">{value}</h2>
        )}

        <h4 className="component-card-title">{title}</h4>

        {subtitle && (
          <p className="component-card-subtitle">{subtitle}</p>
        )}
      </div>

      {actionText && (
        <button
          type="button"
          className="component-card-btn"
          onClick={actionOnClick}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default ComponentCard;
