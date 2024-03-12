import React from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { StudioNotAvailable } from "v2/view/_common/StudioNotAvailable";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import { useParams } from "react-router-dom";
import Scene3D from "components/common/Scene3D/Scene3D";
import { EngineMode } from "components/common/Scene3D/EngineMode";

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

  let assetDescriptor;

  if (mediaToken) {
    assetDescriptor = {
      storytellerSceneMediaFileToken: mediaToken
    };
  } else {
    assetDescriptor = {
      objectId: "sample-room.gltf"
    };
  }

  return (
    <>
      <Scene3D
        fullScreen={true} 
        mode={EngineMode.Studio}
        asset={assetDescriptor}
      />
    </>
  );
}

export { StorytellerStudioListPage };
