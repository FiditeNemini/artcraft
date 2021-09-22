import React from 'react';
import { Link } from 'react-router-dom';
import { TtsInferenceJob } from '../../../App'
import { BucketConfig } from '../../../common/BucketConfig';
import { JobState } from '../../../jobs/JobStates';

interface Props {
  ttsInferenceJobs: Array<TtsInferenceJob>,
}

function SessionTtsInferenceResultListFc(props: Props) {

  let results : Array<JSX.Element> = [];

  props.ttsInferenceJobs.forEach(job => {

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
      let audioLink = new BucketConfig().getGcsUrl(job.maybePublicBucketWavAudioPath);
      let ttsPermalink = `/tts/result/${job.maybeResultToken}`
      results.push(
        <div key={job.jobToken}>
          <audio
            controls
            src={audioLink}>
              Your browser does not support the
              <code>audio</code> element.
          </audio>

          <Link 
            to={ttsPermalink}
            className="button is-normal is-outlined is-info"
            >Permalink &amp; download</Link>
        </div>
      );
    }
  });

  if (results.length === 0) {
    return <span />;
  }

  let title = <span />;
  if  (results.length !== 0) {
      title = <h4 className="title is-4">Session TTS Results</h4>;
  }

  return (
    <div>
      {title}
      <div className="notification is-error is-light">
        <strong>Currently broken / slow</strong> 
        <p>
          I'll have this fixed by September 22nd, evening (Eastern time). Dealing with work and real life issues.
          I know what the bug is. 
        </p>
      </div>
      <br />
      {results}
    </div>
  );
}

export { SessionTtsInferenceResultListFc };
