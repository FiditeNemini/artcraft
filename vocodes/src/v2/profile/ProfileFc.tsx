import React, { useEffect, useState }  from 'react';
import { ApiConfig } from '../../v1/api/ApiConfig';
import { GravatarFc } from '../common/GravatarFc';
import { Link } from 'react-router-dom';
import { ProfileTtsInferenceResultsListFc } from './Profile_TtsInferenceResultListFc';
import { ProfileTtsModelListFc } from './Profile_TtsModelListFc';
import { ProfileW2lInferenceResultsListFc } from './Profile_W2lInferenceResultListFc';
import { ProfileW2lTemplateListFc } from './Profile_W2lTemplateListFc';
import { SessionWrapper } from '../../session/SessionWrapper';
import { useParams } from 'react-router-dom';

interface Props {
  sessionWrapper: SessionWrapper,
}

interface ProfileResponsePayload {
  success: boolean,
  error_reason?: string,
  user?: UserPayload,
}

interface UserPayload {
  user_token: string,
  username: string,
  display_name: string,
  email_gravatar_hash: string,
  profile_markdown: string,
  profile_rendered_html: string,
  user_role_slug: string,
  banned: boolean,
  dark_mode: string,
  avatar_public_bucket_hash: string,
  disable_gravatar: boolean,
  hide_results_preference: boolean,
  discord_username?: string,
  twitch_username?: string,
  twitter_username?: string,
  created_at: string,
}


function ProfileFc(props: Props) {
  const { username } = useParams();

  const [userData, setUserData] = useState<UserPayload|undefined>(undefined);

  useEffect(() => {
    const api = new ApiConfig();
    const endpointUrl = api.getProfile(username);

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const profileResponse : ProfileResponsePayload = res;

      if (profileResponse === undefined ||
        !profileResponse.success) {
        return; // Endpoint error?
      }

      setUserData(profileResponse.user)
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });

  }, [username]); // NB: Empty array dependency sets to run ONLY on mount

  let userEmailHash = "dne";
  if (userData !== undefined) {
    userEmailHash = userData!.email_gravatar_hash;
  }

  let editLinkUrl = `/profile/${username}/edit`;

  return (
    <div>
      <h1 className="title is-1">
        <GravatarFc 
          size={45} 
          username={username}
          email_hash={userEmailHash} />
        {username} 
      </h1>

      <Link 
        to={editLinkUrl}>Edit</Link>

      <br />

      <p>Profiles are a work in progress.</p>

      <br />
      <br />

      <h3 className="title is-3"> Badges </h3>
      - EARLY USER !
      <br />
      - Uploaded a model
      <br />
      - Uploaded a template 
      <br />
      <br />

      <h3 className="title is-3"> TTS Results </h3>
      <ProfileTtsInferenceResultsListFc username={username} />


      <br />
      <br />

      <h3 className="title is-3"> Lipsync Results </h3>
      <ProfileW2lInferenceResultsListFc username={username} />

      <br />
      <br />

      <h3 className="title is-3"> Uploaded TTS Models </h3>
      <ProfileTtsModelListFc username={username} />

      <br />
      <br />

      <h3 className="title is-3"> Uploaded Templates </h3>
      <ProfileW2lTemplateListFc username={username} />

      <br />
      <br />

    </div>
  )
}

export { ProfileFc };
