import React, { useState } from 'react';
import { SessionWrapper } from '../../session/SessionWrapper';
import { useHistory, withRouter } from "react-router-dom";
import { ApiConfig } from '../../v1/api/ApiConfig';

enum FieldTriState {
  EMPTY_FALSE,
  FALSE,
  TRUE,
}

interface Props {
  sessionWrapper: SessionWrapper,
  querySessionAction: () => void,
}

function LoginFunctionalComponent(props: Props) {
  let history = useHistory();

  const [password, setPassword] = useState('')
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [usernameOrEmailValid, setUsernameOrEmailValid] = useState(FieldTriState.EMPTY_FALSE)
  const [usernameOrEmailInvalidReason, setUsernameOrEmailInvalidReason] = useState('')

  if (props.sessionWrapper.isLoggedIn()) {
    history.push('/');
  }

  const handleUsernameOrEmailChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const usernameOrEmailValue  = (ev.target as HTMLInputElement).value;
    setUsernameOrEmail(usernameOrEmailValue);
    return false;
  };

  const handlePasswordChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const passwordValue = (ev.target as HTMLInputElement).value;
    setPassword(passwordValue);
    return false;
  };

  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();

    const api = new ApiConfig();
    const endpointUrl = api.login();
    
    const request = {
      username_or_email: usernameOrEmail,
      password: password,
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
      console.log('login response', res)
      if (res.success) {
        console.log('querying new session');
        props.querySessionAction();
        history.push('/');
      }
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });

    return false;
  }

  return (
    <div>
      <h1 className="title is-1"> Login </h1>

      <p></p>

      <form onSubmit={handleFormSubmit}>
        <div className="field">
          <label className="label">Username or Email</label>
          <div className="control has-icons-left has-icons-right">
            <input className="input" type="text" placeholder="Username or Email" value={usernameOrEmail} onChange={handleUsernameOrEmailChange} />
            <span className="icon is-small is-left">
              <i className="fas fa-user"></i>
            </span>
            <span className="icon is-small is-right">
              <i className="fas fa-check"></i>
            </span>
          </div>
          {/*<p className="help"></p>*/}
        </div>

        <div className="field">
          <label className="label">Password</label>
          <div className="control has-icons-left has-icons-right">
            <input className="input" type="password" placeholder="Password" value={password} onChange={handlePasswordChange} />
            <span className="icon is-small is-left">
              <i className="fas fa-envelope"></i>
            </span>
            <span className="icon is-small is-right">
              <i className="fas fa-exclamation-triangle"></i>
            </span>
          </div>
          {/*<p className="help"></p>*/}
        </div>

        <br />

        <div className="field is-grouped">
          <div className="control">
            <button className="button is-link is-large">Login</button>
          </div>
        </div>
      </form>
    </div>
  )
}

export { LoginFunctionalComponent };
