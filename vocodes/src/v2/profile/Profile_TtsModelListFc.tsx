import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../../common/ApiConfig';
import { Link } from "react-router-dom";
import { getRandomInt } from '../../v1/api/Utils';

interface TtsModelListResponsePayload {
  success: boolean,
  models: Array<TtsModel>,
}

interface TtsModel {
  model_token: string,
  tts_model_type: string,
  title: string,
  updatable_slug: string,
  // TODO: No need for "creator_*" fields. Remove them from backend.
  is_mod_disabled: boolean,
  created_at: string,
  updated_at: string,
}

interface Props {
  username: string,
}

function ProfileTtsModelListFc(props: Props) {
  const [ttsModels, setTtsModels] = useState<Array<TtsModel>>([]);

  useEffect(() => {
    const api = new ApiConfig();
    const endpointUrl = api.listTtsModelsForUser(props.username);

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const modelsResponse : TtsModelListResponsePayload  = res;
      if (!modelsResponse.success) {
        return;
      }

      setTtsModels(modelsResponse.models)
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });
  }, [props.username]); // NB: Empty array dependency sets to run ONLY on mount

  let rows : Array<JSX.Element> = [];
  
  ttsModels.forEach(model => {
    let modelTitle = model.title.length < 5 ? `Model: ${model.title}` : model.title;

    let modelLink = `/tts/${model.model_token}`;

    rows.push(
      <tr key={model.model_token}>
        <th><Link to={modelLink}>{modelTitle}</Link></th>
        <td>{model.created_at} s</td>
      </tr>
    );
  });

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th><abbr title="Model Name">Model Name</abbr></th>
            <th><abbr title="Creation Date">Creation Date (UTC)</abbr></th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  )
}

export { ProfileTtsModelListFc };
