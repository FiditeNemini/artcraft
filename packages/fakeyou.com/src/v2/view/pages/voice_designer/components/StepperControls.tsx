import React from "react";

interface StepperControlsProps {
  onBack: () => void;
  onNext: () => void;
}

const StepperControls: React.FC<StepperControlsProps> = ({
  onBack,
  onNext,
}) => {
  return (
    <div className="d-flex gap-3">
      <button className="btn btn-secondary w-100" onClick={onBack}>
        Back
      </button>
      <button className="btn btn-primary w-100" onClick={onNext}>
        Next
      </button>
    </div>
  );
};

export { StepperControls };
