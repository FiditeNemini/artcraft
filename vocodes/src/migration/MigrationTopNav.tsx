import React from 'react';
import { MigrationMode } from '../App'
import { MigrationTopNav_Session } from './MigrationTopNav_Session';
import { MigrationTopNav_VersionSwitch } from './MigrationTopNav_VersionSwitch';
import { SessionWrapper } from '../session/SessionWrapper';

interface Props {
  sessionWrapper: SessionWrapper,
  enableAlpha: boolean,
  migrationMode: MigrationMode,
  setMigrationModeCallback: (mode: MigrationMode) => void,
}

function MigrationTopNav(props: Props) {
  if (!props.enableAlpha) {
    return <nav />
  }

  return (
    <nav>
      <MigrationTopNav_VersionSwitch
        enableAlpha={props.enableAlpha}
        />
      <MigrationTopNav_Session
        sessionWrapper={props.sessionWrapper}
        enableAlpha={props.enableAlpha}
        migrationMode={props.migrationMode}
        setMigrationModeCallback={props.setMigrationModeCallback}
        />
    </nav>
  )
}

export { MigrationTopNav };
