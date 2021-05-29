import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../../v1/api/ApiConfig';
import { SessionWrapper } from '../../session/SessionWrapper';
import { RouteProps, useHistory, useParams, Link } from 'react-router-dom';
import { ProfileData_W2lTemplateListFc } from './ProfileData_W2lTemplateListFc';

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
  let { username } = useParams();

  return (
    <div>
      <h1 className="title is-1"> My Data (Models, Results, etc.) </h1>

      <h3 className="title is-3"> Uploaded Templates </h3>

      <ProfileData_W2lTemplateListFc username={username} />
      
    </div>
  )
}

export { ProfileDataFc };
