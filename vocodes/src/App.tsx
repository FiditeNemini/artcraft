import 'bulma/css/bulma.css'
import './App.scss';

import React from 'react';
import { ApiConfig } from './v1/api/ApiConfig';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { MigrationTopNav } from './migration/MigrationTopNav';
import { NewVocodesContainer } from './v2/NewVocodesContainer';
import { OldVocodesContainer } from './v1/OldVocodesContainer';
import { SessionStateResponse } from './session/SessionState';
import { SessionWrapper } from './session/SessionWrapper';

enum MigrationMode {
  NEW_VOCODES,
  OLD_VOCODES,
}

class TtsInferenceJob {
  jobToken: string;
  modelToken?: string;
  status: string;
  title?: string;
  maybeResultToken?: string;

  constructor(
    jobToken: string, 
    status: string = 'unknown',
    modelToken: string | undefined = undefined,
    title: string | undefined = undefined,
    maybeResulToken: string | undefined = undefined,
  ) {
    this.status = status;
    this.jobToken = jobToken;
    this.maybeResultToken = maybeResulToken;
    this.modelToken = modelToken;
    this.title = title;
  }

  static fromResponse(response: TtsInferenceJobState) :  TtsInferenceJob {
    return new TtsInferenceJob(
      response.job_token,
      response.status,
      response.model_token,
      response.title,
      response.maybe_result_token
    );
  }
}

interface TtsInferenceJobStateResponsePayload {
  success: boolean,
  state?: TtsInferenceJobState,
}

interface TtsInferenceJobState {
  job_token: string,
  status: string,
  maybe_result_token?: string,
  model_token: string,
  tts_model_type: string,
  title: string,
  created_at: string,
  updated_at: string,
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

  ttsInferenceJobs: Array<TtsInferenceJob>,
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

      ttsInferenceJobs: [],
    }
  }

  componentDidMount() {
    this.querySession();

    setInterval(() => { this.querySession() }, 10000);
    // TODO: Use websockets, this is dumb
    setInterval(() => { this.pollJobs() }, 1000);
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

  enqueueTtsJob = (jobToken: string) => {
    console.log('enqueueTtsJob()')
    if (!this.state.enableAlpha) {
      console.log('enqueueTtsJob() disabled!')
      return;
    }
    const newJob = new TtsInferenceJob(jobToken);
    let inferenceJobs = this.state.ttsInferenceJobs.concat([newJob]);

      console.log('setting state!!')
    this.setState({
      ttsInferenceJobs: inferenceJobs
    })

    console.log('inference jobs:', inferenceJobs.length);
  }

  checkTtsJob = (jobToken: string) => {
    if (!this.state.enableAlpha) {
      return;
    }

    const api = new ApiConfig();
    const endpointUrl = api.getTtsInferenceJobState(jobToken);

    fetch(endpointUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    })
    .then(res => res.json())
    .then(response => {
      const jobResponse : TtsInferenceJobStateResponsePayload = response;

      if (jobResponse === undefined || jobResponse.state === undefined) {
        return;
      }

      console.log('polled job state ---', jobResponse.state);

      let updatedJobs : Array<TtsInferenceJob> = [];
      this.state.ttsInferenceJobs.forEach(job => {
        if (job.jobToken !== jobResponse.state!.job_token ||
            jobResponse.state!.maybe_result_token === undefined) { // NB: Already done querying, no need to update again.
          console.log('<<<<SKIPPING>>>', job.jobToken, jobResponse.state!.job_token)
          updatedJobs.push(job);
          return;
        }

        console.log('updated job', jobResponse.state);

        let updatedJob = TtsInferenceJob.fromResponse(jobResponse.state!);
        updatedJobs.push(updatedJob);
      });
 
      this.setState({
        ttsInferenceJobs: updatedJobs,
      })
    })
    .catch(e => { /* Ignore. */ });
  }

  pollJobs = () => {
    this.state.ttsInferenceJobs.forEach(job => {
      switch (job.status) {
        case 'unknown':
        case 'pending':
          console.log('need to poll job', job);
          this.checkTtsJob(job.jobToken);
          break;
        default:
          return;
      }
    });
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
                    enqueueTtsJob={this.enqueueTtsJob}
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
