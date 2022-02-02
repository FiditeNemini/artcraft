import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { ApiConfig } from '@storyteller/components';
import { SessionWrapper } from '../../../../session/SessionWrapper';
import { formatDistance } from 'date-fns';
import { BackLink } from '../../_common/BackLink';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';

interface Props {
  sessionWrapper: SessionWrapper,
}

interface IpBanListResponse {
  success: boolean,
  ip_address_bans: Array<IpBanListItem>,
}

interface IpBanListItem {
  ip_address: string,
  maybe_target_user_token: string,
  maybe_target_username: string,

  mod_user_token: string,
  mod_username: string,
  mod_display_name: string,
  mod_notes: string,

  created_at: string,
  updated_at: string,
}

function ModerationIpBanListFc(props: Props) {
  const history = useHistory();

  const [ipBanList, setIpBanList] = useState<Array<IpBanListItem>>([]);

  // Form
  const [newIpAddress, setNewIpAddress] = useState<string>("");
  const [modNotes, setModNotes] = useState<string>("");

  useEffect(() => {
    const api = new ApiConfig();
    const endpointUrl = api.getModerationIpBanList();

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const response : IpBanListResponse = res;
      if (!response.success) {
        return;
      }

      setIpBanList(response.ip_address_bans)
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });
  }, []); // NB: Empty array dependency sets to run ONLY on mount

  const handleNewIpAddressChange = (ev: React.FormEvent<HTMLInputElement>) => {
    setNewIpAddress((ev.target as HTMLInputElement).value)
  };

  const handleModNotesChange = (ev: React.FormEvent<HTMLInputElement>) => {
    setModNotes((ev.target as HTMLInputElement).value)
  };

  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();

    const api = new ApiConfig();
    const endpointUrl = api.createModerationIpBan();

    const request = {
      ip_address: newIpAddress,
      mod_notes: modNotes,
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
        history.go(0); // NB: Force reload
      }
    })
    .catch(e => {});

    return false;
  }

  if (!props.sessionWrapper.canBanUsers()) {
    return <h1>Unauthorized</h1>;
  }

  const now = new Date();
  let rows : Array<JSX.Element> = [];

  ipBanList.forEach(ban => {
    const modUserLink = `/profile/${ban.mod_username}`;
    const viewBanLink = `/moderation/ip_bans/${ban.ip_address}`;

    const createTime = new Date(ban.created_at);
    const relativeCreateTime = formatDistance(createTime, now, { addSuffix: true });

    rows.push(
      <tr key={ban.ip_address}>
        <td>{ban.ip_address}</td>
        <td>
          <Link to={modUserLink}>{ban.mod_username}</Link>
        </td>
        <td>{ban.mod_notes}</td>
        <td>{relativeCreateTime}</td>
        <td>
          <Link to={viewBanLink}>view / edit</Link>
        </td>
      </tr>
    )
  });

  return (
    <div>
      <h1 className="title is-1"> Moderation Ip Ban List </h1>

      <p>
        <BackLink link={FrontendUrlConfig.moderationMain()} text="Back to moderation" />
      </p>

      <br />

      <p>IP Address bans will prevent bad actors from using and abusing the website.</p>
      
      <br />

      <h3 className="title is-3"> Create Ban </h3>

      <form onSubmit={handleFormSubmit}>
        <div className="field">
          <label className="label">Ip Address</label>
          <div className="control has-icons-left has-icons-right">
            <input 
              onChange={handleNewIpAddressChange}
              className="input" 
              type="text" 
              placeholder="IP Address, eg. 255.255.255.255" 
              value={newIpAddress}
              />
            <span className="icon is-small is-left">
              <i className="fas fa-envelope"></i>
            </span>
            <span className="icon is-small is-right">
              <i className="fas fa-exclamation-triangle"></i>
            </span>
          </div>
          {/*<p className="help">{invalidReason}</p>*/}
        </div>

        <div className="field">
          <label className="label">Moderator Notes</label>
          <div className="control has-icons-left has-icons-right">
            <input 
              onChange={handleModNotesChange}
              className="input" 
              type="text" 
              placeholder="Notes / reason for ban" 
              value={modNotes}
              />
            <span className="icon is-small is-left">
              <i className="fas fa-envelope"></i>
            </span>
            <span className="icon is-small is-right">
              <i className="fas fa-exclamation-triangle"></i>
            </span>
          </div>
          {/*<p className="help">{invalidReason}</p>*/}
        </div>

        <button className="button is-danger is-large is-fullwidth">Create Ban</button>

      </form>

      <br />
      <br />

      <h3 className="title is-3"> Existing Bans </h3>

      <table className="table">
        <thead>
          <tr>
            <th>IP Address</th>
            <th>Moderator</th>
            <th>Moderator Notes</th>
            <th>Created At</th>
            <th>View / Edit</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  )
}

export { ModerationIpBanListFc };
