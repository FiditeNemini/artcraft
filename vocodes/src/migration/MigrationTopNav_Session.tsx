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
  let gravatarHash = props.sessionWrapper.getEmailGravatarHash();
  let gravatar = <span />;

  if (displayName === undefined) {
    displayName = 'My Account';
  }

  if (gravatarHash !== undefined) {
    const hash = gravatarHash;
    const size = 15;
    const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?s=${size}`
    gravatar = <img alt="gravatar" src={gravatarUrl} />
  }

  let sessionLink = <p />;

  if (loggedIn) {
    let url = `/profile/${displayName}`;
    sessionLink = (
      <Link
        to={url}
        className="button is-alert is-inverted is-pulled-right"
        > {gravatar}&nbsp; {displayName}</Link>
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
