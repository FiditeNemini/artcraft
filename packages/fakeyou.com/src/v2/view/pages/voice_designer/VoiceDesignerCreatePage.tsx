import React, { useState } from "react";
import { faWaveform } from "@fortawesome/pro-solid-svg-icons";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import Panel from "components/common/Panel";
import { Stepper } from "./components/Stepper";
import { StepperControls } from "./components/StepperControls";
import { UploadSamples } from "./components/steps/UploadSamples";
import { VoiceDetails } from "./components/steps/VoiceDetails";
import { Complete } from "./components/steps/Complete";
import { Processing } from "./components/steps/Processing";
import PageHeader from "components/layout/PageHeader";
import Container from "components/common/Container";

function VoiceDesignerCreatePage() {
  usePrefixedDocumentTitle("Voice Designer");

  const [currentStep, setCurrentStep] = useState(0);
  const steps = ["Voice Details", "Upload Samples", "Processing", "Complete"];

  const displayStep = (step: any) => {
    switch (step) {
      case 0:
        return <VoiceDetails />;
      case 1:
        return <UploadSamples />;
      case 2:
        return <Processing />;
      case 3:
        return <Complete />;
      default:
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // When moving from Upload Samples to Processing
      setCurrentStep(2); // Move to processing step immediately

      // Simulating a 3-second delay to mimic API call
      setTimeout(() => {
        setCurrentStep(3);
      }, 3000);
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <Container type="panel">
      <PageHeader
        title="Creating New Voice"
        titleIcon={faWaveform}
        subText="Add voice details and upload audio samples to clone your voice!"
      />

      <Panel>
        {/* Stepper */}
        <div className="p-3 px-lg-4 bg-stepper overflow-hidden">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        <div className="p-3 py-4 p-md-4">{displayStep(currentStep)}</div>

        {/* Navigation Controls */}

        <StepperControls
          steps={steps}
          currentStep={currentStep}
          onBack={handleBack}
          onNext={handleNext}
        />
      </Panel>
    </Container>
  );
}

export { VoiceDesignerCreatePage };
