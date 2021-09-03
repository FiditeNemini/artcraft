import React, { useCallback, useEffect, useState }  from 'react';
import { ApiConfig } from '../../../../common/ApiConfig';
import { Link, useHistory } from 'react-router-dom';
import { SessionWrapper } from '../../../../session/SessionWrapper';
import { useParams } from 'react-router-dom';
import { GetUserByUsername, GetUserByUsernameIsOk, User } from '../../../api/user/GetUserByUsername';

interface Props {
  sessionWrapper: SessionWrapper,
}

function ProfileBanFc(props: Props) {
  const { username } : { username: string }= useParams();
  const userProfilePage = `/profile/${username}`;

  const history = useHistory();

  // From endpoint
  const [userData, setUserData] = useState<User|undefined>(undefined);

  // Form values
  const [modComments, setModComments] = useState<string>("");
  const [isBanned, setIsBanned] = useState<boolean>(false);

  const getUserProfile = useCallback(async (username) => {
    const user = await GetUserByUsername(username);
    if (GetUserByUsernameIsOk(user)) {
      setUserData(user);
      setIsBanned(user?.maybe_moderator_fields?.is_banned || false);
      setModComments(user?.maybe_moderator_fields?.maybe_mod_comments || "");
    }
  }, []);

  useEffect(() => {
    getUserProfile(username);
  }, [username, getUserProfile]);

  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();

    const api = new ApiConfig();
    const endpointUrl = api.banUser();

    const request = {
      username: userData?.username,
      is_banned: isBanned,
      mod_notes: modComments,
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


  const handleModCommentsChange = (ev: React.FormEvent<HTMLInputElement>) => { 
    ev.preventDefault();
    const textValue = (ev.target as HTMLInputElement).value;
    setModComments(textValue);
    return false;
  };

  const handleIsBannedChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    let bannedState = false;
    switch ((ev.target as HTMLSelectElement).value) {
      case "true":
        bannedState = true;
        break;
      case "TRUE":
        bannedState = true;
        break;
    }
    setIsBanned(bannedState)
  };

  let viewLinkUrl = `/profile/${userData?.username}`;

  let isDisabled = userData === undefined;


  return (
    <div>
      <h2 className="subtitle is-2">Profile &amp; Preferences</h2>

      <Link to={viewLinkUrl}>&lt; Back to profile</Link>

      <br />
      <br />

      <form onSubmit={handleFormSubmit}>
        <fieldset disabled={isDisabled}>

          <div className="field">
            <label className="label">Is Banned?</label>
            <div className="control select">
              <select 
                name="default_pretrained_vocoder" 
                onChange={handleIsBannedChange}
                value={isBanned ? "true" : "false"}
                >
                <option value="true">Banned</option>
                <option value="false">Not Banned</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label className="label">Moderator Comments (Short)</label>
            <div className="control has-icons-left has-icons-right">
              <input 
                onChange={handleModCommentsChange}
                className="input" 
                type="text" 
                placeholder="Moderator Comments" 
                value={modComments}
                />
            </div>
            {/*<p className="help">{invalidReason}</p>*/}
          </div>


          <br />

          <button className="button is-danger is-large is-fullwidth">Update Ban</button>

        </fieldset>
      </form>

      <br />

      <div>
        <p>Notes on banned users:</p>
        <ul>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>

    </div>
  )
}

export { ProfileBanFc };
