import React, { useEffect, useState }  from 'react';
import { ApiConfig } from '../../common/ApiConfig';
import { GravatarFc } from '../common/GravatarFc';
import { Link } from 'react-router-dom';
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


function ProfileEditFc(props: Props) {
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

  let viewLinkUrl = `/profile/${username}`;

  return (
    <div>
      <h2 className="subtitle is-2">Editing Profile: {username}</h2>

      <Link 
        to={viewLinkUrl}>&lt; Back to profile</Link>

      <br />
      <br />

      <p>
        Profiles help you network with other creatives. 
        We're going to make amazing and hilarious content together!
      </p>

      <br />

      <form>
        <div className="field">
          <label className="label">Profile (supports Markdown)</label>
          <div className="control">
            <textarea 
              className="textarea is-large" 
              placeholder="Profile (about you)"></textarea>
          </div>
        </div>

        <div className="field">
          <label className="label">Vo.codes Display Name</label>
          <div className="control has-icons-left has-icons-right">
            {/*value={downloadUrl} onChange={handleDownloadUrlChange}*/}
            <input className="input" type="text" placeholder="Display Name" />
            <span className="icon is-small is-left">
              <i className="fas fa-user"></i>
            </span>
            <span className="icon is-small is-right">
              <i className="fas fa-check"></i>
            </span>
          </div>
          {/*<p className="help">{titleInvalidReason}</p>*/}
        </div>

        {/* 
        https://drive.google.com/file/d/{TOKEN}/view?usp=sharing
        */}
        <div className="field">
          <label className="label">Twitter Username</label>
          <div className="control has-icons-left has-icons-right">
            {/*value={downloadUrl} onChange={handleDownloadUrlChange}*/}
            <input className="input" type="text" placeholder="Twitter" />
            <span className="icon is-small is-left">
              <i className="fas fa-envelope"></i>
            </span>
            <span className="icon is-small is-right">
              <i className="fas fa-exclamation-triangle"></i>
            </span>
          </div>
          {/*<p className="help">{downloadUrlInvalidReason}</p>*/}
        </div>

        <div className="field">
          <label className="label">Discord Username</label>
          <div className="control has-icons-left has-icons-right">
            {/*value={downloadUrl} onChange={handleDownloadUrlChange}*/}
            <input className="input" type="text" placeholder="Discord" />
            <span className="icon is-small is-left">
              <i className="fas fa-envelope"></i>
            </span>
            <span className="icon is-small is-right">
              <i className="fas fa-exclamation-triangle"></i>
            </span>
          </div>
          {/*<p className="help">{downloadUrlInvalidReason}</p>*/}
        </div>

        <div className="field">
          <label className="label">Twitch Username</label>
          <div className="control has-icons-left has-icons-right">
            {/*value={downloadUrl} onChange={handleDownloadUrlChange}*/}
            <input className="input" type="text" placeholder="Twitch" />
            <span className="icon is-small is-left">
              <i className="fas fa-envelope"></i>
            </span>
            <span className="icon is-small is-right">
              <i className="fas fa-exclamation-triangle"></i>
            </span>
          </div>
          {/*<p className="help">{downloadUrlInvalidReason}</p>*/}
        </div>

        <div className="field">
          <label className="label">CashApp $CashTag (for reward payouts)</label>
          <div className="control has-icons-left has-icons-right">
            {/*value={downloadUrl} onChange={handleDownloadUrlChange}*/}
            <input className="input" type="text" placeholder="$CashTag" />
            <span className="icon is-small is-left">
              <i className="fas fa-envelope"></i>
            </span>
            <span className="icon is-small is-right">
              <i className="fas fa-exclamation-triangle"></i>
            </span>
          </div>
          {/*<p className="help">{downloadUrlInvalidReason}</p>*/}
        </div>


        <br />

        <button className="button is-link is-large is-fullwidth">Update</button>
        {/*<div className="field is-grouped">
          <div className="control">
            <button className="button is-link is-large is-fullwidth">Upload</button>
          </div>
        </div>*/}
      </form>

      <br />
      <p>More features coming soon:</p>
      <ul>
        <li>Custom avatars</li>
        <li>Email change</li>
        <li>Password change and reset</li>
      </ul>

    </div>
  )
}

export { ProfileEditFc };
