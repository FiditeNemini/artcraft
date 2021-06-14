import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../../common/ApiConfig';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';

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
    });
  }, [props.username]); // NB: Empty array dependency sets to run ONLY on mount

  const now = new Date();

  let rows : Array<JSX.Element> = [];
  
  ttsModels.forEach(model => {
    const modelTitle = model.title.length < 5 ? `Model: ${model.title}` : model.title;

    const modelLink = `/tts/${model.model_token}`;

    const createTime = new Date(model.created_at);
    const relativeCreateTime = formatDistance(createTime, now, { addSuffix: true });

    rows.push(
      <tr key={model.model_token}>
        <th><Link to={modelLink}>{modelTitle}</Link></th>
        <td>{relativeCreateTime}</td>
      </tr>
    );
  });

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th><abbr title="Model Name">Model Name</abbr></th>
            <th><abbr title="Creation Date">Creation Time</abbr></th>
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
