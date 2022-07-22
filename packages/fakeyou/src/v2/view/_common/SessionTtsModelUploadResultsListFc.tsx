import React from "react";
import { Link } from "react-router-dom";
import { JobState } from "@storyteller/components/src/jobs/JobStates";
import { TtsModelUploadJob } from "@storyteller/components/src/jobs/TtsModelUploadJobs";
import { distance, duration } from "../../../data/animation";
const Fade = require("react-reveal/Fade");

interface Props {
  modelUploadJobs: Array<TtsModelUploadJob>;
}

function SessionTtsModelUploadResultListFc(props: Props) {
  let results: Array<JSX.Element> = [];

  props.modelUploadJobs.forEach((job) => {
    if (!job.maybeModelToken) {
      let stateDescription = "Pending...";

      switch (job.jobState) {
        case JobState.PENDING:
        case JobState.UNKNOWN:
          stateDescription =
            job.maybeExtraStatusDescription == null
              ? "Pending..."
              : job.maybeExtraStatusDescription;
          break;
        case JobState.STARTED:
          stateDescription =
            job.maybeExtraStatusDescription == null
              ? "Started..."
              : job.maybeExtraStatusDescription;
          break;
        case JobState.ATTEMPT_FAILED:
          stateDescription = `Failed ${job.attemptCount} attempt(s). Will retry...`;
          break;
        case JobState.COMPLETE_FAILURE:
        case JobState.DEAD:
          stateDescription =
            "Failed Permanently. Please tell us in Discord so we can fix. :(";
          break;
        case JobState.COMPLETE_SUCCESS:
          stateDescription = "Success!"; // Not sure why we're here instead of other branch!
          break;
      }

      results.push(
        <div key={job.jobToken}>
          <Fade bottom cascade duration={duration} distance={distance}>
            <div className="alert alert-primary">{stateDescription}</div>
          </Fade>
        </div>
      );
    } else {
      let ttsPermalink = `/tts/${job.maybeModelToken}`;

      results.push(
        <div key={job.jobToken}>
          <div className="panel py-4 p-3 p-lg-4 gap-4">
            Complete!
            <Link to={ttsPermalink} className="btn btn-primary ms-4">
              See &amp; use TTS model
            </Link>
          </div>
        </div>
      );
    }
  });

  let title = <span />;
  if (results.length !== 0) {
    title = (
      <h2 className="text-center text-lg-start fw-bold">
        TTS Model Upload Status
      </h2>
    );
  }

  return (
    <div>
      <Fade cascade right distance="100px" duration="400">
        <div className="container-panel py-5">
          <div className="pb-4">{title}</div>
          <div className="d-flex flex-column gap-4">{results}</div>
        </div>
      </Fade>
    </div>
  );
}

export { SessionTtsModelUploadResultListFc };
