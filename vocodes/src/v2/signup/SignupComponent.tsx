import React from 'react';
import { ApiConfig } from '../../common/ApiConfig';
import { Mode } from '../../AppMode';
import { SessionWrapper } from '../../session/SessionWrapper';
import { Link } from 'react-router-dom';

enum FieldTriState {
  EMPTY_FALSE,
  FALSE,
  TRUE,
}

interface Props {
  sessionWrapper: SessionWrapper,
  querySessionCallback : () => void,
  switchModeCallback?: (mode: Mode) => void,
}

interface State {
  username: string,
  usernameValid: FieldTriState,
  usernameInvalidReason: string,

  email: string,
  emailValid: FieldTriState,
  emailInvalidReason: string,

  password: string,
  passwordValid: FieldTriState,
  passwordInvalidReason: string,

  passwordConfirmation: string,
  passwordConfirmationValid: FieldTriState,
  passwordConfirmationInvalidReason: string,
}

class SignupComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      username: "",
      usernameValid: FieldTriState.EMPTY_FALSE,
      usernameInvalidReason: "",

      email: "",
      emailValid: FieldTriState.EMPTY_FALSE,
      emailInvalidReason: "",

      password: "",
      passwordValid: FieldTriState.EMPTY_FALSE,
      passwordInvalidReason: "",

      passwordConfirmation: "",
      passwordConfirmationValid: FieldTriState.EMPTY_FALSE,
      passwordConfirmationInvalidReason: "",
    };
  }

  handleUsernameChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();

    const username  = (ev.target as HTMLInputElement).value;

    let usernameValid = FieldTriState.EMPTY_FALSE;
    let usernameInvalidReason = "";

    if (username.length > 1) {
      if (username.length < 3) {
        usernameValid = FieldTriState.FALSE;
        usernameInvalidReason = "username is too short";
      } else if (username.length > 15) {
        usernameValid = FieldTriState.FALSE;
        usernameInvalidReason = "username is too long";
      } else {
        usernameValid = FieldTriState.TRUE;
      }
    }

    this.setState({
      username: username,
      usernameValid: usernameValid,
      usernameInvalidReason: usernameInvalidReason,
    })

    return false;
  }

  handleEmailChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();

    const email = (ev.target as HTMLInputElement).value;

    let emailValid = FieldTriState.EMPTY_FALSE;
    let emailInvalidReason = "";

    if (email.length > 1) {
      if (email.length < 3) {
        emailValid = FieldTriState.FALSE;
        emailInvalidReason = "email is too short";
      } else if (!email.includes("@")) {
        emailValid = FieldTriState.FALSE;
        emailInvalidReason = "email is invalid";
      } else {
        emailValid = FieldTriState.TRUE;
      }
    }

    this.setState({
      email: email,
      emailValid: emailValid,
      emailInvalidReason: emailInvalidReason,
    })

    return false;
  }

  handlePasswordChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();

    const password = (ev.target as HTMLInputElement).value;

    let passwordValid = FieldTriState.EMPTY_FALSE;
    let passwordInvalidReason = "";
    let passwordConfirmationValid = FieldTriState.EMPTY_FALSE;
    let passwordConfirmationInvalidReason = "";

    if (password.length > 1) {
      if (password.length < 5) {
        passwordValid = FieldTriState.FALSE;
        passwordInvalidReason = "password is too short";
      } else {
        passwordValid = FieldTriState.TRUE;
      }

      if (password !== this.state.passwordConfirmation) {
        passwordConfirmationValid = FieldTriState.FALSE;
        passwordConfirmationInvalidReason = "passwords do not match";
      } else {
        passwordConfirmationValid = FieldTriState.TRUE;
        passwordConfirmationInvalidReason = "";

      }
    }

    this.setState({
      password: password,
      passwordValid: passwordValid,
      passwordInvalidReason: passwordInvalidReason,
      passwordConfirmationValid: passwordConfirmationValid,
      passwordConfirmationInvalidReason: passwordConfirmationInvalidReason,
    })

    return false;
  }


  handlePasswordConfirmationChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();

    const passwordConfirmation = (ev.target as HTMLInputElement).value;

    let passwordConfirmationValid = FieldTriState.EMPTY_FALSE;
    let passwordConfirmationInvalidReason = "";

    if (passwordConfirmation.length > 1) {

      if (passwordConfirmation !== this.state.password) {
        passwordConfirmationValid = FieldTriState.FALSE;
        passwordConfirmationInvalidReason = "passwords do not match";
      } else {
        passwordConfirmationValid = FieldTriState.TRUE;
        passwordConfirmationInvalidReason = "";

      }
    }

    this.setState({
      passwordConfirmation: passwordConfirmation,
      passwordConfirmationValid: passwordConfirmationValid,
      passwordConfirmationInvalidReason: passwordConfirmationInvalidReason,
    })

    return false;
  }

  handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();

    if (!this.state.usernameValid || 
      !this.state.emailValid || 
      !this.state.passwordValid || 
      !this.state.passwordConfirmationValid) {
        return false;
    }

    const api = new ApiConfig();
    const endpointUrl = api.createAccount();
    
    const request = {
      username: this.state.username,
      email_address: this.state.email,
      password: this.state.password,
      password_confirmation: this.state.passwordConfirmation,
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
      console.log('create account response', res)
      if (res.success) {
        console.log('querying new session');
        this.props.querySessionCallback();

        // TODO: Switch to functional component.
        window.location.href = '/';
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

    let usernameInputClass = "input";
    let usernameHelpClass = "help";
    switch (this.state.usernameValid) {
      case FieldTriState.EMPTY_FALSE:
        break;
      case FieldTriState.FALSE:
        usernameInputClass += " is-danger";
        usernameHelpClass += " is-danger";
        break;
      case FieldTriState.TRUE:
        usernameInputClass += " is-success";
        usernameHelpClass += " is-success";
        break;
    }

    let emailInputClass = "input";
    let emailHelpClass = "help";
    switch (this.state.emailValid) {
      case FieldTriState.EMPTY_FALSE:
        break;
      case FieldTriState.FALSE:
        emailInputClass += " is-danger";
        emailHelpClass += " is-danger";
        break;
      case FieldTriState.TRUE:
        emailInputClass += " is-success";
        emailHelpClass += " is-success";
        break;
    }

    let passwordInputClass = "input";
    let passwordHelpClass = "help";
    switch (this.state.passwordValid) {
      case FieldTriState.EMPTY_FALSE:
        break;
      case FieldTriState.FALSE:
        passwordInputClass += " is-danger";
        passwordHelpClass += " is-danger";
        break;
      case FieldTriState.TRUE:
        passwordInputClass += " is-success";
        passwordHelpClass += " is-success";
        break;
    }

    let passwordConfirmationInputClass = "input";
    let passwordConfirmationHelpClass = "help";
    switch (this.state.passwordConfirmationValid) {
      case FieldTriState.EMPTY_FALSE:
        break;
      case FieldTriState.FALSE:
        passwordConfirmationInputClass += " is-danger";
        passwordConfirmationHelpClass += " is-danger";
        break;
      case FieldTriState.TRUE:
        passwordConfirmationInputClass += " is-success";
        passwordConfirmationHelpClass += " is-success";
        break;
    }

    return (
      <div>
        <h1 className="title is-1"> Sign Up </h1>

        <Link to="/login"
          className="button is-danger is-inverted"
          >Already have an account? Log in instead!</Link>

        <form onSubmit={this.handleFormSubmit}>
          <div className="field">
            <label className="label">Username</label>
            <div className="control has-icons-left has-icons-right">
              <input className={usernameInputClass} type="text" placeholder="Username" value={this.state.username} onChange={this.handleUsernameChange} />
              <span className="icon is-small is-left">
                <i className="fas fa-user"></i>
              </span>
              <span className="icon is-small is-right">
                <i className="fas fa-check"></i>
              </span>
            </div>
            <p className={usernameHelpClass}>{this.state.usernameInvalidReason}</p>
          </div>

          <div className="field">
            <label className="label">Email</label>
            <div className="control has-icons-left has-icons-right">
              <input className={emailInputClass} type="email" placeholder="Email" value={this.state.email} onChange={this.handleEmailChange} />
              <span className="icon is-small is-left">
                <i className="fas fa-envelope"></i>
              </span>
              <span className="icon is-small is-right">
                <i className="fas fa-exclamation-triangle"></i>
              </span>
            </div>
            <p className={emailHelpClass}>{this.state.emailInvalidReason}</p>
          </div>

          <div className="field">
            <label className="label">Password</label>
            <div className="control has-icons-left has-icons-right">
              <input className={passwordInputClass} type="password" placeholder="Password" value={this.state.password} onChange={this.handlePasswordChange} />
              <span className="icon is-small is-left">
                <i className="fas fa-envelope"></i>
              </span>
              <span className="icon is-small is-right">
                <i className="fas fa-exclamation-triangle"></i>
              </span>
            </div>
            <p className={passwordHelpClass}>{this.state.passwordInvalidReason}</p>
          </div>

          <div className="field">
            <label className="label">Password Confirmation</label>
            <div className="control has-icons-left has-icons-right">
              <input className={passwordConfirmationInputClass} type="password" placeholder="Password confirmation" value={this.state.passwordConfirmation} onChange={this.handlePasswordConfirmationChange} />
              <span className="icon is-small is-left">
                <i className="fas fa-envelope"></i>
              </span>
              <span className="icon is-small is-right">
                <i className="fas fa-exclamation-triangle"></i>
              </span>
            </div>
            <p className={passwordConfirmationHelpClass}>{this.state.passwordConfirmationInvalidReason}</p>
          </div>

          <br />

          <div className="notification is-warning">
            <strong>Remember your password!</strong> We don't have password reset currently, and it'll be a 
            few more weeks before it's added (there are more important features to work on). If you lose your
            password, please let us know in Discord.
          </div>

          <div className="field is-grouped">
            <div className="control">
              <button className="button is-link is-large">Sign up</button>
            </div>
          </div>

        </form>

      </div>
    )
  }
}

export { SignupComponent };