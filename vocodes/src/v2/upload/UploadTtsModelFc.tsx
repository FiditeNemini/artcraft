import React, { useState } from 'react';
import { ApiConfig } from '../../common/ApiConfig';
import { SessionWrapper } from '../../session/SessionWrapper';
import { TtsModelUploadJob } from '../../jobs/TtsModelUploadJobs';
import { useHistory, Link } from "react-router-dom";
import { v1 as uuidv1 } from 'uuid';
import { SessionTtsModelUploadResultListFc } from '../common/SessionTtsModelUploadResultsListFc';

interface Props {
  sessionWrapper: SessionWrapper,
  enqueueTtsModelUploadJob: (jobToken: string) => void,
  ttsModelUploadJobs: Array<TtsModelUploadJob>,
}

interface TtsModelUploadJobResponsePayload {
  success: boolean,
  job_token?: string,
}

function UploadTtsModelFc(props: Props) {
  let history = useHistory();

  const [downloadUrl, setDownloadUrl] = useState('')
  const [title, setTitle] = useState('')
  const [downloadUrlInvalidReason] = useState('')
  const [titleInvalidReason] = useState('')

  if (!props.sessionWrapper.isLoggedIn()) {
    history.push('/signup');
  }

  const handleDownloadUrlChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const downloadUrlValue = (ev.target as HTMLInputElement).value;
    setDownloadUrl(downloadUrlValue);
    return false;
  }

  const handleTitleChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const titleValue = (ev.target as HTMLInputElement).value;
    setTitle(titleValue);
    return false;
  }

  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const api = new ApiConfig();
    const endpointUrl = api.uploadTts();
    
    let idempotencyToken = uuidv1(); // Time-based UUID

    const request = {
      idempotency_token: idempotencyToken,
      title: title,
      download_url: downloadUrl,
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
      let response : TtsModelUploadJobResponsePayload = res;
      
      if (!response.success || response.job_token === undefined) {
        return;
      }

      console.log('enqueuing...')

      props.enqueueTtsModelUploadJob(response.job_token);

      history.push('/');
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });

    return false;
  }

  return (
    <div>
      <h1 className="title is-1"> Upload Voice (TTS Model) </h1>
      <p>
        Vo.codes supports Tacotron 2 models and will soon accommodate other architectures as well.
        We'll supply instructions for training models and offer assistance on our Discord server.
      </p>

      <br />

      <div className="notification is-warning">
        <strong>Over $500 in prizes!</strong> 
        <p>You can help vo.codes grow by uploading Tacotron2 models. 
        The person that uploads the most models will get $100, 
        the person that uploads the most popular model will get $100,
        and a number of other lucky winners will be chosen at random to 
        recieve cash prizes. Uploaders will also get queue priority!</p>
      </div>

      <form onSubmit={handleFormSubmit}>
        <div className="field">
          <label className="label">Title, eg. "Goku (Sean Schemmel)"</label>
          <div className="control has-icons-left has-icons-right">
            <input className="input" type="text" placeholder="Title" value={title} onChange={handleTitleChange} />
            <span className="icon is-small is-left">
              <i className="fas fa-user"></i>
            </span>
            <span className="icon is-small is-right">
              <i className="fas fa-check"></i>
            </span>
          </div>
          <p className="help">{titleInvalidReason}</p>
        </div>

        {/* 
        https://drive.google.com/file/d/{TOKEN}/view?usp=sharing
        */}
        <div className="field">
          <label className="label">Download URL, eg. Google Drive link</label>
          <div className="control has-icons-left has-icons-right">
            <input className="input" type="text" placeholder="Download URL" value={downloadUrl} onChange={handleDownloadUrlChange} />
            <span className="icon is-small is-left">
              <i className="fas fa-envelope"></i>
            </span>
            <span className="icon is-small is-right">
              <i className="fas fa-exclamation-triangle"></i>
            </span>
          </div>
          <p className="help">{downloadUrlInvalidReason}</p>
        </div>

        <br />

        <button className="button is-link is-large is-fullwidth">Upload</button>
        {/*<div className="field is-grouped">
          <div className="control">
            <button className="button is-link is-large is-fullwidth">Upload</button>
          </div>
        </div>*/}
      </form>
      <br />
      <Link
        to="/upload"
        className="button is-link is-fullwidth is-outlined"
        onClick={() => {}}
        >&lt; Back to upload type selection</Link>


      <SessionTtsModelUploadResultListFc
        modelUploadJobs={props.ttsModelUploadJobs}
        />
    </div>
  )
}

export { UploadTtsModelFc };
