import React from 'react';
import { MigrationMode } from '../App'
import { SessionWrapper } from '../session/SessionWrapper';

interface Props {
  sessionWrapper: SessionWrapper,
  enableAlpha: boolean,
  migrationMode: MigrationMode,
  setMigrationModeCallback: (mode: MigrationMode) => void,
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
    sessionLink = <button
          className="button is-alert is-inverted is-pulled-right"
          onClick={() => props.setMigrationModeCallback(MigrationMode.OLD_VOCODES)}
          >{displayName}</button>
  } else {
    sessionLink = <button
          className="button is-danger is-pulled-right"
          onClick={() => props.setMigrationModeCallback(MigrationMode.OLD_VOCODES)}
          >Sign Up / Login</button>
  }

  return sessionLink;
}

export { MigrationTopNav_Session };
