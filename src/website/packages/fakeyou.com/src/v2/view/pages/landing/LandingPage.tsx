import React from "react";
import { usePrefixedDocumentTitle } from "../../../../common/UsePrefixedDocumentTitle";
import { PosthogClient } from "@storyteller/components/src/analytics/PosthogClient";
import { Container } from "components/common";
import FakeYouLandingHeader from "./fakeyou/FakeYouLandingHeader";
import Dashboard from "./Dashboard";
import "./LandingPage.scss";
import {
  Website,
  GetWebsite,
} from "@storyteller/components/src/env/GetWebsite";
import PostlaunchLanding from "./storyteller/PostlaunchLanding/PostlaunchLanding";
import MentionsSection from "components/common/MentionsSection";
import { useSession } from "hooks";

function LandingPage() {
  PosthogClient.recordPageview();

  const { sessionWrapper } = useSession();

  const domain = GetWebsite();

  const webpageTitle =
    domain.website === Website.FakeYou
      ? "FakeYou Celebrity Voice Generator"
      : "AI Creation Engine";

  usePrefixedDocumentTitle(webpageTitle);

  const isLoggedIn = sessionWrapper.isLoggedIn();

  return (
    <>
      {domain.website === Website.StorytellerAi && <PostlaunchLanding />}
      {domain.website === Website.FakeYou && (
        <>
          <Container type="panel">
            <Dashboard {...{ experimental: true }} />

            {/* FAKEYOU.COM */}
            {!isLoggedIn && (
              <FakeYouLandingHeader {...{ experimental: true }} />
            )}
          </Container>
          {!isLoggedIn && (
            <Container type="panel">
              <MentionsSection />
            </Container>
          )}
        </>
      )}
    </>
  );
}

export { LandingPage };
