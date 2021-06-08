import React from 'react';
import { Link, } from 'react-router-dom';
import { TtsModelUploadJob } from '../../jobs/TtsModelUploadJobs';

interface Props {
  modelUploadJobs: Array<TtsModelUploadJob>,
}

function SessionTtsModelUploadResultListFc(props: Props) {

  let results : Array<JSX.Element> = [];

  props.modelUploadJobs.forEach(job => {

    if (!job.maybeModelToken) {
      results.push(
        <div key={job.jobToken}>Pending&#8230;</div>
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
