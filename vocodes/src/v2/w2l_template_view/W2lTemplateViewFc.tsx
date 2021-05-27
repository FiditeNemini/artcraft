import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../../v1/api/ApiConfig';
import { SessionWrapper } from '../../session/SessionWrapper';
import { RouteProps, useHistory, useParams, Link } from 'react-router-dom';

interface W2lTemplateViewResponsePayload {
  success: boolean,
  template: W2lTemplate,
}

interface W2lTemplate {
  template_token: string,
  template_type: string,
  creator_user_token: string,
  username: string,
  display_name: string,
  updatable_slug: string,
  title: string,
  frame_width: number,
  frame_height: number,
  duration_millis: number,
  maybe_image_object_name: string,
  maybe_video_object_name: string,
  created_at: string,
  updated_at: string,
}

interface Props {
  sessionWrapper: SessionWrapper,
}

function W2lTemplateViewFc(props: Props) {
  let history = useHistory();
  let { templateSlug } = useParams();

  const [w2lTemplate, setW2lTemplate] = useState<W2lTemplate|undefined>(undefined);

  useEffect(() => {
    const api = new ApiConfig();
    const endpointUrl = api.viewW2l(templateSlug);

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
      const templatesResponse : W2lTemplateViewResponsePayload = res;
      if (!templatesResponse.success) {
        return;
      }

      setW2lTemplate(templatesResponse.template)
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });
  }, []); // NB: Empty array dependency sets to run ONLY on mount

  let creatorLink=`/profile/${w2lTemplate?.display_name}`;

  let object : string|undefined = undefined;
  
  if (w2lTemplate?.maybe_image_object_name !== undefined && w2lTemplate?.maybe_image_object_name !== null) {
    object = w2lTemplate!.maybe_image_object_name;
  } else if (w2lTemplate?.maybe_video_object_name !== undefined && w2lTemplate?.maybe_video_object_name !== null) {
    object = w2lTemplate!.maybe_video_object_name;
  } else {
  }

  let url = `https://storage.googleapis.com/dev-vocodes-public${object}`;

  return (
    <div>
      <h1 className="title is-1"> Video lip sync template </h1>

      <img src={url} alt="template preview" />

      <table className="table">
        <thead>
          <tr>
            <th><abbr title="Detail">Detail</abbr></th>
            <th><abbr title="Value">Value</abbr></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Creator</th>
            <td>
              <Link to={creatorLink}>{w2lTemplate?.display_name}</Link>
            </td>
          </tr>
          <tr>
            <th>Media Type</th>
            <td>{w2lTemplate?.template_type}</td>
          </tr>
          <tr>
            <th>Dimensions</th>
            <td>{w2lTemplate?.frame_width} x {w2lTemplate?.frame_height}</td>
          </tr>
          <tr>
            <th>Duration (milliseconds)</th>
            <td>{w2lTemplate?.duration_millis}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export { W2lTemplateViewFc };
