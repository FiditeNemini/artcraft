import React, { useState } from 'react';
import { ApiConfig } from '@storyteller/components';
import { SessionW2lTemplateUploadResultListFc } from '../_common/SessionW2lTemplateUploadResultsListFc';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { W2lTemplateUploadJob } from '@storyteller/components/src/jobs/W2lTemplateUploadJobs';
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { BackLink } from '../_common/BackLink';
import { FrontendUrlConfig } from '../../../common/FrontendUrlConfig';

interface W2lTemplateUploadJobResponsePayload {
  success: boolean,
  job_token?: string,
}

interface Props {
  sessionWrapper: SessionWrapper,
  enqueueW2lTemplateUploadJob: (jobToken: string) => void,
  w2lTemplateUploadJobs: Array<W2lTemplateUploadJob>,
}

function UploadW2lVideoFc(props: Props) {
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
    const endpointUrl = api.uploadW2l();
    
    let idempotencyToken = uuidv4();

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
      let response : W2lTemplateUploadJobResponsePayload = res;
      
      if (!response.success || response.job_token === undefined) {
        return;
      }

      console.log('enqueuing...')

      props.enqueueW2lTemplateUploadJob(response.job_token);
      history.push('/');
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });

    return false;
  }


  return (
    <div>
      <h1 className="title is-1"> Upload Video (w2l template) </h1>

      <p>
        The videos you upload can be used for lipsyncing with audio using the Wav2Lip model.
      </p>

      <br />

      <form onSubmit={handleFormSubmit}>
        <div className="field">
          <label className="label">Title, eg. "Morshu tells you things"</label>
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
      <br />

      <BackLink link={FrontendUrlConfig.contributePage()} text="Back to contribute page" />

      <br />
      <br />

      <SessionW2lTemplateUploadResultListFc
        w2lTemplateUploadJobs={props.w2lTemplateUploadJobs}
        />

    </div>
  )
}

export { UploadW2lVideoFc };
