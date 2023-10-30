import React from "react";

function Processing() {
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div
        className="spinner-border spinner-border-md text-light"
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="ms-3">Processing your voice data...</p>
    </div>
  );
}

export { Processing };
