import React from 'react';
import { Link, Switch, Route } from 'react-router-dom';
import { TtsInferenceJob } from '../../App'

interface Props {
  ttsInferenceJobs: Array<TtsInferenceJob>,
}

function TtsInferenceResultListFc(props: Props) {

  let results : Array<JSX.Element> = [];

  props.ttsInferenceJobs.forEach(job => {

    if (job.maybeResultToken === undefined) {
      results.push(
        <div>Pending</div>
      );
    } else {
      results.push(
        <div>Done</div>
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
