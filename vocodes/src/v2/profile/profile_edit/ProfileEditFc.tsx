import React, { useEffect, useState }  from 'react';
import { ApiConfig } from '../../../common/ApiConfig';
import { Link, useHistory } from 'react-router-dom';
import { SessionWrapper } from '../../../session/SessionWrapper';
import { useParams } from 'react-router-dom';
import { VisibleIconFc } from '../../../icons/VisibleIconFc';
import { HiddenIconFc } from '../../../icons/HiddenIconFc';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faFirefox, faGithub, faTwitch, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faDollarSign, faUser } from '@fortawesome/free-solid-svg-icons';

const DEFAULT_VISIBILITY = 'public';

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
  preferred_tts_result_visibility: string,
  preferred_w2l_result_visibility: string,
}

function ProfileEditFc(props: Props) {
  const { username } = useParams() as { username: string };
  const userProfilePage = `/profile/${username}`;

  const history = useHistory();

  // From endpoint
  const [userData, setUserData] = useState<UserPayload|undefined>(undefined);

  // Form values
  const [profileMarkdown, setProfileMarkdown] = useState<string>("");
  const [discord, setDiscord] = useState<string>("");
  const [twitter, setTwitter] = useState<string>("");
  const [twitch, setTwitch] = useState<string>("");
  //const [patreon, setPatreon] = useState<string>("");
  const [github, setGithub] = useState<string>("");
  const [cashApp, setCashApp] = useState<string>("");
  const [websiteUrl, setWebsiteUrl] = useState<string>("");
  const [preferredTtsResultVisibility, setPreferredTtsResultVisibility] = useState<string>(DEFAULT_VISIBILITY);
  const [preferredW2lResultVisibility, setPreferredW2lResultVisibility] = useState<string>(DEFAULT_VISIBILITY);

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

      setUserData(profileResponse.user);
      setProfileMarkdown(profileResponse.user?.profile_markdown || "");
      setTwitter(profileResponse.user?.twitter_username || "");
      setTwitch(profileResponse.user?.twitch_username || "");
      setDiscord(profileResponse.user?.discord_username || "");
      setCashApp(profileResponse.user?.cashapp_username || "");
      //setPatreon(profileResponse.user?.patreon_username || "");
      setGithub(profileResponse.user?.github_username || "");
      setWebsiteUrl(profileResponse.user?.website_url || "");

      setPreferredTtsResultVisibility(profileResponse.user?.preferred_tts_result_visibility || DEFAULT_VISIBILITY);
      setPreferredW2lResultVisibility(profileResponse.user?.preferred_w2l_result_visibility || DEFAULT_VISIBILITY);
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });

  }, [username]); // NB: Empty array dependency sets to run ONLY on mount

  const handleProfileMarkdownChange = (ev: React.FormEvent<HTMLTextAreaElement>) => {
    setProfileMarkdown((ev.target as HTMLTextAreaElement).value)
  };

  const handleTwitterChange = (ev: React.FormEvent<HTMLInputElement>) => {
    setTwitter((ev.target as HTMLInputElement).value)
  };

  const handleTwitchChange = (ev: React.FormEvent<HTMLInputElement>) => {
    setTwitch((ev.target as HTMLInputElement).value)
  };

  const handleGithubChange = (ev: React.FormEvent<HTMLInputElement>) => {
    setGithub((ev.target as HTMLInputElement).value)
  };

  const handleDiscordChange = (ev: React.FormEvent<HTMLInputElement>) => {
    setDiscord((ev.target as HTMLInputElement).value)
  };

  const handleCashAppChange = (ev: React.FormEvent<HTMLInputElement>) => {
    setCashApp((ev.target as HTMLInputElement).value)
  };

  const handleWebsiteUrlChange = (ev: React.FormEvent<HTMLInputElement>) => {
    setWebsiteUrl((ev.target as HTMLInputElement).value)
  };

  const handlePreferredTtsResultVisibilityChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    setPreferredTtsResultVisibility((ev.target as HTMLSelectElement).value)
  };

  const handlePreferredW2lResultVisibilityChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    setPreferredW2lResultVisibility((ev.target as HTMLSelectElement).value)
  };

  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();

    const api = new ApiConfig();
    const endpointUrl = api.editProfile(username);

    const request = {
      profile_markdown: profileMarkdown,
      twitter_username: twitter,
      twitch_username: twitch,
      discord_username: discord,
      cashapp_username: cashApp,
      github_username: github,
      //patreon_username: patreon,
      website_url: websiteUrl,
      preferred_tts_result_visibility: preferredTtsResultVisibility,
      preferred_w2l_result_visibility: preferredW2lResultVisibility,
    }

    fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        history.push(userProfilePage);
      }
    })
    .catch(e => {
    });

    return false;
  }


  if (!userData) {
    // Waiting for load.
    return <span />;
  }

  if (!!userData && !props.sessionWrapper.canEditUserProfile(username)) {
    // Loading and we don't have access.
    history.push(userProfilePage);
  }

  let viewLinkUrl = `/profile/${userData?.username}`;

  let isDisabled = userData === undefined;

  const ttsVisibilityIcon = (preferredTtsResultVisibility === 'public') ? <VisibleIconFc /> : <HiddenIconFc />;
  const w2lVisibilityIcon = (preferredW2lResultVisibility === 'public') ? <VisibleIconFc /> : <HiddenIconFc />;

  return (
    <div>
      <h2 className="subtitle is-2">Profile &amp; Preferences</h2>

      <Link to={viewLinkUrl}>&lt; Back to profile</Link>

      <br />
      <br />

      <form onSubmit={handleFormSubmit}>
        <fieldset disabled={isDisabled}>

        <h4 className="subtitle is-4">Preferences</h4>

        <div className="content">
          <p>
            Control how the site functions.
          </p>
        </div>

        <div className="field">
          <label className="label">
            Audio Result Privacy&nbsp;{ttsVisibilityIcon}
          </label>
          <div className="control select">
            <select 
              name="preferred_tts_result_visibility"
              onChange={handlePreferredTtsResultVisibilityChange}
              value={preferredTtsResultVisibility}
              >
              <option value="public">Public (visible from your profile)</option>
              <option value="hidden">Unlisted (shareable URLs)</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label className="label">
            Video Result Privacy&nbsp;{w2lVisibilityIcon}
          </label>
          <div className="control select">
            <select 
              name="preferred_w2l_result_visibility" 
              onChange={handlePreferredW2lResultVisibilityChange}
              value={preferredW2lResultVisibility}
              >
              <option value="public">Public (visible from your profile)</option>
              <option value="hidden">Unlisted (shareable URLs)</option>
            </select>
          </div>
        </div>

        <br />

        <h4 className="subtitle is-4">Profile</h4>

        <div className="content">
          <p>
            Profiles help you network with other creatives. 
            We're going to make amazing and hilarious content together!
          </p>
        </div>

          <div className="field">
            <label className="label">
              <FontAwesomeIcon icon={faUser} />&nbsp;Bio or whatever (supports Markdown)
            </label>
            <div className="control">
              <textarea 
                onChange={handleProfileMarkdownChange}
                className="textarea is-large" 
                placeholder="Profile (about you)"
                value={profileMarkdown} 
                />
            </div>
          </div>

          {/*<div className="field">
            <label className="label">Vo.codes Display Name</label>
            <div className="control has-icons-left has-icons-right">
              //value={downloadUrl} onChange={handleDownloadUrlChange}
              <input 
                className="input" 
                type="text" 
                placeholder="Display Name" 
                value={userData?.profile_markdown || ""} 
                />
              <span className="icon is-small is-left">
                <i className="fas fa-user"></i>
              </span>
              <span className="icon is-small is-right">
                <i className="fas fa-check"></i>
              </span>
            </div>
            //<p className="help">{titleInvalidReason}</p>
          </div>*/}

          <div className="field">
            <label className="label">
              <FontAwesomeIcon icon={faTwitter} />&nbsp;Twitter Username
            </label>
            <div className="control has-icons-left has-icons-right">
              <input 
                onChange={handleTwitterChange}
                className="input" 
                type="text" 
                placeholder="Twitter" 
                value={twitter}
                />
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
            <label className="label">
              <FontAwesomeIcon icon={faDiscord} />&nbsp;Discord Username (don't forget the #0000)
            </label>
            <div className="control has-icons-left has-icons-right">
              <input 
                onChange={handleDiscordChange}
                className="input" 
                type="text" 
                placeholder="Discord" 
                value={discord}
                />
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
            <label className="label">
              <FontAwesomeIcon icon={faTwitch} />&nbsp;Twitch Username
            </label>
            <div className="control has-icons-left has-icons-right">
              <input 
                onChange={handleTwitchChange}
                className="input" 
                type="text" 
                placeholder="Twitch" 
                value={twitch}
                />
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
            <label className="label">
              <FontAwesomeIcon icon={faDollarSign} />&nbsp;CashApp $CashTag (for reward payouts)
            </label>
            <div className="control has-icons-left has-icons-right">
              <input 
                onChange={handleCashAppChange}
                className="input" 
                type="text" 
                placeholder="CashApp" 
                value={cashApp}
                />
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
            <label className="label">
              <FontAwesomeIcon icon={faGithub} />&nbsp;Github Username (I'm hiring engineers and data scientists!)
            </label>
            <div className="control has-icons-left has-icons-right">
              <input 
                onChange={handleGithubChange}
                className="input" 
                type="text" 
                placeholder="Github" 
                value={github}
                />
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
            <label className="label">
              <FontAwesomeIcon icon={faFirefox} />&nbsp;Personal Website URL
            </label>
            <div className="control has-icons-left has-icons-right">
              <input 
                onChange={handleWebsiteUrlChange}
                className="input" 
                type="text" 
                placeholder="Website URL" 
                value={websiteUrl}
                />
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

        </fieldset>
      </form>

      <br />
      <div className="content">
        <p>More profile and account features coming soon:</p>
        <ul>
          <li>Fully private models and templates</li>
          <li>Sharing preferences (private, friends, auto-expire, etc.)</li>
          <li>Website preferences</li>
          <li>Custom avatar / profile pic uploads</li>
          <li>Email change, password change, and password reset</li>
        </ul>
      </div>

    </div>
  )
}

export { ProfileEditFc };
