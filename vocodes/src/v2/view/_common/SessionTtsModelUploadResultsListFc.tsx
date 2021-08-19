import React from 'react';
import { Link, } from 'react-router-dom';
import { JobState } from '../../../jobs/JobStates';
import { TtsModelUploadJob } from '../../../jobs/TtsModelUploadJobs';

interface Props {
  modelUploadJobs: Array<TtsModelUploadJob>,
}

function SessionTtsModelUploadResultListFc(props: Props) {

  let results : Array<JSX.Element> = [];

  props.modelUploadJobs.forEach(job => {

    if (!job.maybeModelToken) {
      let stateDescription = "Pending...";

      switch (job.jobState) {
        case JobState.PENDING:
        case JobState.UNKNOWN:
          stateDescription = "Pending..."
          break;
        case JobState.STARTED:
          stateDescription = "Started...";
          break;
        case JobState.ATTEMPT_FAILED:
          stateDescription = `Failed ${job.attemptCount} attempt(s). Will retry...`;
          break;
        case JobState.COMPLETE_FAILURE:
        case JobState.DEAD:
          stateDescription = "Failed Permanently. Please tell us in Discord so we can fix. :(";
          break;
        case JobState.COMPLETE_SUCCESS:
          stateDescription = "Success!"; // Not sure why we're here instead of other branch!
          break;
      }

      results.push(
        <div key={job.jobToken}>{stateDescription}</div>
      );
    } else {

      let ttsPermalink = `/tts/${job.maybeModelToken}`

      results.push(
        <div key={job.jobToken}>
          Complete! <Link 
            to={ttsPermalink}
            className="button is-normal is-outlined is-info"
            >See &amp; use TTS model</Link>
        </div>
      );
    }
  });

  let title = <span />;
  if  (results.length !== 0) {
      title = <h4 className="title is-4">TTS Model Upload Status</h4>;
  }

  return (
    <div>
      {title}
      {results}
    </div>
  );
}

export { SessionTtsModelUploadResultListFc };
