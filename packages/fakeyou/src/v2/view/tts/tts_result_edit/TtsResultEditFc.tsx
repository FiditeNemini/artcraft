import React, { useState, useEffect, useCallback } from 'react';
import { ApiConfig } from '@storyteller/components';
import { SessionWrapper } from '../../../../session/SessionWrapper';
import { useParams, Link, useHistory } from 'react-router-dom';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';
import { VisibleIconFc } from '../../_icons/VisibleIcon';
import { HiddenIconFc } from '../../_icons/HiddenIcon';

const DEFAULT_VISIBILITY = 'public';

interface TtsInferenceResultResponsePayload {
  success: boolean,
  result: TtsInferenceResult,
}

interface TtsInferenceResult {
  tts_result_token: string,

  tts_model_token: string,
  tts_model_title: string,

  raw_inference_text: string,

  maybe_creator_user_token?: string,
  maybe_creator_username?: string,
  maybe_creator_display_name?: string,
  maybe_creator_gravatar_hash?: string,

  maybe_model_creator_user_token?: string,
  maybe_model_creator_username?: string,
  maybe_model_creator_display_name?: string,
  maybe_model_creator_gravatar_hash?: string,

  public_bucket_wav_audio_path: string,
  public_bucket_spectrogram_path: string,

  creator_set_visibility?: string,

  file_size_bytes: number,
  duration_millis: number,
  created_at: string,
  updated_at: string,

  maybe_moderator_fields: TtsInferenceResultModeratorFields | null | undefined,
}

interface TtsInferenceResultModeratorFields {
  creator_ip_address: string,
  mod_deleted_at: string | undefined | null,
  user_deleted_at: string | undefined | null,
}

interface Props {
  sessionWrapper: SessionWrapper,
}

function TtsResultEditFc(props: Props) {
  let { token } : { token : string } = useParams();

  const history = useHistory();

  const [ttsInferenceResult, setTtsInferenceResult] = useState<TtsInferenceResult|undefined>(undefined);
  const [visibility, setVisibility] = useState<string>(DEFAULT_VISIBILITY);

  const getTtsResult = useCallback((token) => {
    const api = new ApiConfig();
    const endpointUrl = api.viewTtsInferenceResult(token);

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const modelsResponse : TtsInferenceResultResponsePayload = res;
      if (!modelsResponse.success) {
        return;
      }

      setTtsInferenceResult(modelsResponse.result);
      setVisibility(modelsResponse?.result?.creator_set_visibility || DEFAULT_VISIBILITY);
    })
    .catch(e => {
    });
  }, []);

  useEffect(() => {
    getTtsResult(token);
  }, [token, getTtsResult]);

  const handleVisibilityChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    setVisibility((ev.target as HTMLSelectElement).value)
  };

  const resultLink = FrontendUrlConfig.ttsResultPage(token);

  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) => { 
    ev.preventDefault();

    if (!ttsInferenceResult) {
      return false;
    }

    const resultToken = ttsInferenceResult!.tts_result_token;

    const api = new ApiConfig();
    const endpointUrl = api.editTtsInferenceResult(resultToken);
    
    const request = {
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

      history.push(resultLink);
    })
    .catch(e => {
    });

    return false;
  };

  let isDisabled = !ttsInferenceResult;

  const visibilityIcon = (visibility === 'public') ? <VisibleIconFc /> : <HiddenIconFc />;

  return (
    <div className="content">
      <h1 className="title is-1"> Edit Result Visibility </h1>

      <p>
        <Link to={resultLink}>&lt; Back to result </Link>
      </p>

      <form onSubmit={handleFormSubmit}>
        <fieldset disabled={isDisabled}>

          <div className="field">
            <label className="label">
              Result Visibility&nbsp;{visibilityIcon}
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

export { TtsResultEditFc };

