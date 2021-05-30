import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../../v1/api/ApiConfig';
import { Link } from "react-router-dom";

interface W2lInferenceResultListResponsePayload {
  success: boolean,
  results: Array<W2lInferenceResult>,
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

function Profile_W2lInferenceResultsListFc(props: Props) {
  const [w2lResults, setW2lResults] = useState<Array<W2lInferenceResult>>([]);

  useEffect(() => {
    const api = new ApiConfig();
    const endpointUrl = api.listW2lInferenceResultsForUser(props.username);

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      console.log('list', res);
      const templatesResponse : W2lInferenceResultListResponsePayload  = res;
      if (!templatesResponse.success) {
        return;
      }

      setW2lResults(templatesResponse.results)
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });
  }, []); // NB: Empty array dependency sets to run ONLY on mount

  let rows : Array<JSX.Element> = [];
  
  w2lResults.forEach(result => {
    let duration_seconds = result.duration_millis / 1000;
    let templateTitle = result.template_title.length < 5 ? `Title: ${result.template_title}` : result.template_title;

    let inferenceLink = `/w2l/result/${result.w2l_result_token}`;
    let templateLink = `/w2l/${result.maybe_w2l_template_token}`;

    rows.push(
      <tr>
        <th><Link to={inferenceLink}>▶️ Result</Link></th>
        <th><Link to={templateLink}>{templateTitle}</Link></th>
        <td>(custom audio)</td>
        <td>{duration_seconds} s</td>
        <td>{result.created_at} s</td>
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
            <th><abbr title="Detail">Audio Source</abbr></th>
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

export { Profile_W2lInferenceResultsListFc };
