import 'bulma/css/bulma.css'
import './App.scss';

import React from 'react';
import { NewOldVocodesSwitch } from './migration/NewOldVocodesSwitch';
import { OldVocodesContainer } from './migration/OldVocodesContainer';

enum MigrationMode {
  NEW_VOCODES,
  OLD_VOCODES,
}

interface Props {
  // Certan browsers (iPhone) have pitiful support for drawing APIs. Worse yet,
  // they seem to lose the "touch event sandboxing" that allows for audio to be 
  // played after user interaction if the XHRs delivering the audio don't do so
  // as actual audio mimetypes. (Decoding from base64 and trying to play fails.)
  enableSpectrograms: boolean,
}

interface State {
  // Migration Mode
  migrationMode: MigrationMode,

  // Rollout of vocodes 2.0
  enableAlpha: boolean,
}

class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    const enableAlpha = document.cookie.includes("enable-alpha");

    const migrationMode = enableAlpha ? MigrationMode.NEW_VOCODES : MigrationMode.OLD_VOCODES;

    this.state = {
      enableAlpha: enableAlpha,
      migrationMode: migrationMode,
    }
  }

  setMigrationMode = (mode: MigrationMode) => {
    this.setState({migrationMode: mode});
  }

  public render() {
    let innerComponent = <div />;

    switch (this.state.migrationMode) {
      case MigrationMode.NEW_VOCODES:
        break;

      case MigrationMode.OLD_VOCODES:
        innerComponent = (
          <div>
            <OldVocodesContainer
              enableSpectrograms={this.props.enableSpectrograms}
              />
          </div>
        );
        break;
    }

    return (
      <div id="main" className="mainwrap">
        <div id="viewable">
          <NewOldVocodesSwitch
            enableAlpha={this.state.enableAlpha}
            migrationMode={this.state.migrationMode}
            setMigrationModeCallback={this.setMigrationMode}
            />

        {innerComponent}


        </div>
      </div>
    )
  }
}

export { App, MigrationMode }
