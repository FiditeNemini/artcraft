import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../../common/ApiConfig';
import { Link } from "react-router-dom";

interface TtsInferenceResultListResponsePayload {
  success: boolean,
  results: Array<TtsInferenceResult>,
}

interface TtsInferenceResult {
  tts_result_token: string,
  tts_model_token: string,
  inference_text: string,

  maybe_creator_user_token?: string,
  maybe_creator_username?: string,
  maybe_creator_display_name?: string,

  file_size_bytes: number,
  duration_millis: number,

  created_at: string,
  updated_at: string,
}

interface Props {
  username: string,
}

function ProfileTtsInferenceResultsListFc(props: Props) {
  const [w2lResults, setW2lResults] = useState<Array<TtsInferenceResult>>([]);

  useEffect(() => {
    const api = new ApiConfig();
    const endpointUrl = api.listTtsInferenceResultsForUser(props.username);

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const templatesResponse : TtsInferenceResultListResponsePayload  = res;
      if (!templatesResponse.success) {
        return;
      }

      setW2lResults(templatesResponse.results)
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });
  }, [props.username]); // NB: Empty array dependency sets to run ONLY on mount

  let rows : Array<JSX.Element> = [];
  
  w2lResults.forEach(result => {
    let duration_seconds = result.duration_millis / 1000;

    let inferenceLink = `/tts/result/${result.tts_result_token}`;
    let modelLink = `/tts/${result.tts_model_token}`;

    rows.push(
      <tr key={result.tts_result_token}>
          <th><Link to={inferenceLink}><span role="img" aria-label="result link">▶️</span> Result</Link></th>
        <th><Link to={modelLink}>Model</Link></th>
        <td>{duration_seconds} s</td>
        <td>{result.created_at}</td>
      </tr>
    );
  });

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th><abbr title="Detail">Result Link</abbr></th>
            <th><abbr title="Detail">Template</abbr></th>
            <th><abbr title="Detail">Duration</abbr></th>
            <th><abbr title="Value">Creation Date (UTC)</abbr></th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  )
}

export { ProfileTtsInferenceResultsListFc };
