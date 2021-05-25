import React from 'react';
import { MigrationMode } from '../App'
import { SessionStateResponse } from '../api/SessionState';

interface Props {
  sessionState?: SessionStateResponse,
  enableAlpha: boolean,
  migrationMode: MigrationMode,
  setMigrationModeCallback: (mode: MigrationMode) => void,
}

function NewOldVocodesSwitch(props: Props) {
  if (!props.enableAlpha) {
    return <nav />
  }

  let loggedIn = false;
  let displayName = "My Account";

  if (props.sessionState !== undefined) {
    console.log('sessionstate', props.sessionState);
    loggedIn = props.sessionState.logged_in;
    if (props.sessionState.user !== undefined && 
        props.sessionState.user !== null) {
      displayName = props.sessionState.user.display_name;
    }
  }

  let switchLink = <p />;
  let sessionLink = <p />;

  switch (props.migrationMode) {
    case MigrationMode.NEW_VOCODES:
      switchLink = <button 
            className="button is-danger is-inverted"
            onClick={() => props.setMigrationModeCallback(MigrationMode.OLD_VOCODES)}
            >Switch to old vocodes (80+ voices)</button>
      break;
    case MigrationMode.OLD_VOCODES:
      switchLink = <button 
            className="button is-danger is-inverted"
            onClick={() => props.setMigrationModeCallback(MigrationMode.NEW_VOCODES)}
            >Switch to new vocodes (custom voices, video uploads, and more!)</button>
      break;
  }

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

  return (
    <nav>
      {switchLink}
      {sessionLink}
    </nav>
  )
}

export { NewOldVocodesSwitch };
