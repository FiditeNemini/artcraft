import React from "react";
import { Link } from "react-router-dom";
import { JobState } from "@storyteller/components/src/jobs/JobStates";
import { motion } from "framer-motion";
import { container, sessionItem, item } from "../../../data/animation";
import { VocoderUploadJob } from "@storyteller/components/src/jobs/VocoderUploadJobs";

interface Props {
  vocoderUploadJobs: Array<VocoderUploadJob>;
}

function SessionVocoderUploadResultList(props: Props) {
  let results: Array<JSX.Element> = [];

  props.vocoderUploadJobs.forEach((job) => {
    if (!job.maybeDownloadedEntityToken) {
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
      let permalink = `/vocoder/${job.maybeDownloadedEntityToken}`;

      results.push(
        <div key={job.jobToken}>
          <motion.div
            className="panel py-4 p-3 p-lg-4 gap-4"
            variants={sessionItem}
          >
            Complete!
            <Link to={permalink} className="btn btn-primary ms-4">
              See &amp; use vocoder model
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
        Vocoder Upload Status
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

export { SessionVocoderUploadResultList };
