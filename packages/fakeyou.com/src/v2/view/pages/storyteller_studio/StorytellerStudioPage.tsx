import React from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { StudioNotAvailable } from "v2/view/_common/StudioNotAvailable";
import { Scene3D } from "components/common";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import { useParams } from "react-router-dom";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

function StorytellerStudioListPage(props: Props) {
  const { mediaToken } = useParams<{ mediaToken: string }>();

  usePrefixedDocumentTitle("Storyteller Studio");

  if (!props.sessionWrapper.canAccessStudio()) {
    return <StudioNotAvailable />;
  }

  let engineParams = {};

  if (mediaToken) {
    engineParams = {
      sceneMediaFileToken: mediaToken
    };
  } else {
    engineParams = {
      objectId: "sample-room.gltf"
    };
  }

  return (
    <>
      <Scene3D 
        fullScreen={true} 
        mode="studio" 
        {...engineParams} />
    </>
  );
}

export { StorytellerStudioListPage };
