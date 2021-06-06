import React from 'react';
import { Link, } from 'react-router-dom';
import { W2lTemplateUploadJob } from '../../jobs/W2lTemplateUploadJobs';

interface Props {
  w2lTemplateUploadJobs: Array<W2lTemplateUploadJob>,
}

function SessionW2lTemplateUploadResultListFc(props: Props) {

  let results : Array<JSX.Element> = [];

  props.w2lTemplateUploadJobs.forEach(job => {

    if (job.maybeW2lTemplateToken === undefined || job.maybeW2lTemplateToken === null) {
      results.push(
        <div key={job.jobToken}>Pending&#8230;</div>
      );
    } else {

      let w2lPermalink = `/w2l/${job.maybeW2lTemplateToken}`

      results.push(
        <div key={job.jobToken}>
          Complete! <Link 
            to={w2lPermalink}
            className="button is-normal is-outlined is-info"
            >See &amp; use template</Link>
        </div>
      );
    }
  });

  let title = <span />;
  if  (results.length !== 0) {
      title = <h4 className="title is-4">W2L Template Upload Status</h4>;
  }

  return (
    <div>
      {title}
      {results}
    </div>
  );
}

export { SessionW2lTemplateUploadResultListFc };
