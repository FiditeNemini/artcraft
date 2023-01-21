import React from "react";
import { Link } from "react-router-dom";
import { JobState } from "@storyteller/components/src/jobs/JobStates";
import { W2lTemplateUploadJob } from "@storyteller/components/src/jobs/W2lTemplateUploadJobs";
import { motion } from "framer-motion";
import { container, item, sessionItem } from "../../../data/animation";

interface Props {
  w2lTemplateUploadJobs: Array<W2lTemplateUploadJob>;
}

function SessionW2lTemplateUploadResultList(props: Props) {
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
          <div className="alert alert-primary">{stateDescription}</div>
        </div>
      );
    } else {
      let w2lPermalink = `/w2l/${job.maybeW2lTemplateToken}`;

      results.push(
        <div key={job.jobToken}>
          <motion.div
            className="panel py-4 p-3 p-lg-4 gap-4"
            variants={sessionItem}
          >
            Complete!
            <Link to={w2lPermalink} className="btn btn-primary ms-4">
              See &amp; use template
            </Link>
          </motion.div>
        </div>
      );
    }
  });

  let title = <span />;
  if (results.length !== 0) {
    title = (
      <motion.h2 className="text-center text-lg-start fw-bold" variants={item}>
        W2L Template Upload Status
      </motion.h2>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div className="container-panel pt-4 pb-5">
        <div className="pb-4">{title}</div>
        <div className="d-flex flex-column gap-4">{results}</div>
      </div>
    </motion.div>
  );
}

export { SessionW2lTemplateUploadResultList };
