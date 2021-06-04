import React from 'react';
import { Link, Switch, Route } from 'react-router-dom';
import { TtsInferenceJob } from '../../App'

interface Props {
  ttsInferenceJobs: Array<TtsInferenceJob>,
}

function TtsInferenceResultListFc(props: Props) {

  let results : Array<JSX.Element> = [];

  props.ttsInferenceJobs.forEach(job => {

    if (job.maybeResultToken === undefined || job.maybeResultToken === null) {
      results.push(
        <div key={job.jobToken}>Pending&ellip;</div>
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

          <Link to={ttsPermalink}>Permalink &amp; download</Link>
        </div>
      );
    }
  });

  return (
    <div>
      {results}
    </div>
  );
}

export { TtsInferenceResultListFc };
