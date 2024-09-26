import React from "react";
import { usePrefixedDocumentTitle } from "../../../../common/UsePrefixedDocumentTitle";
import { PosthogClient } from "@storyteller/components/src/analytics/PosthogClient";
import { Container } from "components/common";
// import { AIFaceMirrorCTA } from "components/marketing";
import FakeYouLandingHeader from "./fakeyou/FakeYouLandingHeader";
import Dashboard from "./Dashboard";
import "./LandingPage.scss";
// import FakeYouLandingBody from "./fakeyou/FakeYouLandingBody";
import {
  Website,
  GetWebsite,
} from "@storyteller/components/src/env/GetWebsite";
import PostlaunchLanding from "./storyteller/PostlaunchLanding/PostlaunchLanding";
import MentionsSection from "components/common/MentionsSection";
import { useModal, useSession } from "hooks";
// import VstSectionV3 from "./components/VstSectionV3";
import SetUsernameModal from "../signup/SetUsernameModal";

function LandingPage() {
  PosthogClient.recordPageview();

  const { open } = useModal();

  const { sessionWrapper } = useSession();

  const domain = GetWebsite();

  const webpageTitle =
    domain.website === Website.FakeYou
      ? "FakeYou Celebrity Voice Generator"
      : "AI Creation Engine";

  usePrefixedDocumentTitle(webpageTitle);

  const isLoggedIn = sessionWrapper.isLoggedIn();

  //// DO NOT LEAK THIS YET!!
  //let protectedStudioOnboarding = <></>;

  //if (props.sessionWrapper.canAccessStudio()) {
  //  protectedStudioOnboarding = (
  //    <>
  //      <OnboardingSelection />
  //    </>
  //  );
  //}

  const openModal = () => {
    open({
      component: SetUsernameModal,
      width: "small",
      lockTint: true,
    });
  };

  return (
    <>
      {domain.website === Website.StorytellerAi && (
        // <LandingVideoReel sessionWrapper={props.sessionWrapper} />
        // <PrelaunchLanding sessionWrapper={props.sessionWrapper} />
        <PostlaunchLanding />
      )}
      {domain.website === Website.FakeYou && (
        <>
          <Container type="panel">
            <button onClick={openModal}>test</button>

            <Dashboard {...{ experimental: true }} />

            {/* FAKEYOU.COM */}
            {!isLoggedIn && (
              <FakeYouLandingHeader {...{ experimental: true }} />
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
