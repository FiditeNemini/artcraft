import React from "react";
import { Link } from "react-router-dom";
import { TtsInferenceJob } from "../../../App";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { JobState } from "@storyteller/components/src/jobs/JobStates";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLink,
  faList,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import { distance, delay, delay2, duration } from "../../../data/animation";
const Fade = require("react-reveal/Fade");

interface Props {
  ttsInferenceJobs: Array<TtsInferenceJob>;
}

function SessionTtsInferenceResultListFc(props: Props) {
  let results: Array<JSX.Element> = [];

  props.ttsInferenceJobs.forEach((job) => {
    if (!job.maybeResultToken) {
      let cssStyle = "alert alert-secondary mx-3 mx-md-0";
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
          cssStyle = "alert alert-success mx-3 mx-md-0";
          stateDescription =
            job.maybeExtraStatusDescription == null
              ? "Started..."
              : job.maybeExtraStatusDescription;
          break;
        case JobState.ATTEMPT_FAILED:
          cssStyle = "alert alert-danger mx-3 mx-md-0";
          stateDescription = `Failed ${job.attemptCount} attempt(s). Will retry...`;
          break;
        case JobState.COMPLETE_FAILURE:
        case JobState.DEAD:
          cssStyle = "alert alert-danger mx-3 mx-md-0";
          stateDescription =
            "Failed Permanently. Please tell us in Discord so we can fix. :(";
          break;
        case JobState.COMPLETE_SUCCESS:
          cssStyle = "message is-success mx-3 mx-md-0";
          stateDescription = "Success!"; // Not sure why we're here instead of other branch!
          break;
      }

      results.push(
        <div key={job.jobToken}>
          <div>
            <Fade right duration={duration} distance={distance}>
              <div>
                <Fade bottom cascade duration={duration} distance={distance}>
                  <div className={cssStyle}>{stateDescription}</div>
                </Fade>
              </div>
            </Fade>
          </div>
        </div>
      );
    } else {
      let audioLink = new BucketConfig().getGcsUrl(
        job.maybePublicBucketWavAudioPath
      );
      let ttsPermalink = `/tts/result/${job.maybeResultToken}`;
      results.push(
        <div key={job.jobToken}>
          {/*<div className="message-header">
              <p>{job.title}</p>
              <button className="delete" aria-label="delete"></button>
            </div>*/}
          <Fade right cascade duration={duration} distance={distance}>
            <div>
              <div className="panel py-4 p-3 p-lg-4 gap-4 d-flex flex-column">
                <div>
                  <h4>
                    <FontAwesomeIcon icon={faMicrophone} className="me-3" />
                    {job.title}
                  </h4>
                  <p>{job.rawInferenceText}</p>
                </div>

                <audio className="w-100" controls src={audioLink}>
                  Your browser does not support the
                  <code>audio</code> element.
                </audio>

                <div>
                  <Link to={ttsPermalink} className="btn btn-primary">
                    <FontAwesomeIcon icon={faLink} className="me-2" />
                    Permalink &amp; download
                  </Link>
                </div>
              </div>
            </div>
          </Fade>
        </div>
      );
    }
  });

  if (results.length === 0) {
    return <span />;
  }

  let title = <span />;
  if (results.length !== 0) {
    title = (
      <h2 className="text-center text-lg-start fw-bold">
        <FontAwesomeIcon icon={faList} className="me-3" />
        Session TTS Results
      </h2>
    );
  }

  // Users have requested reverse chronological results
  results.reverse();

  return (
    <div>
      <div className="container-panel mb-5">
        <div className="d-flex flex-column gap-4">
          {title}

          {/*<div className="notification is-info is-light">
        <strong>Working on speeding this up</strong> 
        <p>
          Sorry this is slow. I'm scaling the cluster and fixing the caching strategy.
        </p>
      </div>*/}
          <div className="d-flex flex-column gap-4">{results}</div>
        </div>
      </div>
    </div>
  );
}

export { SessionTtsInferenceResultListFc };
