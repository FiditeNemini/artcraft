import React from 'react';
import { Link, Switch, Route } from 'react-router-dom';
import { TtsInferenceJob } from '../../App'

interface Props {
  ttsInferenceJobs: Array<TtsInferenceJob>,
}

function SessionTtsInferenceResultListFc(props: Props) {

  let results : Array<JSX.Element> = [];

  props.ttsInferenceJobs.forEach(job => {

    if (!job.maybeResultToken) {
      results.push(
        <div key={job.jobToken}>Pending&#8230;</div>
      );
    } else {

      let audioLink = `https://storage.googleapis.com/dev-vocodes-public${job.maybePublicBucketWavAudioPath}`; 
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

  let title = <span />;
  if  (results.length !== 0) {
      title = <h4 className="title is-4">Session TTS Results</h4>;
  }

  return (
    <div>
      {title}
      {results}
    </div>
  );
}

export { SessionTtsInferenceResultListFc };
