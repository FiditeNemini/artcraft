import React from "react";
import { usePrefixedDocumentTitle } from "../../../../common/UsePrefixedDocumentTitle";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import {} from "@fortawesome/pro-solid-svg-icons";
import { PosthogClient } from "@storyteller/components/src/analytics/PosthogClient";
import { Container } from "components/common";
import FakeYouLandingHeader from "./fakeyou/FakeYouLandingHeader";
import Dashboard from "./Dashboard";
import FakeYouLandingBody from "./fakeyou/FakeYouLandingBody";
import { useDomainConfig } from "context/DomainConfigContext";
import StorytellerLanding from "./storyteller/StorytellerLanding";
import LandingVideoReel from "./components/LandingVideoReel";
import {
  FrontendInferenceJobType,
  InferenceJob,
} from "@storyteller/components/src/jobs/InferenceJob";
import { TtsInferenceJob } from "@storyteller/components/src/jobs/TtsInferenceJobs";
import "./LandingPage.scss";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
  inferenceJobs: Array<InferenceJob>;
  ttsInferenceJobs: Array<TtsInferenceJob>;
  enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void;
  inferenceJobsByCategory: Map<FrontendInferenceJobType, Array<InferenceJob>>;
  enqueueTtsJob: (jobToken: string) => void;
}

function LandingPage(props: Props) {
  usePrefixedDocumentTitle("FakeYou Celebrity Voice Generator");
  PosthogClient.recordPageview();
  const domain = useDomainConfig();

  const isLoggedIn = props.sessionWrapper.isLoggedIn();

  return (
    <>
      {domain.title === "Storyteller AI" && !isLoggedIn && <LandingVideoReel />}
      <Container type="panel">
        {domain.title === "FakeYou" ? (
          <>
            {/* FAKEYOU.COM */}
            {!isLoggedIn && (
              <FakeYouLandingHeader
                sessionWrapper={props.sessionWrapper}
                sessionSubscriptionsWrapper={props.sessionSubscriptionsWrapper}
                inferenceJobs={props.inferenceJobs}
                ttsInferenceJobs={props.ttsInferenceJobs}
                enqueueInferenceJob={props.enqueueInferenceJob}
                inferenceJobsByCategory={props.inferenceJobsByCategory}
                enqueueTtsJob={props.enqueueTtsJob}
              />
            )}

            <Dashboard sessionWrapper={props.sessionWrapper} />

            {!isLoggedIn && <FakeYouLandingBody />}
          </>
        ) : (
          <>
            {/* STORYTELLER,AI */}
            {!isLoggedIn ? (
              <StorytellerLanding
                sessionWrapper={props.sessionWrapper}
                sessionSubscriptionsWrapper={props.sessionSubscriptionsWrapper}
                inferenceJobs={props.inferenceJobs}
                ttsInferenceJobs={props.ttsInferenceJobs}
                enqueueInferenceJob={props.enqueueInferenceJob}
                inferenceJobsByCategory={props.inferenceJobsByCategory}
                enqueueTtsJob={props.enqueueTtsJob}
              />
            ) : (
              <Dashboard sessionWrapper={props.sessionWrapper} />
            )}
          </>
        )}
      </Container>
    </>
  );
}

export { LandingPage };
