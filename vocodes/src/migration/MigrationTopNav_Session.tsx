import React from 'react';
import { SessionWrapper } from '../session/SessionWrapper';
import { Link, useHistory } from 'react-router-dom';
import { ApiConfig } from '../v1/api/ApiConfig';

interface Props {
  sessionWrapper: SessionWrapper,
  enableAlpha: boolean,
  querySessionAction: () => void,
}

function MigrationTopNavSession(props: Props) {
  let history = useHistory();

  if (!props.enableAlpha) {
    return <nav />
  }

  const logoutHandler = () => {
    if (!props.enableAlpha) {
      return;
    }

    const api = new ApiConfig();
    const endpointUrl = api.logout();

    fetch(endpointUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    })
    .then(_raw_response => {
      props.querySessionAction();
      history.push('/');
    })
    .catch(e => { /* Ignore. */ });
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

  let sessionLink = <span />;
  let logoutLink = <span />;

  if (loggedIn) {
    let url = `/profile/${displayName}`;
    sessionLink = (
      <Link
        to={url}
        className="button is-alert is-inverted is-pulled-right"
        > {gravatar}&nbsp; {displayName}</Link>
    );
    logoutLink = <button
        className="button is-alert is-inverted is-pulled-right"
        onClick={logoutHandler}
      >Logout</button>;
  } else {
    sessionLink = (
      <Link
        to="/signup"
        className="button is-danger is-pulled-right"
        >Sign Up / Login</Link>
    );
  }

  return (
    <span>
      {logoutLink}
      {sessionLink}
    </span>
  );
}

export { MigrationTopNavSession };
