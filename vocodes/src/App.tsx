import 'bulma/css/bulma.css'
import './App.scss';

import React from 'react';
import { ApiConfig } from './v1/api/ApiConfig';
import { BrowserRouter, Route, Link, Switch, useHistory } from "react-router-dom";
import { MigrationTopNav } from './migration/MigrationTopNav';
import { NewVocodesContainer } from './v2/NewVocodesContainer';
import { OldVocodesContainer } from './v1/OldVocodesContainer';
import { SessionStateResponse } from './session/SessionState';
import { SessionWrapper } from './session/SessionWrapper';

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
  sessionWrapper: SessionWrapper,
}

class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    const enableAlpha = document.cookie.includes("enable-alpha");

    const migrationMode = enableAlpha ? MigrationMode.NEW_VOCODES : MigrationMode.OLD_VOCODES;

    this.state = {
      enableAlpha: enableAlpha,
      migrationMode: migrationMode,
      sessionWrapper: SessionWrapper.emptySession(),
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
      const sessionResponse : SessionStateResponse = response;

      if (sessionResponse === undefined) {
        return; // Endpoint error?
      }

      const sessionWrapper = SessionWrapper.wrapResponse(sessionResponse);
      this.setState({ 
        sessionWrapper: sessionWrapper,
      });
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
    if (this.state.migrationMode === MigrationMode.OLD_VOCODES) {
      return (
        <OldVocodesContainer
          enableSpectrograms={this.props.enableSpectrograms}
          />
      );
    }

    return (
      <BrowserRouter>
        <div id="main" className="mainwrap">
          <div id="viewable">

            <MigrationTopNav
              enableAlpha={this.state.enableAlpha}
              sessionWrapper={this.state.sessionWrapper}
              querySessionAction={this.querySession}
              />

            <div className="migrationComponentWrapper">

              <Switch>
                <Route path="/old">
                  <OldVocodesContainer
                    enableSpectrograms={this.props.enableSpectrograms}
                    />
                </Route>
                <Route path="/">
                  <NewVocodesContainer
                    sessionWrapper={this.state.sessionWrapper}
                    querySessionAction={this.querySession}
                    />
                </Route>
              </Switch>

            </div>

          </div>
        </div>
      </BrowserRouter>
    )
  }
}

export { App, MigrationMode }
