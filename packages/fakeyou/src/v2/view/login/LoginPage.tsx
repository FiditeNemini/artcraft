import React, { useState } from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { useHistory } from "react-router-dom";
import { CreateSession, CreateSessionIsError, CreateSessionIsSuccess } from '@storyteller/components/src/api/session/CreateSession';
import { iconUser, iconPasswordField } from '@storyteller/components/src/icons/SemanticIcons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  sessionWrapper: SessionWrapper,
  querySessionAction: () => void,
}

function LoginPage(props: Props) {
  let history = useHistory();

  const [password, setPassword] = useState('')
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  if (props.sessionWrapper.isLoggedIn()) {
    history.push('/');
  }

  const handleUsernameOrEmailChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const usernameOrEmailValue  = (ev.target as HTMLInputElement).value;
    setUsernameOrEmail(usernameOrEmailValue);
    setErrorMessage("");
    return false;
  };

  const handlePasswordChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const passwordValue = (ev.target as HTMLInputElement).value;
    setPassword(passwordValue);
    setErrorMessage("");
    return false;
  };

  const handleFormSubmit = async (ev: React.FormEvent<HTMLFormElement>) : Promise<boolean> => {
    ev.preventDefault();

    const request = {
      username_or_email: usernameOrEmail,
      password: password,
    }

    const response = await CreateSession(request);

    if (CreateSessionIsError(response)) {
      setErrorMessage(response.error_message);
    } else if (CreateSessionIsSuccess(response)) {
      console.log('querying new session');
      props.querySessionAction();
      history.push('/');
    }

    return false;
  }

  let errorWarning = <span />
  if (errorMessage) {
    errorWarning = (
      <div className="notification is-danger is-light">
        <strong>Login Error:</strong> {errorMessage}
      </div>
    )
  }

  return (
    <div>
      <h1 className="title is-1"> Login </h1>

      {errorWarning}

      <form onSubmit={handleFormSubmit}>
        <div className="field">
          <label className="label">Username or Email</label>
          <div className="control has-icons-left has-icons-right">
            <input className="input" type="text" placeholder="Username or Email" value={usernameOrEmail} onChange={handleUsernameOrEmailChange} />
            <span className="icon is-small is-left">
              <FontAwesomeIcon icon={iconUser} />
            </span>
          </div>
          {/*<p className="help"></p>*/}
        </div>

        <div className="field">
          <label className="label">Password</label>
          <div className="control has-icons-left has-icons-right">
            <input className="input" type="password" placeholder="Password" value={password} onChange={handlePasswordChange} />
            <span className="icon is-small is-left">
              <FontAwesomeIcon icon={iconPasswordField} />
            </span>
          </div>
          {/*<p className="help"></p>*/}
        </div>

        <br />

        <button className="button is-link is-large is-fullwidth">Login</button>

      </form>
    </div>
  )
}

export { LoginPage };
