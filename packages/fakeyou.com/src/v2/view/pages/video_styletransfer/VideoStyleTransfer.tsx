import React, { useReducer, useEffect } from "react";

import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { useInferenceJobs, useLocalize } from "hooks";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { Container } from "components/common";

import { states, reducer } from "./reducer";
import SubRoutes from "./routes";
import PageHeaderWithImage from "components/layout/PageHeaderWithImage";
import { faFilms } from "@fortawesome/pro-solid-svg-icons";
import { VideoStyleTransferNotAvailable } from "v2/view/_common/VideoStyleTransferNotAvailable";

export default function VideoStyleTransfer({
  sessionWrapper,
}: {
  sessionWrapper: SessionWrapper;
}) {
  const debug = false;
  const { t } = useLocalize("VideoStyleTransfer");
  const { NO_FILE } = states;
  const [pageState, dispatchPageState] = useReducer(reducer, {
    status: NO_FILE,
  });

  const { enqueueInferenceJob } = useInferenceJobs();
  useEffect(() => {
    if (
      pageState.status === states.JOB_ENQUEUED &&
      pageState.inferenceJobToken
    ) {
      enqueueInferenceJob(
        pageState.inferenceJobToken,
        FrontendInferenceJobType.VideoStyleTransfer
      );
      dispatchPageState({
        type: "enqueueJobSuccess",
        payload: { inferenceJobToken: undefined },
      });
    }
  }, [pageState, enqueueInferenceJob]);

  if (!sessionWrapper.canAccessVideoStyleTransfer()) {
    return <VideoStyleTransferNotAvailable />;
  }

  return (
    <Container type="panel" className="mb-5">
      {debug && (
        <p>{`Status:${pageState.status} MediaToken:${pageState.mediaFileToken}`}</p>
      )}
      <PageHeaderWithImage
        headerImage="/mascot/vst.webp"
        titleIcon={faFilms}
        title={t("headings.title")}
        subText={t("headings.subtitle")}
        yOffset="80%"
      />

      <SubRoutes {...{ debug, t, pageState, dispatchPageState }} />
    </Container>
  );
}
