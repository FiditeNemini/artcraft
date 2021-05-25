import 'bulma/css/bulma.css'
import './App.scss';

import React from 'react';
import { NewOldVocodesSwitch } from './migration/NewOldVocodesSwitch';
import { OldVocodesContainer } from './migration/OldVocodesContainer';
import { NewVocodesContainer } from './migration/NewVocodesContainer';
import { ApiConfig } from './api/ApiConfig';
import { SessionStateResponse } from './api/SessionState';

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
  loggedIn: boolean,
  sessionState?: SessionStateResponse,
}

class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    const enableAlpha = document.cookie.includes("enable-alpha");

    const migrationMode = enableAlpha ? MigrationMode.NEW_VOCODES : MigrationMode.OLD_VOCODES;

    this.state = {
      enableAlpha: enableAlpha,
      migrationMode: migrationMode,
      loggedIn: false,
    }
  }

  componentDidMount() {
    this.querySession();
    setInterval(() => this.querySession, 10000);
    //this.state.videoJobPoller.start();
    //this.state.videoQueuePoller.start();
  }

  querySession = () => {
    if (!this.state.enableAlpha) {
      return;
    }

    const api = new ApiConfig();
    const endpointUrl = api.sessionDetails();

    fetch(endpointUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    })
    .then(res => res.json())
    .then(response => {
      const session : SessionStateResponse = response;

      if (session !== undefined) {
        this.setState({ 
          sessionState : session,
          loggedIn: session.logged_in,
        });
      }
    })
    .catch(e => { /* Ignore. */ });
  }

  logoutSession = () => {
    if (!this.state.enableAlpha) {
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
      this.querySession();
    })
    .catch(e => { /* Ignore. */ });
  }

  setMigrationMode = (mode: MigrationMode) => {
    this.setState({migrationMode: mode});
  }

  public render() {
    let innerComponent = <div />;

    switch (this.state.migrationMode) {
      case MigrationMode.NEW_VOCODES:
        innerComponent = (
          <div>
            <NewVocodesContainer
              sessionState={this.state.sessionState}
              />
          </div>
        );
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
            sessionState={this.state.sessionState}
            />

        <div className="migrationComponentWrapper">
          {innerComponent}
        </div>

        </div>
      </div>
    )
  }
}

export { App, MigrationMode }
