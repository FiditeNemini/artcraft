import React from 'react';
import { Link, Switch, Route } from 'react-router-dom';
import { W2lInferenceJob } from '../../App'

interface Props {
  w2lInferenceJobs: Array<W2lInferenceJob>,
}

function SessionW2lInferenceResultListFc(props: Props) {

  let results : Array<JSX.Element> = [];

  props.w2lInferenceJobs.forEach(job => {

    if (!job.maybeResultToken) {
      results.push(
        <div key={job.jobToken}>Pending&#8230;</div>
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
