import { Container } from "components/common";
import PageHeaderWithImage from "components/layout/PageHeaderWithImage";
import React from "react";
import SdInferencePanel from "../weight/inference_panels/SdInferencePanel";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { faMessageImage } from "@fortawesome/pro-solid-svg-icons";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
//import { StudioNotAvailable } from "v2/view/_common/StudioNotAvailable";

interface TextToImagePageProps {
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
  sessionWrapper: SessionWrapper;
}

export default function TextToImagePage({
  sessionWrapper,
  sessionSubscriptionsWrapper,
}: TextToImagePageProps) {
  //if (!sessionWrapper.canAccessStudio()) {
  //  return <StudioNotAvailable />;
  //}

  usePrefixedDocumentTitle("Text to Image");

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
        isStandalone={true}
      />
    </Container>
  );
}
