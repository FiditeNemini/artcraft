import React from 'react';
import { ApiConfig } from '../../v1/api/ApiConfig';
import { useHistory, withRouter } from "react-router-dom";
import { History } from 'history'
import { SessionWrapper } from '../../session/SessionWrapper';

enum FieldTriState {
  EMPTY_FALSE,
  FALSE,
  TRUE,
}

interface Props {
  sessionWrapper: SessionWrapper,
  querySessionAction: () => void,
  history: History
}

interface State {
  usernameOrEmail: string,
  usernameOrEmailValid: FieldTriState,
  usernameOrEmailInvalidReason: string,

  password: string,
  passwordValid: FieldTriState,
  passwordInvalidReason: string,
}

class LoginComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      usernameOrEmail: "",
      usernameOrEmailValid: FieldTriState.EMPTY_FALSE,
      usernameOrEmailInvalidReason: "",

      password: "",
      passwordValid: FieldTriState.EMPTY_FALSE,
      passwordInvalidReason: "",
    };
  }

  // react-router with stateful components
  // https://stackoverflow.com/a/60335152
  routingFunction = (param: any) => {
    this.props.history.push({
        pathname: `/target-path`,
        state: param
    });
  }

  handleUsernameOrEmailChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();

    const usernameOrEmail  = (ev.target as HTMLInputElement).value;

    this.setState({
      usernameOrEmail: usernameOrEmail,
    })

    return false;
  }

  handlePasswordChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();

    const password = (ev.target as HTMLInputElement).value;

    this.setState({
      password: password,
    })

    return false;
  }

  handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();

    const api = new ApiConfig();
    const endpointUrl = api.login();
    
    const request = {
      username_or_email: this.state.usernameOrEmail,
      password: this.state.password,
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
        this.props.querySessionAction();

        console.log('..... go home')
        //const history = useHistory();
        //history.push("/");
        //history.push("/");

        this.routingFunction(undefined);
      }
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });

    return false;
  }

  public render() {
    if (this.props.sessionWrapper.isLoggedIn()) {
      return <div>Invalid view for logged in users.</div>;
    }

    return (
      <div>
        <h1 className="title is-1"> Login </h1>

        <p></p>

        <form onSubmit={this.handleFormSubmit}>
          <div className="field">
            <label className="label">Username or Email</label>
            <div className="control has-icons-left has-icons-right">
              <input className="input" type="text" placeholder="Username or Email" value={this.state.usernameOrEmail} onChange={this.handleUsernameOrEmailChange} />
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
              <input className="input" type="password" placeholder="Password" value={this.state.password} onChange={this.handlePasswordChange} />
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
}

export { LoginComponent };