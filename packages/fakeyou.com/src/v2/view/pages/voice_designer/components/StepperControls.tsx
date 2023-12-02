import React from "react";

interface StepperControlsProps {
  onBack: () => void;
  onNext: () => void;
  onCreate: () => void;
  createDisabled: boolean;
  steps: string[];
  currentStep: number;
  continueDisabled?: boolean;
}

const StepperControls: React.FC<StepperControlsProps> = ({
  onBack,
  onNext,
  steps,
  currentStep,
  onCreate,
  createDisabled,
  continueDisabled,
}) => {
  return (
    <div className="p-3 pb-4 px-lg-4 pt-0 d-flex gap-3">
      {currentStep === 1 && (
        <button className="btn btn-secondary w-100" onClick={onBack}>
          Back
        </button>
      )}

      {currentStep === 0 && (
        <button
          className="btn btn-primary w-100"
          onClick={onNext}
          disabled={continueDisabled}
        >
          Continue
        </button>
      )}

      {currentStep === 1 && (
        <button
          disabled={createDisabled}
          className="btn btn-primary w-100"
          onClick={onCreate}
        >
          Create Voice
        </button>
      )}
    </div>
  );
};

export { StepperControls };
