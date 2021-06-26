
import React, { useState, useEffect, useCallback } from 'react';
//import axios from 'axios';
import { ApiConfig } from '../../../common/ApiConfig';
import { EnqueueJobResponsePayload } from '../tts_model_list/TtsModelFormFc';
import { SessionTtsInferenceResultListFc } from '../../common/SessionTtsInferenceResultsListFc';
import { SessionWrapper } from '../../../session/SessionWrapper';
import { TtsInferenceJob } from '../../../App';
import { useParams, Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

interface TtsModelViewResponsePayload {
  success: boolean,
  model: TtsModel,
}

interface TtsModelUseCountResponsePayload {
  success: boolean,
  count: number | null | undefined,
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
  maybe_moderator_fields: TtsModelModeratorFields | null | undefined,
}

interface TtsModelModeratorFields {
  creator_ip_address_creation: string,
  creator_ip_address_last_update: string,
  mod_deleted_at: string | undefined | null,
  user_deleted_at: string | undefined | null,
}

interface Props {
  sessionWrapper: SessionWrapper,
  enqueueTtsJob: (jobToken: string) => void,
  ttsInferenceJobs: Array<TtsInferenceJob>,
}

function TtsModelViewFc(props: Props) {
  let { token } = useParams() as { token : string };

  const [ttsModel, setTtsModel] = useState<TtsModel|undefined>(undefined);
  const [ttsModelUseCount, setTtsModelUseCount] = useState<number|undefined>(undefined);
  const [text, setText] = useState<string>("");

  const getModel = useCallback((token) => {
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
    .catch(e => {});
  }, []);

  const getModelUseCount = useCallback((token) => {
    const api = new ApiConfig();
    const endpointUrl = api.getTtsModelUseCount(token);

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const modelsResponse : TtsModelUseCountResponsePayload = res;
      if (!modelsResponse.success) {
        return;
      }

      setTtsModelUseCount(modelsResponse.count || 0)
    })
    .catch(e => {});
  }, []);


  useEffect(() => {
    getModel(token);
    getModelUseCount(token);
  }, [token, getModel, getModelUseCount]);

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
    
    const request = {
      uuid_idempotency_token: uuidv4(),
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

  let creatorLink=`/profile/${ttsModel?.creator_username}`;

  let title = 'TTS Model'
  if (ttsModel?.title !== undefined) {
      title = `${ttsModel.title} model`;
  }

  let humanUseCount : string | number = 'Fetching...';

  if (ttsModelUseCount !== undefined && ttsModelUseCount !== null) {
    humanUseCount = ttsModelUseCount;
  }

  let moderatorRows = null;

  if (props.sessionWrapper.canDeleteOtherUsersTtsResults() || props.sessionWrapper.canDeleteOtherUsersTtsModels()) {
    moderatorRows = (
      <>
        <tr>
          <th>Creator IP Address (Creation)</th>
          <td>{ttsModel?.maybe_moderator_fields?.creator_ip_address_creation || "server error"}</td>
        </tr>
        <tr>
          <th>Creator IP Address (Update)</th>
          <td>{ttsModel?.maybe_moderator_fields?.creator_ip_address_last_update || "server error"}</td>
        </tr>
        <tr>
          <th>Mod Deleted At (UTC)</th>
          <td>{ttsModel?.maybe_moderator_fields?.mod_deleted_at || "not deleted"}</td>
        </tr>
        <tr>
          <th>User Deleted At (UTC)</th>
          <td>{ttsModel?.maybe_moderator_fields?.user_deleted_at || "not deleted"}</td>
        </tr>
      </>
    );
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
            <th>Use Count</th>
            <td>{humanUseCount}</td>
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

          {moderatorRows}

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
