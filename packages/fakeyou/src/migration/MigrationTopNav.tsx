import React from 'react';
import { MigrationTopNavSession } from './MigrationTopNav_Session';
import { MigrationTopNavVersionSwitch } from './MigrationTopNav_VersionSwitch';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';

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
      <MigrationTopNavVersionSwitch
        enableAlpha={props.enableAlpha}
        />
      <MigrationTopNavSession
        sessionWrapper={props.sessionWrapper}
        enableAlpha={props.enableAlpha}
        querySessionAction={props.querySessionAction}
        closeHamburgerAction={() => {}} // No-op
        />
    </nav>
  )
}

export { MigrationTopNav };
