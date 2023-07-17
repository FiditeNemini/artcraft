import React from "react";

function StepperControls(this: any) {
  return (
    <div className="d-flex gap-3">
      <button className="btn btn-secondary w-100">Back</button>
      <button className="btn btn-primary w-100">Next</button>
    </div>
  );
}

export { StepperControls };
