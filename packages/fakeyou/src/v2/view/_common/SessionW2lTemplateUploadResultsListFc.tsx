import React from "react";
import { Link } from "react-router-dom";
import { JobState } from "@storyteller/components/src/jobs/JobStates";
import { W2lTemplateUploadJob } from "@storyteller/components/src/jobs/W2lTemplateUploadJobs";
import { distance, duration } from "../../../data/animation";
const Fade = require("react-reveal/Fade");

interface Props {
  w2lTemplateUploadJobs: Array<W2lTemplateUploadJob>;
}

function SessionW2lTemplateUploadResultListFc(props: Props) {
  let results: Array<JSX.Element> = [];

  props.w2lTemplateUploadJobs.forEach((job) => {
    if (!job.maybeW2lTemplateToken) {
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
            job.maybeFailureReason == null
              ? "Failed Permanently. Please tell us in Discord so we can fix. :("
              : `Failed Permanently: ${job.maybeFailureReason}`;
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
      let w2lPermalink = `/w2l/${job.maybeW2lTemplateToken}`;

      results.push(
        <div key={job.jobToken}>
          <div className="panel py-4 p-3 p-lg-4 gap-4">
            Complete!
            <Link to={w2lPermalink} className="btn btn-primary ms-4">
              See &amp; use template
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
        W2L Template Upload Status
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

export { SessionW2lTemplateUploadResultListFc };
