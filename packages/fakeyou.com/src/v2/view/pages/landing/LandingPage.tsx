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

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

function LandingPage(props: Props) {
  usePrefixedDocumentTitle("FakeYou Celebrity Voice Generator");
  PosthogClient.recordPageview();
  const domain = useDomainConfig();

  const isLoggedIn = props.sessionWrapper.isLoggedIn();

  return (
    <>
      <Container type="panel">
        {domain.title === "FakeYou" ? (
          <>
            {/* FAKEYOU.COM */}
            {!isLoggedIn && (
              <FakeYouLandingHeader
                sessionWrapper={props.sessionWrapper}
                sessionSubscriptionsWrapper={props.sessionSubscriptionsWrapper}
              />
            )}

            <Dashboard sessionWrapper={props.sessionWrapper} />

            {!isLoggedIn && <FakeYouLandingBody />}
          </>
        ) : (
          <>
            {/* STORYTELLER,AI */}
            {!isLoggedIn ? (
              <StorytellerLanding />
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
