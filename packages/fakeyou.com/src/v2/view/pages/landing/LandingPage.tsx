import React from "react";
import { usePrefixedDocumentTitle } from "../../../../common/UsePrefixedDocumentTitle";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import {} from "@fortawesome/pro-solid-svg-icons";
import { PosthogClient } from "@storyteller/components/src/analytics/PosthogClient";
import { Container } from "components/common";
import FakeYouLandingHeader from "./fakeyou/FakeYouLandingHeader";
import FakeYouDashboard from "./Dashboard";
import FakeYouLandingBody from "./fakeyou/FakeYouLandingBody";
// import StorytellerLanding from "./StorytellerLanding";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

function LandingPage(props: Props) {
  usePrefixedDocumentTitle("FakeYou Celebrity Voice Generator");
  PosthogClient.recordPageview();

  const isLoggedIn = props.sessionWrapper.isLoggedIn();

  return (
    <>
      <Container type="panel">
        {/* HEADER IF NOT LOGGED IN */}
        {!isLoggedIn && (
          <FakeYouLandingHeader
            sessionWrapper={props.sessionWrapper}
            sessionSubscriptionsWrapper={props.sessionSubscriptionsWrapper}
          />
        )}

        <FakeYouDashboard sessionWrapper={props.sessionWrapper} />

        {!isLoggedIn && <FakeYouLandingBody />}
      </Container>
    </>
  );
}

export { LandingPage };
