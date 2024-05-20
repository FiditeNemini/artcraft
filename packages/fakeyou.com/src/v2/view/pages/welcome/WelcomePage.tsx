import React from "react";

import { usePrefixedDocumentTitle } from "../../../../common/UsePrefixedDocumentTitle";
import { PosthogClient } from "@storyteller/components/src/analytics/PosthogClient";
import { Container, Panel } from "components/common";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import PageHeaderWithImage from "components/layout/PageHeaderWithImage";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonToPortal } from "@fortawesome/pro-solid-svg-icons";
import { DiscordLink } from "@storyteller/components/src/elements/DiscordLink";

interface Props {
  sessionWrapper: SessionWrapper;
}

function WelcomePage(props: Props) {
  PosthogClient.recordPageview();

  usePrefixedDocumentTitle("Welcome to Storyteller Studio!");

  if (!props.sessionWrapper.canAccessStudio()) {
    return (<>
      <Container type="panel" className="mb-5">
        <PageHeaderWithImage
          title="No Access"
          subText="You can't access Storyteller Studio quite yet."
          headerImage="/mascot/kitsune_pose3.webp"
          yOffset="85%"
        />
        <Panel padding={true} mb={true}>
          <h2 className="mt-3 mb-3 fw-bold">You don't have access to Storyteller Studio yet.</h2>
          <p>If you have a beta invite key, <Link to="/beta-key/redeem">enter it here</Link>.</p>
        </Panel>
      </Container>
    </>);
  }

  return (
    <Container type="panel" className="mb-5">
      <PageHeaderWithImage
        title="You've Been Invited"
        subText="You've just been granted access to an incredible new engine of creation!"
        headerImage="/mascot/kitsune_wizard.webp"
        yOffset="85%"
      />

      <Panel padding={true} mb={true}>
        <video 
          src="/videos/studio_tutorial.mp4" 
          width="100%"
          controlsList="nodownload"
          controls={true}
          />

        <br />
        <br />

        <a 
          href="https://studio.storyteller.ai" 
          className="btn btn-primary w-100"
        >
          <FontAwesomeIcon icon={faPersonToPortal} />
          &nbsp;
          Open Storyteller Studio!
        </a>

        <h2 className="mt-5 mb-3 fw-bold">What's Next?</h2>

        <p>
          If you have any questions, please ask us in <DiscordLink />.
        </p>

        <br />

        <p>
          In a short amount of time, we'll be rolling the studio out to more people.
          Check <Link to="/beta-key/list">this page</Link> to see when you've got beta 
          invites to hand out to your friends.
        </p>
      </Panel>
    </Container>
  );
}

export { WelcomePage };
