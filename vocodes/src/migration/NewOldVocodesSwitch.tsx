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

  let newModeClasses = "button is-link is-large";
  let oldModeClasses = "button is-info is-large";
  let link = <p />;

  switch (props.migrationMode) {
    case MigrationMode.NEW_VOCODES:
      newModeClasses = "button is-link is-large";
      oldModeClasses = "button is-info is-large is-inverted";
      link = <button 
            className="button is-danger is-inverted"
            onClick={() => props.setMigrationModeCallback(MigrationMode.OLD_VOCODES)}
            >Switch to old vocodes (80+ voices)</button>
      break;
    case MigrationMode.OLD_VOCODES:
      newModeClasses = "button is-link is-large is-inverted";
      oldModeClasses = "button is-info is-large";
      link = <button 
            className="button is-danger is-inverted"
            onClick={() => props.setMigrationModeCallback(MigrationMode.NEW_VOCODES)}
            >Switch to new vocodes (custom voices, video uploads, and more!)</button>
      break;
  }

  return (
    <nav>
      {link}
      {/*<div className="columns">
        <div className="column">
          <button 
            className={newModeClasses}
            onClick={() => props.setMigrationModeCallback(MigrationMode.NEW_VOCODES)}
            >New Vocodes (alpha)</button>
        </div>
        <div className="column">
          <button 
            className={oldModeClasses}
            onClick={() => props.setMigrationModeCallback(MigrationMode.OLD_VOCODES)}
            >Old Vocodes (80+ voices)</button>
        </div>
      </div>*/}
    </nav>
  )
}

export { NewOldVocodesSwitch };
