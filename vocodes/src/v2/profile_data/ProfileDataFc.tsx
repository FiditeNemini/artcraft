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

function ProfileDataFc(props: Props) {
  //let history = useHistory();
  //let { templateSlug } = useParams();

  //const [w2lTemplate, setW2lTemplate] = useState<W2lTemplate|undefined>(undefined);

  useEffect(() => {
    /*const api = new ApiConfig();
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
    });*/
  }, []); // NB: Empty array dependency sets to run ONLY on mount

  return (
    <div>
      <h1 className="title is-1"> Profile Data </h1>
    </div>
  )
}

export { ProfileDataFc };
