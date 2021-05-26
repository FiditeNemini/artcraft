import React from 'react';
import { SessionWrapper } from '../session/SessionWrapper';
import { Link } from 'react-router-dom';

interface Props {
  sessionWrapper: SessionWrapper,
  enableAlpha: boolean,
}

function MigrationTopNav_Session(props: Props) {
  if (!props.enableAlpha) {
    return <nav />
  }

  let loggedIn = props.sessionWrapper.isLoggedIn();
  let displayName = props.sessionWrapper.getDisplayName();

  if (displayName === 'undefined') {
    displayName = 'My Account';
  }

  let sessionLink = <p />;

  if (loggedIn) {
    let url = `/profile/${displayName}`;
    sessionLink = (
      <Link
        to={url}
        className="button is-alert is-inverted is-pulled-right"
        >{displayName}</Link>
    );
  } else {
    sessionLink = (
      <Link
        to="/signup"
        className="button is-danger is-pulled-right"
        >Sign Up / Login</Link>
    );
  }

  return sessionLink;
}

export { MigrationTopNav_Session };
