import React from 'react';
import { Link } from 'react-router-dom';
import { W2lInferenceJob } from '../../../App'
import { JobState } from '../../../jobs/JobStates';

interface Props {
  w2lInferenceJobs: Array<W2lInferenceJob>,
}

function SessionW2lInferenceResultListFc(props: Props) {

  let results : Array<JSX.Element> = [];

  props.w2lInferenceJobs.forEach(job => {

    if (!job.maybeResultToken) {
      let stateDescription = "Pending...";

      switch (job.jobState) {
        case JobState.PENDING:
        case JobState.UNKNOWN:
          stateDescription = job.maybeExtraStatusDescription == null ? "Pending..." : job.maybeExtraStatusDescription;
          break;
        case JobState.STARTED:
          stateDescription = job.maybeExtraStatusDescription == null ? "Started..." : job.maybeExtraStatusDescription;
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

      let w2lPermalink = `/w2l/result/${job.maybeResultToken}`

      results.push(
        <div key={job.jobToken}>
          Complete! <Link 
            to={w2lPermalink}
            className="button is-normal is-outlined is-info"
            >Permalink &amp; download</Link>
        </div>
      );
    }
  });

  let title = <span />;
  if  (results.length !== 0) {
      title = <h4 className="title is-4">Session W2L Results</h4>;
  }

  return (
    <div>
      {title}
      {results}
    </div>
  );
}

export { SessionW2lInferenceResultListFc };
