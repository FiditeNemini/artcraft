import { Container } from "components/common";
import PageHeaderWithImage from "components/layout/PageHeaderWithImage";
import React from "react";
import SdInferencePanel from "../weight/inference_panels/SdInferencePanel";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { faMessageImage } from "@fortawesome/pro-solid-svg-icons";
import TextToImageJobsList from "./components/TextToImageJobsList";
import { useInferenceJobs } from "hooks";

interface TextToImagePageProps {
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
  enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void;
}

export default function TextToImagePage({
  sessionSubscriptionsWrapper,
  enqueueInferenceJob,
}: TextToImagePageProps) {
  const { inferenceJobs } = useInferenceJobs(
    FrontendInferenceJobType.ImageGeneration
  );
  const hasImageGenJobs = inferenceJobs && inferenceJobs.length > 0;

  return (
    <Container type="panel">
      <PageHeaderWithImage
        headerImage="/mascot/text-to-image.webp"
        titleIcon={faMessageImage}
        title="Text to Image"
        subText="Transform your thoughts into art."
        yOffset="76%"
      />

      {hasImageGenJobs && (
        <div className="mb-4">
          <TextToImageJobsList />
        </div>
      )}

      <SdInferencePanel
        sessionSubscriptionsWrapper={sessionSubscriptionsWrapper}
        enqueueInferenceJob={enqueueInferenceJob}
        isStandalone={true}
      />
    </Container>
  );
}
