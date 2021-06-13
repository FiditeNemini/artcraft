import React, { useState, useEffect, useCallback } from 'react';
import { ApiConfig, ListW2lInferenceResultsForUserArgs } from '../../common/ApiConfig';
import { Link } from "react-router-dom";

interface W2lInferenceResultListResponsePayload {
  success: boolean,
  results: Array<W2lInferenceResult>,
  cursor_next: string | null | undefined,
  cursor_previous: string | null | undefined,
}

interface W2lInferenceResult {
  w2l_result_token: string,
  maybe_w2l_template_token?: string,
  maybe_tts_inference_result_token?: string,

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
  username: string,
}

function ProfileW2lInferenceResultsListFc(props: Props) {
  const [w2lResults, setW2lResults] = useState<Array<W2lInferenceResult>>([]);

  const [nextCursor, setNextCursor] = useState<string|null>(null);
  const [previousCursor, setPreviousCursor] = useState<string|null>(null);

  const getPage = useCallback((cursor : string|null, reverse: boolean) => {
    let args : ListW2lInferenceResultsForUserArgs = {
      username: props.username,
      limit: 5,
    };

    if (cursor !== null) {
      args.cursor = cursor;
      if (reverse) {
        args.cursor_is_reversed = true;
      }
    }

    const api = new ApiConfig();
    const endpointUrl = api.listW2lInferenceResultsForUser(args);

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const templatesResponse : W2lInferenceResultListResponsePayload  = res;
      if (!templatesResponse.success) {
        return;
      }

      setW2lResults(templatesResponse.results)
      setNextCursor(templatesResponse.cursor_next || null)
      setPreviousCursor(templatesResponse.cursor_previous || null)
    })
    .catch(e => {
    });
  }, [props.username]);

  useEffect(() => {
    getPage(null, false);
  }, [getPage, props.username]);

  let rows : Array<JSX.Element> = [];
  
  w2lResults.forEach(result => {
    let duration_seconds = result.duration_millis / 1000;
    let templateTitle = result.template_title.length < 5 ? `Title: ${result.template_title}` : result.template_title;

    let inferenceLink = `/w2l/result/${result.w2l_result_token}`;
    let templateLink = `/w2l/${result.maybe_w2l_template_token}`;

    rows.push(
      <tr key={result.w2l_result_token}>
          <th><Link to={inferenceLink}><span role="img" aria-label="result link">▶️</span> Result</Link></th>
        <th><Link to={templateLink}>{templateTitle}</Link></th>
        <td>(custom audio)</td>
        <td>{duration_seconds} s</td>
        <td>{result.created_at} s</td>
      </tr>
    );
  });

  // Disable if there is no "next" or "previous" cursor.
  // However, let the buttosn show up if there are no results (empty payload) 
  // to get unstuck. Come up with a better fix for this.
  let prevDisabled = !previousCursor && rows.length != 0;
  let nextDisabled = !nextCursor && rows.length != 0;

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th><abbr title="Detail">Result Link</abbr></th>
            <th><abbr title="Detail">Template</abbr></th>
            <th><abbr title="Detail">Audio Source</abbr></th>
            <th><abbr title="Detail">Duration</abbr></th>
            <th><abbr title="Value">Creation Date (UTC)</abbr></th>
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

export { ProfileW2lInferenceResultsListFc };
