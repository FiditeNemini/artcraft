import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

function Processing() {
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <FontAwesomeIcon icon={faSpinner} spin size="3x" />
      <p className="ms-3">Processing your voice data...</p>
    </div>
  );
}

export { Processing };
