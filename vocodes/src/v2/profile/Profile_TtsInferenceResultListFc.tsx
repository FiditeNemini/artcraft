import React, { useState, useEffect, useCallback } from 'react';
import { ApiConfig, ListTtsInferenceResultsForUserArgs } from '../../common/ApiConfig';
import { Link } from "react-router-dom";

interface TtsInferenceResultListResponsePayload {
  success: boolean,
  results: Array<TtsInferenceResult>,
  cursor_next: string | null | undefined,
  cursor_previous: string | null | undefined,
}

interface TtsInferenceResult {
  tts_result_token: string,
  tts_model_token: string,
  raw_inference_text: string,

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
  const [ttsResults, setTtsResults] = useState<Array<TtsInferenceResult>>([]);

  const [nextCursor, setNextCursor] = useState<string|null>(null);
  const [previousCursor, setPreviousCursor] = useState<string|null>(null);

  const getPage = useCallback((cursor : string|null, reverse: boolean) => {
    let args : ListTtsInferenceResultsForUserArgs = {
      username: props.username,
      limit: 25,
    };

    if (cursor !== null) {
      args.cursor = cursor;
      if (reverse) {
        args.cursor_is_reversed = true;
      }
    }

    const api = new ApiConfig();
    const endpointUrl = api.listTtsInferenceResultsForUser(args);

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const modelsResponse : TtsInferenceResultListResponsePayload  = res;
      if (!modelsResponse.success) {
        return;
      }

      setTtsResults(modelsResponse.results)
      setNextCursor(modelsResponse.cursor_next || null)
      setPreviousCursor(modelsResponse.cursor_previous || null)
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });
  }, [props.username]);

  useEffect(() => {
    getPage(null, false);
  }, [getPage, props.username]); // NB: Empty array dependency sets to run ONLY on mount

  let rows : Array<JSX.Element> = [];
  
  ttsResults.forEach(result => {
    let duration_seconds = result.duration_millis / 1000;

    let inferenceLink = `/tts/result/${result.tts_result_token}`;
    let modelLink = `/tts/${result.tts_model_token}`;

    let text = result.raw_inference_text.length < 5 ? `Result: ${result.raw_inference_text}` : result.raw_inference_text;

    rows.push(
      <tr key={result.tts_result_token}>
        <th>
          <Link to={inferenceLink}><span role="img" aria-label="result link">▶️</span> {text}</Link>
          &nbsp;
        </th>
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
            <th><abbr title="Detail">Download &amp; Play Link</abbr></th>
            <th><abbr title="Detail">Model</abbr></th>
            <th><abbr title="Detail">Duration</abbr></th>
            <th><abbr title="Value">Creation Date (UTC)</abbr></th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>

      <button className="button is-info" onClick={() => getPage(previousCursor, true)}>&lt; Get newer</button> &nbsp;
      <button className="button is-info" onClick={() => getPage(nextCursor, false)}>Get older&gt;</button>
    </div>
  )
}

export { ProfileTtsInferenceResultsListFc };
