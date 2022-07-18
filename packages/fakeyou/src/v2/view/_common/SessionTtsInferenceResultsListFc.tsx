import React from 'react';
import { Link } from 'react-router-dom';
import { TtsInferenceJob } from '../../../App'
import { BucketConfig } from '@storyteller/components/src/api/BucketConfig';
import { JobState } from '@storyteller/components/src/jobs/JobStates';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faList, faMicrophone } from '@fortawesome/free-solid-svg-icons';
interface Props {
  ttsInferenceJobs: Array<TtsInferenceJob>,
}

function SessionTtsInferenceResultListFc(props: Props) {

  let results : Array<JSX.Element> = [];

  props.ttsInferenceJobs.forEach(job => {

    if (!job.maybeResultToken) {
      let cssStyle = "alert alert-secondary my-4 alert text-black";
      let stateDescription = "Pending...";

      switch (job.jobState) {
        case JobState.PENDING:
        case JobState.UNKNOWN:
          stateDescription = job.maybeExtraStatusDescription == null ? "Pending..." : job.maybeExtraStatusDescription;
          break;
        case JobState.STARTED:
          cssStyle = "alert alert-success my-4 alert";
          stateDescription = job.maybeExtraStatusDescription == null ? "Started..." : job.maybeExtraStatusDescription;
          break;
        case JobState.ATTEMPT_FAILED:
          cssStyle = "alert alert-danger my-4 alert";
          stateDescription = `Failed ${job.attemptCount} attempt(s). Will retry...`;
          break;
        case JobState.COMPLETE_FAILURE:
        case JobState.DEAD:
          cssStyle = "alert alert-danger my-4 alert";
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
      let ttsPermalink = `/tts/result/${job.maybeResultToken}`
      results.push(
        <div key={job.jobToken}>
          <article className="message is-dark">
            {/*<div className="message-header">
              <p>{job.title}</p>
              <button className="delete" aria-label="delete"></button>
            </div>*/}
            <div className="panel p-3 p-lg-4 load-hidden gap-4 d-flex flex-column">
              <h4> <FontAwesomeIcon icon={faMicrophone} /> {job.title}</h4>
              <p>{job.rawInferenceText}</p>

            <audio className="w-100"
              controls
              src={audioLink}>
                Your browser does not support the
                <code>audio</code> element.
            </audio>
            
            <div>
            <Link 
              to={ttsPermalink}
              className="btn btn-primary btn-lg"
              > <FontAwesomeIcon icon={faLink} /> Permalink &amp; download</Link>
              </div>
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
      title = <h2 className="text-center text-lg-start"
      > <FontAwesomeIcon icon={faList} /> Session TTS Results</h2>;
  }

  // Users have requested reverse chronological results
  results.reverse();

  return (
    <div>
      <div className="container mb-4">
        <div className="d-flex flex-column gap-4 mb-5">
      {title}
      {/*<div className="notification is-info is-light">
        <strong>Working on speeding this up</strong> 
        <p>
          Sorry this is slow. I'm scaling the cluster and fixing the caching strategy.
        </p>
      </div>*/}
      {results}
    </div>
    </div>
    </div>
    
  );
}

export { SessionTtsInferenceResultListFc };
