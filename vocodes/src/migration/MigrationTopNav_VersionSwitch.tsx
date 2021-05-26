import React from 'react';
import { MigrationMode } from '../App'
import { SessionWrapper } from '../session/SessionWrapper';

interface Props {
  sessionWrapper: SessionWrapper,
  enableAlpha: boolean,
  migrationMode: MigrationMode,
  setMigrationModeCallback: (mode: MigrationMode) => void,
}

function MigrationTopNav_VersionSwitch(props: Props) {
  if (!props.enableAlpha) {
    return <nav />
  }

  let loggedIn = props.sessionWrapper.isLoggedIn();
  let displayName = props.sessionWrapper.getDisplayName();

  if (displayName === 'undefined') {
    displayName = 'My Account';
  }

  let switchLink = <p />;

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

  return switchLink;
}

export { MigrationTopNav_VersionSwitch };
