
import React, { useState, useEffect, useCallback } from 'react';
//import axios from 'axios';
import { ApiConfig } from '../../../common/ApiConfig';
import { SessionWrapper } from '../../../session/SessionWrapper';
import { TtsInferenceJob } from '../../../App';
import { useParams, Link, useHistory } from 'react-router-dom';
import { FrontendUrlConfig } from '../../../common/FrontendUrlConfig';
import { VisibleIconFc } from '../../../icons/VisibleIconFc';
import { HiddenIconFc } from '../../../icons/HiddenIconFc';

const DEFAULT_VISIBILITY = 'public';

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
  description_markdown: string,
  description_rendered_html: string,
  creator_set_visibility: string,
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

function TtsModelEditFc(props: Props) {
  let { token } = useParams() as { token : string };

  const history = useHistory();

  const [ttsModel, setTtsModel] = useState<TtsModel|undefined>(undefined);
  const [title, setTitle] = useState<string>("");
  const [descriptionMarkdown, setDescriptionMarkdown] = useState<string>("");
  const [visibility, setVisibility] = useState<string>(DEFAULT_VISIBILITY);

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

      setTitle(modelsResponse.model.title || "")
      setDescriptionMarkdown(modelsResponse.model.description_markdown || "")
      setVisibility(modelsResponse.model.creator_set_visibility || DEFAULT_VISIBILITY);
      setTtsModel(modelsResponse.model);
    })
    .catch(e => {});
  }, []);


  useEffect(() => {
    getModel(token);
  }, [token, getModel]);

  const handleTitleChange = (ev: React.FormEvent<HTMLInputElement>) => { 
    ev.preventDefault();
    const textValue = (ev.target as HTMLInputElement).value;
    setTitle(textValue);
    return false;
  };

  const handleDescriptionMarkdownChange = (ev: React.FormEvent<HTMLTextAreaElement>) => { 
    ev.preventDefault();
    const textValue = (ev.target as HTMLTextAreaElement).value;
    setDescriptionMarkdown(textValue);
    return false;
  };

  const handleVisibilityChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    setVisibility((ev.target as HTMLSelectElement).value)
  };

  const modelLink = FrontendUrlConfig.ttsModelPage(token);

  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) => { 
    ev.preventDefault();

    if (ttsModel === undefined) {
      return false;
    }

    if (title.trim() === "") {
      return false;
    }

    const modelToken = ttsModel!.model_token;

    const api = new ApiConfig();
    const endpointUrl = api.editTtsModel(modelToken);
    
    const request = {
      title: title,
      description_markdown: descriptionMarkdown,
      creator_set_visibility: visibility || DEFAULT_VISIBILITY,
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
      if (res === undefined ||
        !res.success) {
        return; // Endpoint error?
      }

      history.push(modelLink);
    })
    .catch(e => {
    });

    return false;
  };

  let isDisabled = ttsModel === undefined;

  const visibilityIcon = (visibility === 'public') ? <VisibleIconFc /> : <HiddenIconFc />;

  return (
    <div className="content">
      <h1 className="title is-1"> Edit Model </h1>

      <p>
        <Link to={modelLink}>&lt; Back to model</Link>
      </p>

      <form onSubmit={handleFormSubmit}>
        <fieldset disabled={isDisabled}>

          <div className="field">
            <label className="label">Model Title</label>
            <div className="control has-icons-left has-icons-right">
              <input 
                onChange={handleTitleChange}
                className="input" 
                type="text" 
                placeholder="Model Title" 
                value={title}
                />
              <span className="icon is-small is-left">
                <i className="fas fa-envelope"></i>
              </span>
              <span className="icon is-small is-right">
                <i className="fas fa-exclamation-triangle"></i>
              </span>
            </div>
            {/*<p className="help">{invalidReason}</p>*/}
          </div>

          <div className="field">
            <label className="label">Description (supports Markdown)</label>
            <div className="control">
              <textarea 
                onChange={handleDescriptionMarkdownChange}
                className="textarea is-large" 
                placeholder="Model description (ie. source of data, training duration, etc)"
                value={descriptionMarkdown} 
                />
            </div>
          </div>

          <div className="field">
            <label className="label">
              Model Visibility&nbsp;{visibilityIcon}
            </label>
            <div className="control select">
              <select 
                name="creator_set_visibility" 
                onChange={handleVisibilityChange}
                value={visibility}
                >
                <option value="public">Public (visible from your profile)</option>
                <option value="hidden">Unlisted (shareable URLs)</option>
              </select>
            </div>
          </div>

          <br />

          <button className="button is-link is-large is-fullwidth">Update</button>

        </fieldset>
      </form>

      
    </div>
  )
}

export { TtsModelEditFc };
