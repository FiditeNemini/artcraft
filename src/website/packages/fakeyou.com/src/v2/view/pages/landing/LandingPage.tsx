import React from "react";
import { usePrefixedDocumentTitle } from "../../../../common/UsePrefixedDocumentTitle";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { PosthogClient } from "@storyteller/components/src/analytics/PosthogClient";
import { Container } from "components/common";
// import { AIFaceMirrorCTA } from "components/marketing";
import FakeYouLandingHeader from "./fakeyou/FakeYouLandingHeader";
import Dashboard from "./Dashboard";
import { useDomainConfig } from "context/DomainConfigContext";
import "./LandingPage.scss";
// import FakeYouLandingBody from "./fakeyou/FakeYouLandingBody";
import {
  WebsiteConfig,
  Website,
} from "@storyteller/components/src/env/GetWebsite";
import PostlaunchLanding from "./storyteller/PostlaunchLanding/PostlaunchLanding";
import MentionsSection from "components/common/MentionsSection";
// import VstSectionV3 from "./components/VstSectionV3";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
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
        // <PrelaunchLanding sessionWrapper={props.sessionWrapper} />
        <PostlaunchLanding sessionWrapper={props.sessionWrapper} />
      )}
      {domain.website === Website.FakeYou && (
        <>
          <Container type="panel">
            <Dashboard
              {...{ experimental: true }}
              sessionWrapper={props.sessionWrapper}
            />

            {/* FAKEYOU.COM */}
            {!isLoggedIn && (
              <FakeYouLandingHeader
                {...{ experimental: true }}
                sessionSubscriptionsWrapper={props.sessionSubscriptionsWrapper}
              />
            )}

            {/*         <div className="mt-5">
              <VstSectionV3 />
            </div>

            <div className="mt-5">
              <AIFaceMirrorCTA />
            </div>*/}

            {/*            {!isLoggedIn && (
              <>
                <FakeYouLandingBody />
              </>
            )}*/}
          </Container>
          {!isLoggedIn && (
            <Container type="panel">
              <MentionsSection />
            </Container>
          )}
          {/*isLoggedIn && (
            <Container type="panel" className="pt-5">
              <div className="py-5">
                <StorytellerStudioCTA />
              </div>
            </Container>
          )*/}
        </>
      )}
    </>
  );
}

export { LandingPage };
