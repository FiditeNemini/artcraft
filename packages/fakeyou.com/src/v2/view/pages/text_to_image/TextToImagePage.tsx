import { Container } from "components/common";
import PageHeaderWithImage from "components/layout/PageHeaderWithImage";
import React from "react";
import SdInferencePanel from "../weight/inference_panels/SdInferencePanel";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { faMessageImage } from "@fortawesome/pro-solid-svg-icons";
import TextToImageJobsList from "./components/TextToImageJobsList";
// import { useInferenceJobs } from "hooks";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { StudioNotAvailable } from "v2/view/_common/StudioNotAvailable";

interface TextToImagePageProps {
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
  sessionWrapper: SessionWrapper;
  enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void;
}

export default function TextToImagePage({
  sessionWrapper,
  sessionSubscriptionsWrapper,
  enqueueInferenceJob,
}: TextToImagePageProps) {
  if (!sessionWrapper.canAccessStudio()) {
    return <StudioNotAvailable />;
  }

  return (
    <Container type="panel">
      <PageHeaderWithImage
        headerImage="/mascot/text-to-image.webp"
        titleIcon={faMessageImage}
        title="Text to Image"
        subText="Transform your thoughts into art."
        yOffset="68%"
      />

      <SdInferencePanel
        sessionSubscriptionsWrapper={sessionSubscriptionsWrapper}
        enqueueInferenceJob={enqueueInferenceJob}
        isStandalone={true}
      />

      <div className="mt-4">
        <TextToImageJobsList />
      </div>
    </Container>
  );
}
