import React, { useState, useEffect, useCallback } from 'react';
import { ApiConfig } from '@storyteller/components';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { TtsInferenceJob } from '@storyteller/components/src/jobs/TtsInferenceJobs';
import { useParams, useHistory } from 'react-router-dom';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';
import { VisibleIconFc } from '../../_icons/VisibleIcon';
import { HiddenIconFc } from '../../_icons/HiddenIcon';
import { GetTtsModel, GetTtsModelIsErr, GetTtsModelIsOk, TtsModel, TtsModelLookupError } from '@storyteller/components/src/api/tts/GetTtsModel';
import { BackLink } from '../../_common/BackLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadphones, faHome } from '@fortawesome/free-solid-svg-icons';
import { faTwitch } from '@fortawesome/free-brands-svg-icons';
import { DEFAULT_MODEL_LANGUAGE, SUPPORTED_MODEL_LANGUAGE_TAG_TO_FULL } from '@storyteller/components/src/i18n/SupportedModelLanguages';

const DEFAULT_VISIBILITY = 'public';

const DEFAULT_PRETRAINED_VOCODER = 'hifigan-superres';

interface Props {
  sessionWrapper: SessionWrapper,
  enqueueTtsJob: (jobToken: string) => void,
  ttsInferenceJobs: Array<TtsInferenceJob>,
}

function TtsModelEditFc(props: Props) {
  let { token } = useParams() as { token : string };

  const history = useHistory();

  // Model lookup
  const [ttsModel, setTtsModel] = useState<TtsModel|undefined>(undefined);
  const [notFoundState, setNotFoundState] = useState<boolean>(false);

  // Fields
  const [title, setTitle] = useState<string>("");
  const [descriptionMarkdown, setDescriptionMarkdown] = useState<string>("");
  const [fullLanguageTag, setFullLanguageTag] = useState<string>(""); // NB: Should be full IETF, eg. ["en", "en-US", "es-419", etc.]
  const [visibility, setVisibility] = useState<string>(DEFAULT_VISIBILITY);
  const [defaultPretrainedVocoder, setDefaultPretrainedVocoder] = useState<string>(DEFAULT_PRETRAINED_VOCODER);
  const [isFrontPageFeatured, setIsFrontPageFeatured] = useState<boolean>(false);
  const [isTwitchFeatured, setIsTwitchFeatured] = useState<boolean>(false);

  const getModel = useCallback(async (token) => {
    const model = await GetTtsModel(token);

    if (GetTtsModelIsOk(model)) {
      setTtsModel(model);

      setTitle(model.title || "")
      setDescriptionMarkdown(model.description_markdown || "")
      setFullLanguageTag(model.ietf_language_tag || DEFAULT_MODEL_LANGUAGE)
      setVisibility(model.creator_set_visibility || DEFAULT_VISIBILITY);
      setDefaultPretrainedVocoder(model.maybe_default_pretrained_vocoder || DEFAULT_PRETRAINED_VOCODER);
      setIsFrontPageFeatured(model.is_front_page_featured|| false);
      setIsTwitchFeatured(model.is_twitch_featured || false);

    } else if (GetTtsModelIsErr(model))  {
      switch(model) {
        case TtsModelLookupError.NotFound:
          setNotFoundState(true);
          break;
      }
    }
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

  const handleSpokenLanguageChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    setFullLanguageTag((ev.target as HTMLSelectElement).value)
  };

  const handleVisibilityChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    setVisibility((ev.target as HTMLSelectElement).value)
  };

  const handleDefaultPretrainedVocoderChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    setDefaultPretrainedVocoder((ev.target as HTMLSelectElement).value)
  };

  const handleIsFrontPageFeaturedChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    const value = !((ev.target as HTMLSelectElement).value === 'false');
    setIsFrontPageFeatured(value);
  };

  const handleIsTwitchFeaturedChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    const value = !((ev.target as HTMLSelectElement).value === 'false');
    setIsTwitchFeatured(value);
  };

  const modelLink = FrontendUrlConfig.ttsModelPage(token);

  const isModerator = props.sessionWrapper.canEditOtherUsersTtsModels();

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
    
    let request : any = {
      title: title,
      description_markdown: descriptionMarkdown,
      creator_set_visibility: visibility || DEFAULT_VISIBILITY,
      maybe_default_pretrained_vocoder: defaultPretrainedVocoder || DEFAULT_PRETRAINED_VOCODER,
      ietf_language_tag: fullLanguageTag || DEFAULT_MODEL_LANGUAGE,
    }

    if (isModerator) {
      request.is_front_page_featured = isFrontPageFeatured;
      request.is_twitch_featured = isTwitchFeatured;
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

  if (notFoundState) {
    return (
      <h1 className="title is-1">Model not found</h1>
    );
  }

  if (!ttsModel) {
    return <div />
  }

  let optionalModeratorFields = <></>;

  if (isModerator) {
    let isFrontPageFeaturedFormValue = isFrontPageFeatured ? "true" : "false";
    let isTwitchFeaturedFormValue = isTwitchFeatured ? "true" : "false";

    optionalModeratorFields = (<>
      <div className="field">
        <label className="label">Is Front Page Featured? (Don't set too many!)</label>
        <div className="control has-icons-left">
          <div className="select">
            <select 
              name="default_pretrained_vocoder" 
              onChange={handleIsFrontPageFeaturedChange}
              value={isFrontPageFeaturedFormValue}
              >
              <option value="true">Yes (randomly used as a default)</option>
              <option value="false">No</option>
              
            </select>
          </div>
          <span className="icon is-small is-left">
            <FontAwesomeIcon icon={faHome} />
          </span>
        </div>
      </div>
      <div className="field">
        <label className="label">Is Twitch Featured? (Don't set too many!)</label>
        <div className="control has-icons-left">
          <div className="select">
            <select 
              name="default_pretrained_vocoder" 
              onChange={handleIsTwitchFeaturedChange}
              value={isTwitchFeaturedFormValue}
              >
              <option value="true">Yes (randomly used as a default)</option>
              <option value="false">No</option>
              
            </select>
          </div>
          <span className="icon is-small is-left">
            <FontAwesomeIcon icon={faTwitch} />
          </span>
        </div>
      </div>
    </>);
  }


  let isDisabled = ttsModel === undefined;

  const visibilityIcon = (visibility === 'public') ? <VisibleIconFc /> : <HiddenIconFc />;

  return (
    <div className="content">
      <h1 className="title is-1"> Edit Model </h1>

      <p>
        <BackLink link={modelLink} text="Back to model" />
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
                <FontAwesomeIcon icon={faHeadphones} />
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
            <label className="label">Model Spoken Language</label>
            <div className="control select">
              <select 
                onChange={handleSpokenLanguageChange}
                value={fullLanguageTag}
                >
                {Array.from(SUPPORTED_MODEL_LANGUAGE_TAG_TO_FULL, ([languageTag, description]) => {
                  return (<>
                    <option value={languageTag}>{description}</option>
                  </>);
                })}
              </select>
            </div>
          </div>

          <div className="field">
            <label className="label">Default vocoder</label>
            <div className="control select">
              <select 
                name="default_pretrained_vocoder" 
                onChange={handleDefaultPretrainedVocoderChange}
                value={defaultPretrainedVocoder}
                >
                <option value="hifigan-superres">HiFi-Gan (typically sounds best)</option>
                <option value="waveglow">WaveGlow</option>
              </select>
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

          {optionalModeratorFields}

          <br />

          <button className="button is-link is-large is-fullwidth">Update</button>

        </fieldset>
      </form>

      
    </div>
  )
}

export { TtsModelEditFc };
