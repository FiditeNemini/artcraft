import 'bulma/css/bulma.css'
import './App.scss';

import React from 'react';
import { ApiConfig } from './common/ApiConfig';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { MigrationTopNav } from './migration/MigrationTopNav';
import { NewVocodesContainer } from './v2/view/NewVocodesContainer';
import { OldVocodesContainer } from './v1/OldVocodesContainer';
import { SessionStateResponse } from './session/SessionState';
import { SessionWrapper } from './session/SessionWrapper';
import { TtsInferenceJob, TtsInferenceJobStateResponsePayload } from './jobs/TtsInferenceJobs';
import { W2lInferenceJob, W2lInferenceJobStateResponsePayload } from './jobs/W2lInferenceJobs';
import { TtsModelUploadJob, TtsModelUploadJobStateResponsePayload } from './jobs/TtsModelUploadJobs';
import { W2lTemplateUploadJob, W2lTemplateUploadJobStateResponsePayload } from './jobs/W2lTemplateUploadJobs';
import { jobStateCanChange } from './jobs/JobStates';
import { TtsModelListItem } from './v2/api/tts/ListTtsModels';
import { TtsCategory } from './v2/api/category/ListTtsCategories';

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

  allTtsCategories: TtsCategory[],
  setAllTtsCategories: (allTtsCategories: TtsCategory[]) => void,

  allTtsModels: TtsModelListItem[],
  setAllTtsModels: (allTtsModels: TtsModelListItem[]) => void,

  allTtsCategoriesByTokenMap: Map<string,TtsCategory>,
  allTtsModelsByTokenMap: Map<string,TtsModelListItem>,
}

interface State {
  // Migration Mode
  migrationMode: MigrationMode,

  // Rollout of vocodes 2.0
  enableAlpha: boolean,
  sessionWrapper: SessionWrapper,

  // Jobs enqueued during this browser session.
  ttsInferenceJobs: Array<TtsInferenceJob>,
  w2lInferenceJobs: Array<W2lInferenceJob>,
  ttsModelUploadJobs: Array<TtsModelUploadJob>,
  w2lTemplateUploadJobs: Array<W2lTemplateUploadJob>,

  // Current text entered
  textBuffer: string,

//  // List of voices (post-query) and current voice selected on main page
//  ttsModels: Array<TtsModelListItem>,
//
//  // Comprehensive list of categories we've queried.
//  allTtsCategories: TtsCategory[],

  // Selection state
  currentTtsModelSelected?: TtsModelListItem,
}

function newVocodes() {
  const discord = /discord/i.test(navigator.userAgent || "");
  const twitter = /twitter/i.test(navigator.userAgent || "");
  const alphaCookie = document.cookie.includes("enable-alpha");
  return discord || twitter || alphaCookie;
}

// TODO: Port to functional component
class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    const enableAlpha = newVocodes() || true;

    const migrationMode = enableAlpha ? MigrationMode.NEW_VOCODES : MigrationMode.OLD_VOCODES;

    this.state = {
      enableAlpha: enableAlpha,
      migrationMode: migrationMode,
      sessionWrapper: SessionWrapper.emptySession(),

      ttsInferenceJobs: [],
      w2lInferenceJobs: [],
      ttsModelUploadJobs: [],
      w2lTemplateUploadJobs: [],

      textBuffer: '',

//      ttsModels: [],
//      allTtsCategories: [],
      
      currentTtsModelSelected: undefined,
    }
  }

  componentDidMount() {
    this.querySession();

    setInterval(() => { this.querySession() }, 60000);
    // TODO: Use websockets, this is dumb
    setInterval(() => { this.pollJobs() }, 1000);
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
    const newJob = new TtsInferenceJob(jobToken);
    let inferenceJobs = this.state.ttsInferenceJobs.concat([newJob]);

    this.setState({
      ttsInferenceJobs: inferenceJobs
    })
  }

  checkTtsJob = (jobToken: string) => {
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

      let updatedJobs : Array<TtsInferenceJob> = [];

      this.state.ttsInferenceJobs.forEach(existingJob => {
        if (existingJob.jobToken !== jobResponse.state!.job_token ||
            !jobStateCanChange(existingJob.jobState)) {
          updatedJobs.push(existingJob);
          return;
        }

        let updatedJob = TtsInferenceJob.fromResponse(jobResponse.state!);
        updatedJobs.push(updatedJob);
      });
 
      this.setState({
        ttsInferenceJobs: updatedJobs,
      })
    })
    .catch(e => { /* Ignore. */ });
  }

  enqueueTtsModelUploadJob = (jobToken: string) => {
    const newJob = new TtsModelUploadJob(jobToken);
    let modelUploadJobs = this.state.ttsModelUploadJobs.concat([newJob]);

    this.setState({
      ttsModelUploadJobs: modelUploadJobs
    })
  }

  checkTtsModelUploadJob = (jobToken: string) => {
    const api = new ApiConfig();
    const endpointUrl = api.getTtsModelUploadJobState(jobToken);

    fetch(endpointUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    })
    .then(res => res.json())
    .then(response => {
      const jobResponse : TtsModelUploadJobStateResponsePayload = response;

      if (jobResponse === undefined || jobResponse.state === undefined) {
        return;
      }

      let updatedJobs : Array<TtsModelUploadJob> = [];
      this.state.ttsModelUploadJobs.forEach(existingJob => {
        if (existingJob.jobToken !== jobResponse.state!.job_token ||
            !jobStateCanChange(existingJob.jobState)) {
          updatedJobs.push(existingJob);
          return;
        }

        let updatedJob = TtsModelUploadJob.fromResponse(jobResponse.state!);
        updatedJobs.push(updatedJob);
      });
 
      this.setState({
        ttsModelUploadJobs: updatedJobs,
      })
    })
    .catch(e => { /* Ignore. */ });
  }


  enqueueW2lJob = (jobToken: string) => {
    const newJob = new W2lInferenceJob(jobToken);
    let inferenceJobs = this.state.w2lInferenceJobs.concat([newJob]);

    this.setState({
      w2lInferenceJobs: inferenceJobs
    })
  }

  checkW2lJob = (jobToken: string) => {
    const api = new ApiConfig();
    const endpointUrl = api.getW2lInferenceJobState(jobToken);

    fetch(endpointUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    })
    .then(res => res.json())
    .then(response => {
      const jobResponse : W2lInferenceJobStateResponsePayload = response;

      if (jobResponse === undefined || jobResponse.state === undefined) {
        return;
      }

      let updatedJobs : Array<W2lInferenceJob> = [];
      this.state.w2lInferenceJobs.forEach(existingJob => {
        if (existingJob.jobToken !== jobResponse.state!.job_token ||
            !jobStateCanChange(existingJob.jobState)) {
          updatedJobs.push(existingJob);
          return;
        }

        let updatedJob = W2lInferenceJob.fromResponse(jobResponse.state!);
        updatedJobs.push(updatedJob);
      });
 
      this.setState({
        w2lInferenceJobs: updatedJobs,
      })
    })
    .catch(e => { /* Ignore. */ });
  }

  enqueueW2lTemplateUploadJob = (jobToken: string) => {
    const newJob = new W2lTemplateUploadJob(jobToken);
    let inferenceJobs = this.state.w2lTemplateUploadJobs.concat([newJob]);

    this.setState({
      w2lTemplateUploadJobs: inferenceJobs
    })
  }

  checkW2lTemplateUploadJob = (jobToken: string) => {
    const api = new ApiConfig();
    const endpointUrl = api.getW2lTemplateUploadJobState(jobToken);

    fetch(endpointUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    })
    .then(res => res.json())
    .then(response => {
      const jobResponse : W2lTemplateUploadJobStateResponsePayload = response;

      if (jobResponse === undefined || jobResponse.state === undefined) {
        return;
      }

      let updatedJobs : Array<W2lTemplateUploadJob> = [];

      this.state.w2lTemplateUploadJobs.forEach(existingJob => {
        if (existingJob.jobToken !== jobResponse.state!.job_token ||
            !jobStateCanChange(existingJob.jobState)) {
          updatedJobs.push(existingJob);
          return;
        }

        let updatedJob = W2lTemplateUploadJob.fromResponse(jobResponse.state!);
        updatedJobs.push(updatedJob);
      });
 
      this.setState({
        w2lTemplateUploadJobs: updatedJobs,
      })
    })
    .catch(e => { /* Ignore. */ });
  }

  pollJobs = () => {
    this.state.ttsInferenceJobs.forEach(job => {
      if (jobStateCanChange(job.jobState)) {
        this.checkTtsJob(job.jobToken);
      }
    });
    this.state.w2lInferenceJobs.forEach(job => {
      if (jobStateCanChange(job.jobState)) {
        this.checkW2lJob(job.jobToken);
      }
    });
    this.state.ttsModelUploadJobs.forEach(job => {
      if (jobStateCanChange(job.jobState)) {
        this.checkTtsModelUploadJob(job.jobToken);
      }
    });
    this.state.w2lTemplateUploadJobs.forEach(job => {
      if (jobStateCanChange(job.jobState)) {
        this.checkW2lTemplateUploadJob(job.jobToken);
      }
    });
  }

  setMigrationMode = (mode: MigrationMode) => {
    this.setState({migrationMode: mode});
  }

  setTextBuffer = (textBuffer: string) => {
    this.setState({ textBuffer: textBuffer });
  }

  clearTextBuffer = () => {
    this.setState({ textBuffer: '' });
  }

//  setTtsModels = (ttsModels: Array<TtsModelListItem>) => {
//    this.setState({ ttsModels: ttsModels });
//    this.props.setAllTtsModels(ttsModels);
//  }

  setCurrentTtsModelSelected = (ttsModel: TtsModelListItem) => {
    this.setState({ currentTtsModelSelected: ttsModel });
  }

//  setAllTtsCategories = (allTtsCategories: TtsCategory[]) => {
//    this.setState({ allTtsCategories: allTtsCategories })
//    this.props.setAllTtsCategories(allTtsCategories);
//  }

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
                    ttsInferenceJobs={this.state.ttsInferenceJobs}

                    enqueueW2lJob={this.enqueueW2lJob}
                    w2lInferenceJobs={this.state.w2lInferenceJobs}

                    enqueueTtsModelUploadJob={this.enqueueTtsModelUploadJob}
                    ttsModelUploadJobs={this.state.ttsModelUploadJobs}

                    enqueueW2lTemplateUploadJob={this.enqueueW2lTemplateUploadJob}
                    w2lTemplateUploadJobs={this.state.w2lTemplateUploadJobs}

                    textBuffer={this.state.textBuffer}
                    setTextBuffer={this.setTextBuffer}
                    clearTextBuffer={this.clearTextBuffer}

                    ttsModels={this.props.allTtsModels}
                    setTtsModels={this.props.setAllTtsModels}

                    allTtsCategories={this.props.allTtsCategories}
                    setAllTtsCategories={this.props.setAllTtsCategories}

                    allTtsCategoriesByTokenMap={this.props.allTtsCategoriesByTokenMap}
                    allTtsModelsByTokenMap={this.props.allTtsModelsByTokenMap}
                    
                    currentTtsModelSelected={this.state.currentTtsModelSelected}
                    setCurrentTtsModelSelected={this.setCurrentTtsModelSelected}
                      
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

export { App, MigrationMode, TtsInferenceJob, W2lInferenceJob }
