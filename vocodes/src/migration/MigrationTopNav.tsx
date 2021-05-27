import React from 'react';
import { MigrationTopNav_Session } from './MigrationTopNav_Session';
import { MigrationTopNav_VersionSwitch } from './MigrationTopNav_VersionSwitch';
import { SessionWrapper } from '../session/SessionWrapper';

interface Props {
  sessionWrapper: SessionWrapper,
  enableAlpha: boolean,
  querySessionAction: () => void,
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
        querySessionAction={props.querySessionAction}
        />
    </nav>
  )
}

export { MigrationTopNav };
