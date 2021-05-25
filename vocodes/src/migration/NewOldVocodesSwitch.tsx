import React from 'react';
import { MigrationMode } from '../App'

interface Props {
  enableAlpha: boolean,
  migrationMode: MigrationMode,
  setMigrationModeCallback: (mode: MigrationMode) => void,
}

function NewOldVocodesSwitch(props: Props) {
  if (!props.enableAlpha) {
    return <nav />
  }

  let link = <p />;

  switch (props.migrationMode) {
    case MigrationMode.NEW_VOCODES:
      link = <button 
            className="button is-danger is-inverted"
            onClick={() => props.setMigrationModeCallback(MigrationMode.OLD_VOCODES)}
            >Switch to old vocodes (80+ voices)</button>
      break;
    case MigrationMode.OLD_VOCODES:
      link = <button 
            className="button is-danger is-inverted"
            onClick={() => props.setMigrationModeCallback(MigrationMode.NEW_VOCODES)}
            >Switch to new vocodes (custom voices, video uploads, and more!)</button>
      break;
  }

  return (
    <nav>
      {link}
    </nav>
  )
}

export { NewOldVocodesSwitch };
