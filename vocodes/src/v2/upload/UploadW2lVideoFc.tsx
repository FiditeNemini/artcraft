import React, { useState } from 'react';
import { SessionWrapper } from '../../session/SessionWrapper';
import { useHistory, Link } from "react-router-dom";
import { ApiConfig } from '../../v1/api/ApiConfig';

interface Props {
  sessionWrapper: SessionWrapper,
}

function UploadW2lVideoFc(props: Props) {
  let history = useHistory();

  if (!props.sessionWrapper.isLoggedIn()) {
    history.push('/');
  }

  return (
    <div>
      <h1 className="title is-1"> Upload Video (w2l template) </h1>

      <br />
      <Link
        to="/upload"
        className="button is-link is-fullwidth is-outlined"
        onClick={() => {}}
        >&lt; Back to upload type selection</Link>

    </div>
  )
}

export { UploadW2lVideoFc };
