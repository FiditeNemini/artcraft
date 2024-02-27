import React from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { StudioNotAvailable } from "v2/view/_common/StudioNotAvailable";
import { Scene3D } from "components/common";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

function StorytellerStudioListPage(props: Props) {
  if (!props.sessionWrapper.canAccessStudio()) {
    return <StudioNotAvailable />;
  }

  return (
    <>
      <Scene3D fullScreen={true} mode="studio" />
    </>
  );
}

export { StorytellerStudioListPage };
