import React from 'react';
import { SessionWrapper } from '../../session/SessionWrapper';
import { useHistory, Link } from "react-router-dom";

interface Props {
  sessionWrapper: SessionWrapper,
}

function UploadChoiceFc(props: Props) {
  let history = useHistory();

  if (!props.sessionWrapper.isLoggedIn()) {
    history.push('/signup');
  }

  return (
    <div>
      <h1 className="title is-1"> Upload to Vocodes ! </h1>
      <h1 className="subtitle is-3"> You make vo.codes <strong>better</strong> by uploading</h1>

      <p>
        You'll get credited for everything you upload. You'll also get queue priority, 
        be eligible to win prizes, and help us become a Hollywood-killing deepfake 
        tooling, streaming, and filmmaking powerhouse.
      </p>

      <br />

      <p>
        Choose an upload type:
      </p>
      <br />

      <Link
        to="/upload/tts"
        className="button is-link is-large is-fullwidth is-outlined"
        onClick={() => {}}
        >Upload voice (TTS model)</Link>

      <br />

      <Link
        to="/upload/w2l_video"
        className="button is-link is-large is-fullwidth is-outlined"
        onClick={() => {}}
        >Upload lipsync video (w2l)</Link>

      <br />

      <Link
        to="/upload/w2l_photo"
        className="button is-info is-large is-fullwidth is-outlined"
        onClick={() => {}}
        >Upload lipsync photo (w2l)</Link>

    </div>
  )
}

export { UploadChoiceFc };
