import React from "react";
import { Link } from "react-router-dom";
import { JobState } from "@storyteller/components/src/jobs/JobStates";
import { TtsModelUploadJob } from "@storyteller/components/src/jobs/TtsModelUploadJobs";
import { motion } from "framer-motion";
import { container, sessionItem, item } from "../../../data/animation";

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
          <div className="alert alert-primary">{stateDescription}</div>
        </div>
      );
    } else {
      let ttsPermalink = `/tts/${job.maybeModelToken}`;

      results.push(
        <div key={job.jobToken}>
          <motion.div
            className="panel py-4 p-3 p-lg-4 gap-4"
            variants={sessionItem}
          >
            Complete!
            <Link to={ttsPermalink} className="btn btn-primary ms-4">
              See &amp; use TTS model
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
        TTS Model Upload Status
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

export { SessionTtsModelUploadResultListFc };
