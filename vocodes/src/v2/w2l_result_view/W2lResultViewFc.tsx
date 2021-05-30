import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../../v1/api/ApiConfig';
import { useHistory, useParams, Link } from 'react-router-dom';
import { SessionWrapper } from '../../session/SessionWrapper';

interface W2lInferenceResultResponsePayload {
  success: boolean,
  result: W2lInferenceResult,
}

interface W2lInferenceResult {
  w2l_result_token: string,
  maybe_w2l_template_token?: string,
  maybe_tts_inference_result_token?: string,
  public_bucket_video_path: string,
  template_type: string,
  template_title: string,
  maybe_creator_user_token?: string,
  maybe_creator_username?: string,
  maybe_creator_display_name?: string,
  file_size_bytes: number,
  frame_width: number,
  frame_height: number,
  duration_millis: number,
  created_at: string,
  updated_at: string,
}

interface Props {
  sessionWrapper: SessionWrapper,
}

function W2lResultViewFc(props: Props) {
  let history = useHistory();
  let { token } = useParams();

  const [w2lInferenceResult, setW2lInferenceResult] = useState<W2lInferenceResult|undefined>(undefined);

  useEffect(() => {
    const api = new ApiConfig();
    const endpointUrl = api.viewW2lInferenceResult(token);

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const templatesResponse : W2lInferenceResultResponsePayload = res;
      if (!templatesResponse.success) {
        return;
      }

      setW2lInferenceResult(templatesResponse.result)
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });
  }, []); // NB: Empty array dependency sets to run ONLY on mount

  if (w2lInferenceResult === undefined) {
    return <div />;
  }

  let videoLink = `https://storage.googleapis.com/dev-vocodes-public${w2lInferenceResult?.public_bucket_video_path}`; 

  return (
    <div>
      <h1 className="title is-1"> Lipsync Result </h1>

      <video width="80%" height="auto" controls={true}>
        <source src={videoLink} />
        Your device doesn't support video.
      </video> 

    </div>
  )
}

export { W2lResultViewFc };
