import React from "react";

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
}

export default function LoadingSpinner({
  className,
  label,
}: LoadingSpinnerProps) {
  return (
    <div
      className={`pt-2 d-flex justify-content-center align-items-center overflow-hidden gap-3 ${
        className ? className : ""
      }`.trim()}
    >
      <div className="spinner-border text-light" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {label && <div className="fw-medium">{label}</div>}
    </div>
  );
}
