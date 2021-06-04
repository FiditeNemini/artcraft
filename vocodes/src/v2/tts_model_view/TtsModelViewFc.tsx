
import React, { useState, useEffect } from 'react';
//import axios from 'axios';
import { ApiConfig } from '../../v1/api/ApiConfig';
import { EnqueueJobResponsePayload } from '../tts_model_list/TtsModelFormFc';
import { SessionTtsInferenceResultListFc } from '../common/SessionTtsInferenceResultsListFc';
import { SessionWrapper } from '../../session/SessionWrapper';
import { TtsInferenceJob } from '../../App';
import { useParams, Link } from 'react-router-dom';
import { v1 as uuidv1 } from 'uuid';

interface TtsModelViewResponsePayload {
  success: boolean,
  model: TtsModel,
}

interface TtsModel {
  model_token: string,
  title: string,
  tts_model_type: string,
  text_preprocessing_algorithm: string,
  creator_user_token: string,
  creator_username: string,
  creator_display_name: string,
  updatable_slug: string,
  created_at: string,
  updated_at: string,
}

interface Props {
  sessionWrapper: SessionWrapper,
  enqueueTtsJob: (jobToken: string) => void,
  ttsInferenceJobs: Array<TtsInferenceJob>,
}

function TtsModelViewFc(props: Props) {
  let { token } = useParams();

  const [ttsModel, setTtsModel] = useState<TtsModel|undefined>(undefined);
  const [text, setText] = useState<string>("");

  useEffect(() => {
    const api = new ApiConfig();
    const endpointUrl = api.viewTtsModel(token);

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const modelsResponse : TtsModelViewResponsePayload = res;
      if (!modelsResponse.success) {
        return;
      }

      setTtsModel(modelsResponse.model)
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });
  }, [token]); // NB: Empty array dependency sets to run ONLY on mount

  /*const handleAudioFileChange = (fileList: FileList|null) => {
    if (fileList === null 
        || fileList === undefined
        || fileList.length < 1) {
      setAudioFile(undefined);
    }

    let file = fileList![0];
    setAudioFile(file);
  };*/


  const handleChangeText = (ev: React.FormEvent<HTMLTextAreaElement>) => { 
    ev.preventDefault();
    const textValue = (ev.target as HTMLTextAreaElement).value;

    setText(textValue);

    return false;
  };


  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) => { 
    ev.preventDefault();

    if (ttsModel === undefined) {
      return false;
    }

    if (text === undefined) {
      return false;
    }

    const modelToken = ttsModel!.model_token;

    const api = new ApiConfig();
    const endpointUrl = api.inferTts();
    
    // TODO: Idempotency token.
    const request = {
      uuid_idempotency_token: uuidv1(),
      tts_model_token: modelToken,
      inference_text: text,
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
      let response : EnqueueJobResponsePayload = res;
      if (!response.success || response.inference_job_token === undefined) {
        return;
      }

      props.enqueueTtsJob(response.inference_job_token);
    })
    .catch(e => {
    });

    return false;
  };

  const handleCancelClick = (ev: React.FormEvent<HTMLButtonElement>) => { 
    ev.preventDefault();
    return false;
  };

  let creatorLink=`/profile/${ttsModel?.creator_username}`;

  let title = 'TTS Model'
  if (ttsModel?.title !== undefined) {
      title = `${ttsModel.title} model`;
  }
  
  return (
    <div>
      <h1 className="title is-1"> {title} </h1>

      <table className="table">
        <thead>
          <tr>
            <th><abbr title="Detail">Detail</abbr></th>
            <th><abbr title="Value">Value</abbr></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Creator</th>
            <td>
              <Link to={creatorLink}>{ttsModel?.creator_display_name}</Link>
            </td>
          </tr>
          <tr>
            <th>Title</th>
            <td>{ttsModel?.title}</td>
          </tr>
          <tr>
            <th>Model Type</th>
            <td>{ttsModel?.tts_model_type}</td>
          </tr>
          <tr>
            <th>Text Preprocessing Algorithm</th>
            <td>{ttsModel?.text_preprocessing_algorithm}</td>
          </tr>
          <tr>
            <th>Upload Date (UTC)</th>
            <td>{ttsModel?.created_at}</td>
          </tr>
        </tbody>
      </table>

      <br />

      <h3 className="title is-3"> Use Model </h3>

      <form onSubmit={handleFormSubmit}>
        <textarea 
            onChange={handleChangeText}
            className="textarea is-large" 
            placeholder="Textual shenanigans go here..."></textarea>

        <button className="button is-large is-fullwidth is-success">Submit</button>
      </form>
    
      <br />
      <br />
      <Link to="/">&lt; Back to all models</Link>

      <br />

      <br />
      <br />

      <SessionTtsInferenceResultListFc ttsInferenceJobs={props.ttsInferenceJobs} />
      <br />
    </div>
  )
}

export { TtsModelViewFc };
