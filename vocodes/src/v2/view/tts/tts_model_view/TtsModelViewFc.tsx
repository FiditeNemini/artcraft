import React, { useState, useEffect, useCallback } from 'react';
import { ApiConfig } from '../../../../common/ApiConfig';
import { EnqueueJobResponsePayload } from '../tts_model_list/TtsModelFormFc';
import { SessionTtsInferenceResultListFc } from '../../_common/SessionTtsInferenceResultsListFc';
import { SessionWrapper } from '../../../../session/SessionWrapper';
import { TtsInferenceJob } from '../../../../App';
import { useParams, Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';
import { HiddenIconFc } from '../../_icons/HiddenIcon';
import { VisibleIconFc } from '../../_icons/VisibleIcon';
import { GetTtsModel, TtsModel } from '../../../api/tts/GetTtsModel';
import { GravatarFc } from '../../_common/GravatarFc';

interface TtsModelUseCountResponsePayload {
  success: boolean,
  count: number | null | undefined,
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

  const getModel = useCallback(async (token) => {
    const model = await GetTtsModel(token);
    if (model) {
      setTtsModel(model);
    }
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

  let creatorLink = <span />;

  if (!!ttsModel?.creator_display_name) {
    const creatorUrl = FrontendUrlConfig.userProfilePage(ttsModel?.creator_username);
    creatorLink = (
      <span>
        <GravatarFc
          size={15}
          username={ttsModel.creator_display_name || ""} 
          email_hash={ttsModel.creator_gravatar_hash || ""} 
          />
        &nbsp;
        <Link to={creatorUrl}>{ttsModel.creator_display_name}</Link>
      </span>
    );
  }

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
          <td colSpan={2}>
            <br />
            <h4 className="subtitle is-4"> Moderator Details </h4>
          </td>
        </tr>
        <tr>
          <th>Creation IP address</th>
          <td>{ttsModel?.maybe_moderator_fields?.creator_ip_address_creation || "server error"}</td>
        </tr>
        <tr>
          <th>Update IP address</th>
          <td>{ttsModel?.maybe_moderator_fields?.creator_ip_address_last_update || "server error"}</td>
        </tr>
        <tr>
          <th>Mod deleted at (UTC)</th>
          <td>{ttsModel?.maybe_moderator_fields?.mod_deleted_at || "not deleted"}</td>
        </tr>
        <tr>
          <th>User deleted at (UTC)</th>
          <td>{ttsModel?.maybe_moderator_fields?.user_deleted_at || "not deleted"}</td>
        </tr>
      </>
    );
  }

  let editModelButton = <span />;

  if (props.sessionWrapper.canEditTtsModelByUserToken(ttsModel?.creator_user_token)) {
    editModelButton = (
      <>
        <br />
        <Link 
          className={"button is-large is-info is-fullwidth"}
          to={FrontendUrlConfig.ttsModelEditPage(token)}
          >Edit Model Details</Link>
      </>
    );
  }

  let deleteModelButton = <span />;

  if (props.sessionWrapper.canDeleteTtsModelByUserToken(ttsModel?.creator_user_token)) {

    const currentlyDeleted = !!ttsModel?.maybe_moderator_fields?.mod_deleted_at || 
        !!ttsModel?.maybe_moderator_fields?.user_deleted_at;

    const deleteButtonTitle = currentlyDeleted ? "Undelete Model?" : "Delete Model?";

    const deleteButtonCss = currentlyDeleted ? 
      "button is-warning is-large is-fullwidth" :
      "button is-danger is-large is-fullwidth";

    deleteModelButton = (
      <>
        <br />
        <Link 
          className={deleteButtonCss}
          to={FrontendUrlConfig.ttsModelDeletePage(token)}
          >{deleteButtonTitle}</Link>
      </>
    );
  }

  let modelDescription = null;

  if (!!ttsModel?.description_rendered_html) {
    modelDescription = (
      <>
        <h4 className="title is-4"> Model Description </h4>
        <div 
          className="profile content is-medium" 
          dangerouslySetInnerHTML={{__html: ttsModel?.description_rendered_html || ""}}
          />
      </>
    );
  }

  const resultVisibility = ttsModel?.creator_set_visibility === 'hidden' ? 
    <span>Hidden <HiddenIconFc /></span> :
    <span>Public <VisibleIconFc /></span> ;

  let defaultVocoder = 'not set';
  switch (ttsModel?.maybe_default_pretrained_vocoder) {
    case 'hifigan-superres':
      defaultVocoder = 'HiFi-GAN'
      break;
    case 'waveglow':
      defaultVocoder = 'WaveGlow'
      break;
  }

  return (
    <div className="content">
      <h1 className="title is-1"> {title} </h1>
      
      <p>
        <Link to="/">&lt; Back to all models</Link>
      </p>
      
      <h4 className="title is-4"> Use Model </h4>

      <form onSubmit={handleFormSubmit}>
        <textarea 
            onChange={handleChangeText}
            className="textarea is-large" 
            placeholder="Textual shenanigans go here..."></textarea>

        <button className="button is-large is-fullwidth is-success">Submit</button>
      </form>

      <br />
      
      <SessionTtsInferenceResultListFc ttsInferenceJobs={props.ttsInferenceJobs} />
    
      {modelDescription}

      <table className="table is-fullwidth">
        <tbody>
          <tr>
            <td colSpan={2}>
              <h4 className="subtitle is-4"> Model Details </h4>
            </td>
          </tr>
          <tr>
            <th>Creator</th>
            <td>
              {creatorLink}
            </td>
          </tr>
          <tr>
            <th>Use count</th>
            <td>{humanUseCount}</td>
          </tr>
          <tr>
            <th>Title</th>
            <td>{ttsModel?.title}</td>
          </tr>
          <tr>
            <th>Model type</th>
            <td>{ttsModel?.tts_model_type}</td>
          </tr>
          <tr>
            <th>Default vocoder</th>
            <td>{defaultVocoder}</td>
          </tr>
          <tr>
            <th>Text preprocessing algorithm</th>
            <td>{ttsModel?.text_preprocessing_algorithm}</td>
          </tr>
          <tr>
            <th>Upload date (UTC)</th>
            <td>{ttsModel?.created_at}</td>
          </tr>
          <tr>
            <th>Visibility</th>
            <td>{resultVisibility}</td>
          </tr>

          {moderatorRows}

        </tbody>
      </table>

      {editModelButton}

      {deleteModelButton}

      <br />
      <br />
      <Link to="/">&lt; Back to all models</Link>
    </div>
  )
}

export { TtsModelViewFc };
