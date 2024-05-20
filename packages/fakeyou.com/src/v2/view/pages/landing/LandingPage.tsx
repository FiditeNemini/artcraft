import React from "react";
import { usePrefixedDocumentTitle } from "../../../../common/UsePrefixedDocumentTitle";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { PosthogClient } from "@storyteller/components/src/analytics/PosthogClient";
import { Container } from "components/common";
import FakeYouLandingHeader from "./fakeyou/FakeYouLandingHeader";
import Dashboard from "./Dashboard";
import { useDomainConfig } from "context/DomainConfigContext";
// import LandingVideoReel from "./components/LandingVideoReel/LandingVideoReel";
import {
  FrontendInferenceJobType,
  InferenceJob,
} from "@storyteller/components/src/jobs/InferenceJob";
import { TtsInferenceJob } from "@storyteller/components/src/jobs/TtsInferenceJobs";
import "./LandingPage.scss";
// import VstSectionV1 from "./components/VstSectionV1";
import VstSectionV2 from "./components/VstSectionV2";
import FakeYouLandingBody from "./fakeyou/FakeYouLandingBody";
import {
  WebsiteConfig,
  Website,
} from "@storyteller/components/src/env/GetWebsite";
// import OnboardingSelection from "./storyteller/OnboardingSelection";
// import TtsDemoSection from "./components/TtsDemoSection/TtsDemoSection";
import PrelaunchLanding from "./storyteller/PrelaunchLanding/PrelaunchLanding";

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
  PosthogClient.recordPageview();

  const domain: WebsiteConfig = useDomainConfig();

  const webpageTitle =
    domain.website === Website.FakeYou
      ? "FakeYou Celebrity Voice Generator"
      : "AI Creation Engine";

  usePrefixedDocumentTitle(webpageTitle);

  const isLoggedIn = props.sessionWrapper.isLoggedIn();

  //// DO NOT LEAK THIS YET!!
  //let protectedStudioOnboarding = <></>;

  //if (props.sessionWrapper.canAccessStudio()) {
  //  protectedStudioOnboarding = (
  //    <>
  //      <OnboardingSelection />
  //    </>
  //  );
  //}

  return (
    <>
      {domain.website === Website.StorytellerAi && (
        // <LandingVideoReel sessionWrapper={props.sessionWrapper} />
        <PrelaunchLanding sessionWrapper={props.sessionWrapper} />
      )}
      <Container type="panel">
        {
          domain.website === Website.FakeYou ? (
            <>
              {/* FAKEYOU.COM */}
              {!isLoggedIn && (
                <>
                  <FakeYouLandingHeader
                    sessionWrapper={props.sessionWrapper}
                    sessionSubscriptionsWrapper={
                      props.sessionSubscriptionsWrapper
                    }
                    inferenceJobs={props.inferenceJobs}
                    ttsInferenceJobs={props.ttsInferenceJobs}
                    enqueueInferenceJob={props.enqueueInferenceJob}
                    inferenceJobsByCategory={props.inferenceJobsByCategory}
                    enqueueTtsJob={props.enqueueTtsJob}
                  />
                  {/* <VstSectionV1 /> */}
                  <VstSectionV2 />
                </>
              )}

              <Dashboard sessionWrapper={props.sessionWrapper} />

              {!isLoggedIn && <FakeYouLandingBody />}
            </>
          ) : null
          // <>
          //   {/* STORYTELLER,AI */}

          //   {protectedStudioOnboarding}

          //   <VstSectionV2 />
          //   <TtsDemoSection
          //     sessionWrapper={props.sessionWrapper}
          //     sessionSubscriptionsWrapper={props.sessionSubscriptionsWrapper}
          //     inferenceJobs={props.inferenceJobs}
          //     ttsInferenceJobs={props.ttsInferenceJobs}
          //     enqueueInferenceJob={props.enqueueInferenceJob}
          //     inferenceJobsByCategory={props.inferenceJobsByCategory}
          //     enqueueTtsJob={props.enqueueTtsJob}
          //   />

          //   <Dashboard sessionWrapper={props.sessionWrapper} />

          //   <FakeYouLandingBody />
          // </>
        }
      </Container>
    </>
  );
}

export { LandingPage };
