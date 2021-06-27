import React, { useEffect, useState }  from 'react';
import { ApiConfig } from '../../../common/ApiConfig';
import { GravatarFc } from '../../common/GravatarFc';
import { Link } from 'react-router-dom';
import { ProfileTtsInferenceResultsListFc } from './Profile_TtsInferenceResultListFc';
import { ProfileTtsModelListFc } from './Profile_TtsModelListFc';
import { ProfileW2lInferenceResultsListFc } from './Profile_W2lInferenceResultListFc';
import { ProfileW2lTemplateListFc } from './Profile_W2lTemplateListFc';
import { SessionWrapper } from '../../../session/SessionWrapper';
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
  website_url: string | undefined | null,
  discord_username: string | undefined | null,
  twitch_username: string | undefined | null,
  twitter_username: string | undefined | null,
  github_username: string | undefined | null,
  //patreon_username?: string,
  cashapp_username: string | undefined | null,
  created_at: string,
  badges: ProfileBadge[],
}

interface ProfileBadge {
  slug: string,
  title: string,
  description: string,
  image_url: string,
  granted_at: string,
}

function ProfileFc(props: Props) {
  const { username } = useParams() as { username: string };

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

  if (props.sessionWrapper.canEditUserProfile(username)) {
    let editLinkUrl = `/profile/${username}/edit`;
    editProfileButton = (
        <Link 
          className={"button is-medium is-info"}
          to={editLinkUrl}>Edit</Link>
    );
  }

  let profileRows : Array<JSX.Element> = [];

  if (userData !== undefined && userData.website_url !== undefined && userData.website_url !== null) {
    let websiteUrl = <span>{userData.website_url}</span>;
    if (userData?.website_url?.startsWith("http://") || userData?.website_url?.startsWith("https://")) {
      websiteUrl = (
        <a 
          href={userData.website_url} 
          target="_blank"
          rel="noopener noreferrer nofollow" 
          >{userData.website_url}</a>
      );
    }

    profileRows.push(
      <tr key="website">
        <th>Website</th>
        <td>{websiteUrl}</td>
      </tr>
    )
  }

  if (userData !== undefined && userData.twitch_username) {
    let twitchUrl = `https://twitch.com/${userData.twitch_username}`;
    let twitchLink = (
      <a 
        href={twitchUrl} 
        target="_blank"
        rel="noopener noreferrer nofollow" 
        >{userData.twitch_username}</a>
    );
    profileRows.push(
      <tr key="twitch">
        <th>Twitch</th>
        <td>{twitchLink}</td>
      </tr>
    )
  }

  if (userData !== undefined && userData.twitter_username) {
    let twitterUrl = `https://twitter.com/${userData.twitter_username}`;
    let twitterLink = (
      <a 
        href={twitterUrl} 
        target="_blank"
        rel="noopener noreferrer nofollow" 
        >@{userData.twitter_username}</a>
    );
    profileRows.push(
      <tr key="twitter">
        <th>Twitter</th>
        <td>{twitterLink}</td>
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
    let githubUrl = `https://github.com/${userData.github_username}`;
    let githubLink = (
      <a 
        href={githubUrl} 
        target="_blank"
        rel="noopener noreferrer nofollow" 
        >{userData.github_username}</a>
    );
    profileRows.push(
      <tr key="github">
        <th>Github</th>
        <td>{githubLink}</td>
      </tr>
    )
  }

  if (userData !== undefined && userData.cashapp_username) {
    // NB: URL includes a dollar sign
    let cashAppUrl = `https://cash.me/$${userData.cashapp_username}`;
    let cashAppLink = (
      <a 
        href={cashAppUrl} 
        target="_blank"
        rel="noopener noreferrer nofollow" 
        >${userData.cashapp_username}</a>
    );
    profileRows.push(
      <tr key="cashapp">
        <th>CashApp</th>
        <td>{cashAppLink}</td>
      </tr>
    )
  }

  let badges = <div>None yet</div>;

  if (userData !== undefined && userData.badges.length !== 0) {
    let badgeList : Array<JSX.Element> = [];
    userData.badges.forEach(badge => {
      badgeList.push((
        <li>
          {badge.title}
        </li>
      ));
    })
    badges = (
      <ul>{badgeList}</ul>
    )
  }

  return (
    <div className="content">
      <h1 className="title is-1">
        <GravatarFc 
          size={45} 
          username={username}
          email_hash={userEmailHash} />
        {username} 
      </h1>

      {editProfileButton}

      <div 
        className="profile content is-medium" 
        dangerouslySetInnerHTML={{__html: userData?.profile_rendered_html || ""}}
        />

      <table className="table">
        <tbody>
          {profileRows}
        </tbody>
      </table>

      <h3 className="title is-3"> Badges </h3>
      {badges}

      <h3 className="title is-3"> TTS Results </h3>
      <ProfileTtsInferenceResultsListFc username={username} />

      <h3 className="title is-3"> Lipsync Results </h3>
      <ProfileW2lInferenceResultsListFc username={username} />

      <h3 className="title is-3"> Uploaded TTS Models </h3>
      <ProfileTtsModelListFc username={username} />

      <h3 className="title is-3"> Uploaded Templates </h3>
      <ProfileW2lTemplateListFc username={username} />

    </div>
  )
}

export { ProfileFc };
