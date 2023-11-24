import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { faEye, faLanguage, faPencil, faWaveform } from "@fortawesome/pro-solid-svg-icons";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import Panel from "components/common/Panel";
import { Stepper } from "./components/Stepper";
import { StepperControls } from "./components/StepperControls";
import { UploadSamples } from "./components/steps/UploadSamples";
import { VoiceDetails } from "./components/steps/VoiceDetails";
import PageHeader from "components/layout/PageHeader";
import Container from "components/common/Container";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useFile } from "hooks";
import useVoiceRequests from "./useVoiceRequests";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";

interface RouteParams {
  dataset_token?: string;
}

function VoiceDesignerFormPage({ enqueueInferenceJob, sessionWrapper }: { enqueueInferenceJob: any, sessionWrapper: SessionWrapper }) {
  const history = useHistory();
  const { datasets, inputCtrl, languages, visibilityOptions, voices } = useVoiceRequests({});
  const [language, languageSet] = useState("en");
  const [visibility, visibilitySet] = useState("hidden");
  const [title, titleSet] = useState("");
  const [fetched,fetchedSet] = useState(false);
  const [uploadStatus,uploadStatusSet] = useState(0); // will replace with enum
  const audioProps = useFile({});

  const datasetInputs = [
    {
      type: "text",
      label: "Title",
      placeholder: "Voice name",
      value: title,
      onChange: inputCtrl(titleSet),
    },
    {
      type: "select",
      icon: faLanguage,
      label: "Language",
      value: language,
      onChange: inputCtrl(languageSet),
      options: languages,
    },
    {
      type: "select",
      icon: faEye,
      label: "Visibility",
      value: visibility,
      onChange: inputCtrl(visibilitySet),
      options: visibilityOptions,
    },
  ];

  const { dataset_token } = useParams<RouteParams>();
  const existingVoice = !!dataset_token;

  usePrefixedDocumentTitle(existingVoice ? "Edit Dataset" : "Create New Voice");

  const initialStep = history.location.pathname.includes("/upload") ? 1 : 0;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const steps = existingVoice ? ["Edit Details", "Edit Samples"] : ["Voice Details", "Upload Samples"];

  const displayStep = (step: any) => {
    switch (step) {
      case 0:
        return <VoiceDetails {...{ datasetInputs }} />;
      case 1:
        return <UploadSamples {...{ audioProps, datasetToken: dataset_token, uploadStatus, uploadStatusSet }}/>;
      default:
        return null;
    }
  };

  const handleBack = () => {
    if (currentStep === 1 && dataset_token) {
      // Set the route to /edit
      history.push(`/voice-designer/dataset/${dataset_token}/edit`);
      setCurrentStep(0);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!existingVoice) {
        // It's a new creation and on the first step

        datasets.create("",{
          title,
          creator_set_visibility: visibility,
          idempotency_token: uuidv4(),
        }).then((res: any) => {
          if (res && res.success && res.token) {
            history.push(`/voice-designer/dataset/${ res.token }/upload`);
          } 
        });

      } else if (dataset_token) {
        // It's edit mode and on the first step
        datasets.edit(dataset_token,{
          title,
          creator_set_visibility: visibility,
          ietf_language_tag: language
        }).then((res: any) => {
          if (res && res.success && res.token) {
            history.push(`/voice-designer/dataset/${dataset_token}/upload`);
          } 
        });
      }
      setCurrentStep(currentStep + 1);
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCreateVoice = () => {
    voices
      .create("", {
        uuid_idempotency_token: uuidv4(),
        voice_dataset_token: dataset_token || "",
      })
      .then((res: any) => {
        if (res && res.success) {
          enqueueInferenceJob(
            res.inference_job_token,
            FrontendInferenceJobType.VoiceDesignerCreateVoice
          );

          history.push("/voice-designer");
        }
      });
  };

  useEffect(() => {
    if (!fetched && dataset_token) {
      fetchedSet(true);
      datasets.get(dataset_token,{})
      .then((res) => {
        languageSet(res.ietf_language_tag);
        titleSet(res.title);
        visibilitySet(res.creator_set_visibility);
      });
    }
  },[dataset_token,datasets,fetched]);

  if (!sessionWrapper.isLoggedIn()) {
    history.push("/voice-designer");
  }

  return (
    <Container type="panel">
      <PageHeader
        title={existingVoice ? "Edit Dataset" : "Create New Voice"}
        titleIcon={existingVoice ? faPencil : faWaveform}
        subText={
          existingVoice
            ? "Edit your dataset by uploading more samples to create a new voice"
            : "Add voice details and upload audio samples to clone your voice!"
        }
        panel={false}
        showBackButton={true}
        backbuttonLabel="Back to Voice Designer"
        backbuttonTo={
          existingVoice ? "/voice-designer/datasets" : "/voice-designer/voices"
        }
      />

      <Panel>
        <div className="p-3 px-lg-4 bg-stepper">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        <div className="p-3 py-4 p-md-4">{displayStep(currentStep)}</div>

        <StepperControls
          steps={steps}
          currentStep={currentStep}
          onBack={handleBack}
          onNext={handleNext}
          onCreate={handleCreateVoice}
          createDisabled={uploadStatus === 1} // will replace with enum
        />
      </Panel>
    </Container>
  );
}

export { VoiceDesignerFormPage };
