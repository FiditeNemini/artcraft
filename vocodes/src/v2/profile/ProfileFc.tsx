import React, { useEffect, useState }  from 'react';
import { ApiConfig } from '../../common/ApiConfig';
import { GravatarFc } from '../common/GravatarFc';
import { Link } from 'react-router-dom';
import { ProfileTtsInferenceResultsListFc } from './Profile_TtsInferenceResultListFc';
import { ProfileTtsModelListFc } from './Profile_TtsModelListFc';
import { ProfileW2lInferenceResultsListFc } from './Profile_W2lInferenceResultListFc';
import { ProfileW2lTemplateListFc } from './Profile_W2lTemplateListFc';
import { SessionWrapper } from '../../session/SessionWrapper';
import { useParams } from 'react-router-dom';
import { profile } from 'console';

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
  website_url?: string,
  discord_username?: string,
  twitch_username?: string,
  twitter_username?: string,
  github_username?: string,
  //patreon_username?: string,
  cashapp_username?: string,
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

  let editProfileButton = <span />

  if (props.sessionWrapper.canEditUser(username)) {
    let editLinkUrl = `/profile/${username}/edit`;
    editProfileButton = (
        <Link 
          className={"button is-medium is-info"}
          to={editLinkUrl}>Edit</Link>
    );
  }

  let profileRows : Array<JSX.Element> = [];

  if (userData !== undefined && userData.website_url) {
    profileRows.push(
      <tr key="website">
        <th>Website</th>
        <td>{userData.website_url}</td>
      </tr>
    )
  }

  if (userData !== undefined && userData.twitch_username) {
    profileRows.push(
      <tr key="twitch">
        <th>Twitch</th>
        <td>{userData.twitch_username}</td>
      </tr>
    )
  }

  if (userData !== undefined && userData.twitter_username) {
    profileRows.push(
      <tr key="twitter">
        <th>Twitter</th>
        <td>{userData.twitter_username}</td>
      </tr>
    )
  }

  if (userData !== undefined && userData.discord_username) {
    profileRows.push(
      <tr key="discord">
        <th>Discord</th>
        <td>{userData.discord_username}</td>
      </tr>
    )
  }

  if (userData !== undefined && userData.github_username) {
    profileRows.push(
      <tr key="github">
        <th>Github</th>
        <td>{userData.github_username}</td>
      </tr>
    )
  }

  if (userData !== undefined && userData.cashapp_username) {
    profileRows.push(
      <tr key="cashapp">
        <th>CashApp</th>
        <td>{userData.cashapp_username}</td>
      </tr>
    )
  }

  return (
    <div>
      <h1 className="title is-1">
        <GravatarFc 
          size={45} 
          username={username}
          email_hash={userEmailHash} />
        {username} 
      </h1>

      {editProfileButton}

      <br />

      <div 
        className="profile content is-medium" 
        dangerouslySetInnerHTML={{__html: userData?.profile_rendered_html || ""}}
        />

      <br />

      <table className="table">
        <tbody>
          {profileRows}
        </tbody>
      </table>

      {/*<h3 className="title is-3"> Badges </h3>
      - EARLY USER !
      <br />
      - Uploaded a model
      <br />
      - Uploaded a template 
      <br />
      <br />*/}

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
