import React, { useState, useEffect, useCallback } from 'react';
import { ApiConfig, ListTtsInferenceResultsForUserArgs } from '../../../common/ApiConfig';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';

interface TtsInferenceResultListResponsePayload {
  success: boolean,
  results: Array<TtsInferenceResult>,
  cursor_next: string | null | undefined,
  cursor_previous: string | null | undefined,
}

interface TtsInferenceResult {
  tts_result_token: string,

  tts_model_token: string,
  tts_model_title: string,

  raw_inference_text: string,

  maybe_creator_user_token?: string,
  maybe_creator_username?: string,
  maybe_creator_display_name?: string,

  maybe_creator_result_id: number | null,

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
    });
  }, [props.username]);

  useEffect(() => {
    getPage(null, false);
  }, [getPage, props.username]);

  const now = new Date();

  let rows : Array<JSX.Element> = [];
  
  ttsResults.forEach(result => {
    const duration_seconds = result.duration_millis / 1000;

    const inferenceLink = `/tts/result/${result.tts_result_token}`;
    const modelLink = `/tts/${result.tts_model_token}`;

    const text = result.raw_inference_text.length < 5 ? `Result: ${result.raw_inference_text}` : result.raw_inference_text;

    const createTime = new Date(result.created_at);
    const relativeCreateTime = formatDistance(createTime, now, { addSuffix: true });

    rows.push(
      <tr key={result.tts_result_token}>
        <td>{result.maybe_creator_result_id}</td>
        <th>
          <Link to={inferenceLink}><span role="img" aria-label="result link">▶️</span> {text}</Link>
          &nbsp;
        </th>
        <th><Link to={modelLink}>Model: {result.tts_model_title}</Link></th>
        <td>{duration_seconds} s</td>
        <td>{relativeCreateTime}</td>
      </tr>
    );
  });

  // Disable if there is no "next" or "previous" cursor.
  // However, let the buttosn show up if there are no results (empty payload) 
  // to get unstuck. Come up with a better fix for this.
  let prevDisabled = !previousCursor && rows.length !== 0;
  let nextDisabled = !nextCursor && rows.length !== 0;

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th><abbr title="Detail">#</abbr></th>
            <th><abbr title="Detail">Download &amp; Play Link</abbr></th>
            <th><abbr title="Detail">Model</abbr></th>
            <th><abbr title="Detail">Duration</abbr></th>
            <th><abbr title="Value">Creation Time</abbr></th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>

      <button className="button is-info" onClick={() => getPage(previousCursor, true)} disabled={prevDisabled}>&lt; Get newer</button> &nbsp;
      <button className="button is-info" onClick={() => getPage(nextCursor, false)} disabled={nextDisabled}>Get older&gt;</button>
    </div>
  )
}

export { ProfileTtsInferenceResultsListFc };
