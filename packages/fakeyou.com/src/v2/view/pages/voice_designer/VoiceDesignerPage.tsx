import React, { useState } from "react";
import { faWaveform } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import { PageHeaderWithImage } from "v2/view/_common/PageHeaderWithImage";
import { Panel } from "v2/view/_common/Panel";
import { Stepper } from "./components/Stepper";
import { StepperControls } from "./components/StepperControls";
import { motion } from "framer-motion";
import { container } from "data/animation";
import { UploadSamples } from "./components/steps/UploadSamples";
import { VoiceDetails } from "./components/steps/VoiceDetails";
import { Complete } from "./components/steps/Complete";
import { Processing } from "./components/steps/Processing";

function VoiceDesignerPage() {
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
    <motion.div initial="hidden" animate="visible" variants={container}>
      <PageHeaderWithImage
        headerImage="/mascot/kitsune_pose2.webp"
        titleIcon={<FontAwesomeIcon icon={faWaveform} className="me-3" />}
        title={<>Voice Designer</>}
        subText={<>Upload audio samples and instantly clone your voice!</>}
        showButtons={false}
      />

      <Panel>
        {/* Stepper */}
        <div className="p-3 px-lg-4 bg-stepper">
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
    </motion.div>
  );
}

export { VoiceDesignerPage };
