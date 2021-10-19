import React, { useState } from 'react';
import { ApiConfig } from '../../../common/ApiConfig';
import { SessionTtsModelUploadResultListFc } from '../_common/SessionTtsModelUploadResultsListFc';
import { SessionWrapper } from '../../../session/SessionWrapper';
import { TtsModelUploadJob } from '../../../jobs/TtsModelUploadJobs';
import { useHistory, Link } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { DiscordLink } from '../_common/DiscordLink';

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
    return <div>You need to create an account or sign in.</div>
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

      <div className="notification is-info is-light">
        <strong>Content Creator Rewards!</strong> 
        {/*<p>You can help FakeYou grow by uploading Tacotron2 models. 
        The person that uploads the most models will get $100, 
        the person that uploads the most popular model will get $100,
        and a number of other lucky winners will be chosen at random to 
        recieve cash prizes. Uploaders will also get queue priority!</p>*/}
        <p>
          Details are coming soon. 
          The more you upload and help us grow, the more you can earn. We'll be paying for number of 
          models uploaded as well as frequency of use and quality of training. Stay tuned.
        </p>
      </div>

      <p>
        If you're new to voice cloning, join our <DiscordLink /> to get started. We have a friendly 
        community that can help you start creating your own voices of your favorite characters.
      </p>

      <br />

      <p>
        FakeYou currently supports <em>Tacotron 2</em>, GlowTTS, and a custom synthesizer architecture 
        that we intend to open source. We'll soon add TalkNet, custom vocoder uploads, and more model 
        architectures.
      </p>

      <br />

      <p>
        Once your voice is successfully uploaded, you'll be able to start using it and sharing it 
        with others. You'll also be able to edit the title, tags, and vocoder used, so don't worry
        if you typo something.
      </p>

      <br />

      <p>
        Please do not upload voices that you didn't train yourself or voices of individuals
        who wish to not be voice cloned. We'll post a list of banned voices soon.
      </p>

      <br />

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

      <br />
      <br />

      <SessionTtsModelUploadResultListFc
        modelUploadJobs={props.ttsModelUploadJobs}
        />
    </div>
  )
}

export { UploadTtsModelFc };
