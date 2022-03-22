import React from 'react';
import { Link } from 'react-router-dom';
import { BucketConfig } from '@storyteller/components/src/api/BucketConfig';
import { JobState } from '@storyteller/components/src/jobs/JobStates';
import { TtsInferenceJob } from '@storyteller/components/src/jobs/TtsInferenceJobs';

interface Props {
  ttsInferenceJobs: Array<TtsInferenceJob>,
}

function TtsResultsList(props: Props) {

  let results : Array<JSX.Element> = [];

  props.ttsInferenceJobs.forEach(job => {

    if (!job.maybeResultToken) {
      let cssStyle = "message";
      let stateDescription = "Pending...";

      switch (job.jobState) {
        case JobState.PENDING:
        case JobState.UNKNOWN:
          stateDescription = job.maybeExtraStatusDescription == null ? "Pending..." : job.maybeExtraStatusDescription;
          break;
        case JobState.STARTED:
          cssStyle = "message is-primary";
          stateDescription = job.maybeExtraStatusDescription == null ? "Started..." : job.maybeExtraStatusDescription;
          break;
        case JobState.ATTEMPT_FAILED:
          cssStyle = "message is-warning";
          stateDescription = `Failed ${job.attemptCount} attempt(s). Will retry...`;
          break;
        case JobState.COMPLETE_FAILURE:
        case JobState.DEAD:
          cssStyle = "message is-danger";
          stateDescription = "Failed Permanently. Please tell us in Discord so we can fix. :(";
          break;
        case JobState.COMPLETE_SUCCESS:
          cssStyle = "message is-success";
          stateDescription = "Success!"; // Not sure why we're here instead of other branch!
          break;
      }

      results.push(
        <div key={job.jobToken}>
          <article className={cssStyle}>
            <div className="message-body">
              <p>
                {stateDescription}
              </p>
            </div>
          </article>
          &nbsp;
        </div>
      );
    } else {
      let audioLink = new BucketConfig().getGcsUrl(job.maybePublicBucketWavAudioPath);
      let ttsPermalink = `https://fakeyou.com/tts/result/${job.maybeResultToken}`
      results.push(
        <div key={job.jobToken}>
          <article className="message is-dark">
            {/*<div className="message-header">
              <p>{job.title}</p>
              <button className="delete" aria-label="delete"></button>
            </div>*/}
            <div className="message-body">
              <strong>{job.title}</strong>
              <p>{job.rawInferenceText}</p>

            <audio
              controls
              src={audioLink}>
                Your browser does not support the
                <code>audio</code> element.
            </audio>
            &nbsp;

            <Link 
              to={ttsPermalink}
              className="button is-normal is-outlined is-dark"
              >Permalink &amp; download</Link>
              </div>
          </article>
          &nbsp;
        </div>
      );
    }
  });

  if (results.length === 0) {
    return <span />;
  }

  let title = <span />;
  if  (results.length !== 0) {
      title = (
        <>
          <br /> {/* Vertical separation from above elements. */}
          <h4 className="title is-4">TTS Results</h4>
          <p>Please note that we're recieving a second wave of traffic from Latin America.</p>
          <br />
        </>
      );
  }

  // Users have requested reverse chronological results
  results.reverse();

  return (
    <div>
      {title}
      {/*<div className="notification is-info is-light">
        <strong>Working on speeding this up</strong> 
        <p>
          Sorry this is slow. I'm scaling the cluster and fixing the caching strategy.
        </p>
      </div>*/}
      {results}
    </div>
  );
}

export { TtsResultsList };
