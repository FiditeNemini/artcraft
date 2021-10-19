import React from 'react';
import { ApiConfig } from '../../../common/ApiConfig';
import { SessionWrapper } from '../../../session/SessionWrapper';
import { TtsModelUploadJob } from '../../../jobs/TtsModelUploadJobs';
import { W2lTemplateUploadJob } from '../../../jobs/W2lTemplateUploadJobs';
import { v4 } from 'uuid';

enum UploadType {
  TTS_MODEL,
  W2L_TEMPLATE,
}

enum FieldTriState {
  EMPTY_FALSE,
  FALSE,
  TRUE,
}

interface Props {
  sessionWrapper : SessionWrapper,

  enqueueTtsModelUploadJob: (jobToken: string) => void,
  ttsModelUploadJobs: Array<TtsModelUploadJob>,

  enqueueW2lTemplateUploadJob: (jobToken: string) => void,
  w2lTemplateUploadJobs: Array<W2lTemplateUploadJob>,
}

interface State {
  uploadType: UploadType,

  title: string,
  titleValid: FieldTriState,
  titleInvalidReason: string,

  downloadUrl: string,
  downloadUrlValid: FieldTriState,
  downloadUrlInvalidReason: string,

  idempotencyToken: string,
}

class UploadComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      uploadType: UploadType.TTS_MODEL,

      title: "",
      titleValid: FieldTriState.EMPTY_FALSE,
      titleInvalidReason: "",

      downloadUrl: "",
      downloadUrlValid: FieldTriState.EMPTY_FALSE,
      downloadUrlInvalidReason: "",

      idempotencyToken: "",
    };
  }

  handleTitleChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();

    const title = (ev.target as HTMLInputElement).value;

    this.setState({
      title: title,
    });

    return false;
  }

  handleDownloadUrlChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();

    const downloadUrl = (ev.target as HTMLInputElement).value;

    this.setState({
      downloadUrl: downloadUrl,
    });

    return false;
  }

  handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();

    const api = new ApiConfig();
    let endpointUrl = "";

    switch (this.state.uploadType) {
      case UploadType.TTS_MODEL:
        endpointUrl = api.uploadTts();
        break;
      case UploadType.W2L_TEMPLATE:
        endpointUrl = api.uploadW2l();
        break;
    }

    let idempotency_token = this.state.idempotencyToken;
    
    idempotency_token = v4();
    
    const request = {
      idempotency_token: idempotency_token,
      title: this.state.title,
      download_url: this.state.downloadUrl,
    }

    fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    })
    .then(res => res.json())
    .then(res => {
      console.log('upload response', res)
      if (res.success) {
        //this.props.switchModeCallback(Mode.SPEAK_MODE);
        return;
      }
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });

    return false;
  }

  setTts = () => {
    this.setState({
      uploadType: UploadType.TTS_MODEL,
    })
  }

  setW2l = () => {
    this.setState({
      uploadType: UploadType.W2L_TEMPLATE,
    })
  }

  public render() {
    if (!this.props.sessionWrapper.isLoggedIn()) {
      return (
        <div>
          <h1>You must be logged in to upload!</h1>
          Invalid view for logged out users.
        </div>
      );
    }

    let extra = <div />;

    if (this.state.uploadType === UploadType.TTS_MODEL) {
      extra = (
        <div className="notification is-warning">
          <strong>Over $500 in prizes!</strong> 
          <p>You can help FakeYou grow by uploading Tacotron2 models. 
          The person that uploads the most models will get $100, 
          the person that uploads the most popular model will get $100,
          and a number of other lucky winners will be chosen at random to 
          recieve cash prizes.</p>
        </div>
      );
    }

    let title = "";
    let ttsClasses = "";
    let w2lClasses = "";

    switch (this.state.uploadType) {
      case UploadType.TTS_MODEL:
        title = "Upload Tacotron 2 Model";
        ttsClasses = "button is-primary is-large is-light";
        w2lClasses = "button is-primary is-large";
        break;
      case UploadType.W2L_TEMPLATE:
        title = "Upload W2L Video or Image Template";
        ttsClasses = "button is-primary is-large";
        w2lClasses = "button is-primary is-large is-light";
        break;
    }

    return (
      <div>
        <h2> {title} </h2>

        <div className="columns">
          <div className="column">
            <button 
              className={ttsClasses}
              title="Upload TTS" 
              onClick={this.setTts}
              >Upload TTS Model</button>
          </div>
          <div className="column">
            <button 
              className={w2lClasses}
              title="Upload W2L" 
              onClick={this.setW2l}
              >Upload Video Template</button>
          </div>
        </div>

        {extra}

        <form onSubmit={this.handleFormSubmit}>
          <div className="field">
            <label className="label">Title</label>
            <div className="control has-icons-left has-icons-right">
              <input className="input" type="text" placeholder="Title" value={this.state.title} onChange={this.handleTitleChange} />
              <span className="icon is-small is-left">
                <i className="fas fa-user"></i>
              </span>
              <span className="icon is-small is-right">
                <i className="fas fa-check"></i>
              </span>
            </div>
            <p className="help">{this.state.titleInvalidReason}</p>
          </div>

          {/* 
          https://drive.google.com/file/d/{TOKEN}/view?usp=sharing
          */}
          <div className="field">
            <label className="label">Download URL</label>
            <div className="control has-icons-left has-icons-right">
              <input className="input" type="password" placeholder="Download URL" value={this.state.downloadUrl} onChange={this.handleDownloadUrlChange} />
              <span className="icon is-small is-left">
                <i className="fas fa-envelope"></i>
              </span>
              <span className="icon is-small is-right">
                <i className="fas fa-exclamation-triangle"></i>
              </span>
            </div>
            <p className="help">{this.state.downloadUrlInvalidReason}</p>
          </div>

          <br />

          <div className="field is-grouped">
            <div className="control">
              <button className="button is-link is-large">Upload</button>
            </div>
          </div>
        </form>
      </div>
    )
  }
}

export { UploadComponent };