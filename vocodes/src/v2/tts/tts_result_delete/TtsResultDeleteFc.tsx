import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../../../common/ApiConfig';
import { SessionWrapper } from '../../../session/SessionWrapper';
import { useParams, Link, useHistory } from 'react-router-dom';
import { GravatarFc } from '../../common/GravatarFc';

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

function TtsResultDeleteFc(props: Props) {
  const history = useHistory();

  let { token } : { token: string } = useParams();

  const [ttsInferenceResult, setTtsInferenceResult] = useState<TtsInferenceResult|undefined>(undefined);

  useEffect(() => {
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

      setTtsInferenceResult(modelsResponse.result)
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });
  }, [token]); // NB: Empty array dependency sets to run ONLY on mount

  const currentlyDeleted = !!ttsInferenceResult?.maybe_moderator_fields?.mod_deleted_at || !!ttsInferenceResult?.maybe_moderator_fields?.user_deleted_at;

  const handleDeleteFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();

    const api = new ApiConfig();
    const endpointUrl = api.deleteTtsInferenceResult(token);

    const request = {
      set_delete: !currentlyDeleted,
      as_mod: props.sessionWrapper.deleteTtsResultAsMod(ttsInferenceResult?.maybe_creator_user_token)
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
      if (res.success) {
        if (props.sessionWrapper.canDeleteOtherUsersTtsResults()) {
          history.go(0); // force reload
        } else {
          history.push('/');
        }
      }
    })
    .catch(e => {
    });
    return false;
  }

  if (ttsInferenceResult === undefined) {
    return <div />;
  }

  let modelLink = `/tts/${ttsInferenceResult.tts_model_token}`;
  let durationSeconds = ttsInferenceResult?.duration_millis / 1000;
  let modelName = ttsInferenceResult.tts_model_title;

  let creatorDetails = <span>Anonymous user</span>;
  if (!!ttsInferenceResult.maybe_creator_user_token) {
    let creatorLink = `/profile/${ttsInferenceResult.maybe_creator_username}`;
    creatorDetails = (
      <span>
        <GravatarFc 
          size={15}
          username={ttsInferenceResult.maybe_creator_display_name || ""} 
          email_hash={ttsInferenceResult.maybe_creator_gravatar_hash || ""} 
          />
        &nbsp;
        <Link to={creatorLink}>{ttsInferenceResult.maybe_creator_display_name}</Link>
      </span>
    );
  }

  let modelCreatorDetails = <span>Anonymous user</span>;
  if (!!ttsInferenceResult.maybe_model_creator_user_token) {
    let modelCreatorLink = `/profile/${ttsInferenceResult.maybe_model_creator_username}`;
    modelCreatorDetails = (
      <span>
        <GravatarFc 
          size={15}
          username={ttsInferenceResult.maybe_model_creator_display_name || ""} 
          email_hash={ttsInferenceResult.maybe_model_creator_gravatar_hash || ""} 
          />
        &nbsp;
        <Link to={modelCreatorLink}>{ttsInferenceResult.maybe_model_creator_display_name}</Link>
      </span>
    );
  }

  const h1Title = currentlyDeleted ? "Undelete Result?" : "Delete Result?";

  const buttonTitle = currentlyDeleted ? "Confirm Undelete" : "Confirm Delete";

  const buttonCss = currentlyDeleted ? 
    "button is-warning is-large is-fullwidth" :
    "button is-danger is-large is-fullwidth";

  const formLabel = currentlyDeleted ? 
     "Recover the TTS Result (makes it visible again)" : 
     "Delete TTS Result (hides from everyone but mods)";

  return (
    <div>
      <h1 className="title is-1"> {h1Title} </h1>

      <table className="table">
        <thead>
          <tr>
            <th><abbr title="Detail">Detail</abbr></th>
            <th><abbr title="Value">Value</abbr></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Original Text</th>
            <td>
              {ttsInferenceResult.raw_inference_text}
            </td>
          </tr>
          <tr>
            <th>Audio Creator</th>
            <td>
              {creatorDetails}
            </td>
          </tr>
          <tr>
            <th>Model used</th>
            <td>
              <Link to={modelLink}>
                {modelName}
              </Link>
            </td>
          </tr>
          <tr>
            <th>Model creator</th>
            <td>
              {modelCreatorDetails}
            </td>
          </tr>
          <tr>
            <th>Duration</th>
            <td>{durationSeconds} seconds</td>
          </tr>

        </tbody>
      </table>

      <br />

      <form onSubmit={handleDeleteFormSubmit}>
        <label className="label">{formLabel}</label>

        <p className="control">
          <button className={buttonCss}>
            {buttonTitle}
          </button>
        </p>
      </form>

    </div>
  )
}

export { TtsResultDeleteFc };
