import React, { useState } from 'react';
import { SessionWrapper } from '../../session/SessionWrapper';
import { useHistory, Link } from "react-router-dom";
import { ApiConfig } from '../../v1/api/ApiConfig';

interface Props {
  sessionWrapper: SessionWrapper,
}

function UploadW2lPhotoFc(props: Props) {
  let history = useHistory();

  if (!props.sessionWrapper.isLoggedIn()) {
    history.push('/');
  }

  return (
    <div>
      <h1 className="title is-1"> Upload Photo (w2l template) </h1>


    </div>
  )
}

export { UploadW2lPhotoFc };
