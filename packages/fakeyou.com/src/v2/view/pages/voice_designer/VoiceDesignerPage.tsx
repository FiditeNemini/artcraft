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

function VoiceDesignerPage(this: any) {
  usePrefixedDocumentTitle("Voice Designer");

  const [currentStep, setCurrentStep] = useState(0);
  const steps = ["Upload Samples", "Voice Details", "Complete"];

  const displayStep = (step: any) => {
    switch (step) {
      case 0:
        return <UploadSamples />;
      case 1:
        return <VoiceDetails />;
      case 2:
        return <Complete />;
      default:
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <PageHeaderWithImage
        headerImage="/mascot/kitsune_pose2.webp"
        titleIcon={<FontAwesomeIcon icon={faWaveform} className="me-3" />}
        title={<>Voice Designer</>}
        subText={<>Upload and instantly clone your voice!</>}
        showButtons={false}
      />

      <Panel>
        {/* Stepper */}
        <Stepper steps={steps} currentStep={currentStep} />

        <div className="my-4">{displayStep(currentStep)}</div>

        {/* Navigation Controls */}
        <StepperControls onBack={handleBack} onNext={handleNext} />
      </Panel>
    </motion.div>
  );
}

export { VoiceDesignerPage };
