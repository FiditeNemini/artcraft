import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../../v1/api/ApiConfig';
import { SessionWrapper } from '../../session/SessionWrapper';
import { useParams, Link } from 'react-router-dom';
import { GravatarFc } from '../common/GravatarFc';

interface TtsInferenceResultResponsePayload {
  success: boolean,
  result: TtsInferenceResult,
}

interface TtsInferenceResult {
  tts_result_token: string,

  tts_model_token: string,
  tts_model_title: string,

  inference_text: string,

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
}

interface Props {
  sessionWrapper: SessionWrapper,
}

function TtsResultViewFc(props: Props) {
  let { token } = useParams();

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

  if (ttsInferenceResult === undefined) {
    return <div />;
  }

  let audioLink = `https://storage.googleapis.com/dev-vocodes-public${ttsInferenceResult?.public_bucket_wav_audio_path}`; 
  let modelLink = `/tts/${ttsInferenceResult.tts_model_token}`;

  let durationSeconds = ttsInferenceResult?.duration_millis / 1000;

  let modelName = ttsInferenceResult.tts_model_title;

  let creatorDetails = <span>Anonymous user</span>;
  if (ttsInferenceResult.maybe_creator_user_token !== undefined) {
    let creatorLink = `/profile/${ttsInferenceResult.maybe_creator_username}`;
    creatorDetails = (
      <span>
        <GravatarFc 
          size={15}
          username={ttsInferenceResult.maybe_creator_display_name} 
          email_hash={ttsInferenceResult.maybe_creator_gravatar_hash} 
          />
        &nbsp;
        <Link to={creatorLink}>{ttsInferenceResult.maybe_creator_display_name}</Link>
      </span>
    );
  }

  let modelCreatorDetails = <span>Anonymous user</span>;
  if (ttsInferenceResult.maybe_model_creator_user_token !== undefined) {
    let modelCreatorLink = `/profile/${ttsInferenceResult.maybe_model_creator_username}`;
    modelCreatorDetails = (
      <span>
        <GravatarFc 
          size={15}
          username={ttsInferenceResult.maybe_model_creator_display_name} 
          email_hash={ttsInferenceResult.maybe_model_creator_gravatar_hash} 
          />
        &nbsp;
        <Link to={modelCreatorLink}>{ttsInferenceResult.maybe_model_creator_display_name}</Link>
      </span>
    );
  }

  let headingTitle = 'TTS Result';
  let subtitle = <span />;
  if (ttsInferenceResult.tts_model_title !== undefined && ttsInferenceResult.tts_model_title !== null) {
    headingTitle = `${ttsInferenceResult.tts_model_title}`;
    subtitle = <h3 className="subtitle is-3"> TTS Result</h3>;
  }

  return (
    <div>
      <h1 className="title is-1"> {headingTitle} </h1>
      {subtitle}

      <audio
        controls
        src={audioLink}>
            Your browser does not support the
            <code>audio</code> element.
      </audio>

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
              {ttsInferenceResult.inference_text}
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

    </div>
  )
}

export { TtsResultViewFc };
