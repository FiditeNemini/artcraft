import React, { useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { Button, Container, Panel } from "components/common";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import { useHistory, useParams } from "react-router-dom";
import "./StudioIntro.scss";
import LoadingSpinner from "components/common/LoadingSpinner";
import { useMedia, useInferenceJobs } from "hooks";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { MediaFileType } from "@storyteller/components/src/api/media_files";
import { JobState } from "@storyteller/components/src/jobs/JobStates";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

// This page just needs to poll the job and show the video when it's done.

function StudioIntroResultPage(props: Props) {
  const { jobToken } = useParams<{ jobToken: string }>();
  const history = useHistory();
  const { inferenceJobs } = useInferenceJobs();
  const job = inferenceJobs.find((item: any) => item.jobToken === jobToken);

  // const [mediaToken, setMediaToken] = useState(
  //   "m_f5kp3hm74qeq16eq7536jb73jkbvkh"
  // ); // Set the media token after polling success
  // const [jobExists, setJobExists] = useState<boolean | null>(null);

  // const job = useJobStatus({ jobToken });

  const [mediaFile, setMediaFile] = useState<MediaFileType>();

  const mediaToken = job?.maybe_result?.entity_token || "";

  useMedia({
    mediaToken,
    onSuccess: (res: any) => {
      setMediaFile(res);
    },
  });

  const mediaLink =
    mediaFile && new BucketConfig().getGcsUrl(mediaFile.public_bucket_path);

  usePrefixedDocumentTitle("Storyteller Studio");

  if (!jobToken) {
    history.push("/");
  }

  const contentSwitch = () => {
    switch (job.jobState) {
      case JobState.UNKNOWN:
      case JobState.PENDING:
      case JobState.STARTED: return <LoadingSpinner label="Generating your movie..." />;
      case JobState.ATTEMPT_FAILED: return <div {...{ className: "d-flex justify-content-center align-items-center" }}>
        <h3>{`Attempt failed, retrying (attempt ${ job.attemptCount } )`}</h3>
      </div>;
      case JobState.COMPLETE_SUCCESS: return <video src={mediaLink} controls />;
      case JobState.DEAD: return <h3>Job dead</h3>;
      case JobState.CANCELED_BY_USER: return <h3>Job canceled by user</h3>;
    };
  }

  // Should also check if job actually exists or not
  //
  // if (!jobExists) {
  //   history.push("/");
  // }

  return (
    <Container
      type="full"
      className="mt-4 d-flex flex-column align-items-center"
    >
      <Panel clear={true}>
        <h2 className="fw-bold mb-0 mb-4 text-center">Generation Result</h2>
      </Panel>
      <Panel className="overflow-hidden rounded result-video-wrapper">
        <div className="ratio ratio-16x9">
          { 
            contentSwitch()
          }
        </div>
      </Panel>
      {mediaToken ? (
        <div className="d-flex justify-content-center p-4">
          <Button label="Sign up to use your own scene" />
        </div>
      ) : null}
    </Container>
  );
}

export { StudioIntroResultPage };
