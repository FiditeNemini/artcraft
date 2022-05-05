import React, { useState } from 'react';
import { CreateAccount, CreateAccountIsError, CreateAccountIsSuccess } from '@storyteller/components/src/api/user/CreateAccount';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { iconEmailField, iconPasswordField, iconUser } from '@storyteller/components/src/icons/SemanticIcons';

enum FieldTriState {
  EMPTY_FALSE,
  FALSE,
  TRUE,
}

interface Props {
  sessionWrapper: SessionWrapper,
  querySessionCallback: () => void,
}

function PricingPage(props: Props) {

  const [username, setUsername] = useState('');
  const [usernameValid, setUsernameValid] = useState(FieldTriState.EMPTY_FALSE);
  const [usernameInvalidReason, setUsernameInvalidReason] = useState('');

  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(FieldTriState.EMPTY_FALSE);
  const [emailInvalidReason, setEmailInvalidReason] = useState('');

  const [password, setPassword] = useState('');
  const [passwordValid, setPasswordValid] = useState(FieldTriState.EMPTY_FALSE);
  const [passwordInvalidReason, setPasswordInvalidReason] = useState('');

  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [passwordConfirmationValid, setPasswordConfirmationValid] = useState(FieldTriState.EMPTY_FALSE);
  const [passwordConfirmationInvalidReason, setPasswordConfirmationInvalidReason] = useState('');

  const handleUsernameChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();

    const newUsername = (ev.target as HTMLInputElement).value;

    let usernameValid = FieldTriState.EMPTY_FALSE;
    let usernameInvalidReason = "";

    if (newUsername.length > 1) {
      if (newUsername.length < 3) {
        usernameValid = FieldTriState.FALSE;
        usernameInvalidReason = "username is too short";
      } else if (newUsername.length > 15) {
        usernameValid = FieldTriState.FALSE;
        usernameInvalidReason = "username is too long";
      } else {
        usernameValid = FieldTriState.TRUE;
      }
    }

    setUsername(newUsername);
    setUsernameValid(usernameValid);
    setUsernameInvalidReason(usernameInvalidReason);

    return false;
  }

  const handleEmailChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();

    const newEmail = (ev.target as HTMLInputElement).value;

    let emailValid = FieldTriState.EMPTY_FALSE;
    let emailInvalidReason = "";

    if (newEmail.length > 1) {
      if (newEmail.length < 3) {
        emailValid = FieldTriState.FALSE;
        emailInvalidReason = "email is too short";
      } else if (!newEmail.includes("@")) {
        emailValid = FieldTriState.FALSE;
        emailInvalidReason = "email is invalid";
      } else {
        emailValid = FieldTriState.TRUE;
      }
    }

    setEmail(newEmail);
    setEmailValid(emailValid);
    setEmailInvalidReason(emailInvalidReason);

    return false;
  }

  const handlePasswordChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();

    const newPassword = (ev.target as HTMLInputElement).value;

    let passwordValid = FieldTriState.EMPTY_FALSE;
    let passwordInvalidReason = "";
    let passwordConfirmationValid = FieldTriState.EMPTY_FALSE;
    let passwordConfirmationInvalidReason = "";

    if (newPassword.length > 1) {
      if (newPassword.length < 5) {
        passwordValid = FieldTriState.FALSE;
        passwordInvalidReason = "password is too short";
      } else {
        passwordValid = FieldTriState.TRUE;
      }

      if (newPassword !== passwordConfirmation) {
        passwordConfirmationValid = FieldTriState.FALSE;
        passwordConfirmationInvalidReason = "passwords do not match";
      } else {
        passwordConfirmationValid = FieldTriState.TRUE;
        passwordConfirmationInvalidReason = "";

      }
    }

    setPassword(newPassword);
    setPasswordValid(passwordValid);
    setPasswordInvalidReason(passwordInvalidReason);
    setPasswordConfirmationValid(passwordConfirmationValid);
    setPasswordConfirmationInvalidReason(passwordConfirmationInvalidReason)

    return false;
  }

  const handlePasswordConfirmationChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();

    const newPasswordConfirmation = (ev.target as HTMLInputElement).value;

    let passwordConfirmationValid = FieldTriState.EMPTY_FALSE;
    let passwordConfirmationInvalidReason = "";

    if (newPasswordConfirmation.length > 1) {

      if (newPasswordConfirmation !== password) {
        passwordConfirmationValid = FieldTriState.FALSE;
        passwordConfirmationInvalidReason = "passwords do not match";
      } else {
        passwordConfirmationValid = FieldTriState.TRUE;
        passwordConfirmationInvalidReason = "";

      }
    }

    setPasswordConfirmation(newPasswordConfirmation);
    setPasswordConfirmationValid(passwordConfirmationValid);
    setPasswordConfirmationInvalidReason(passwordConfirmationInvalidReason);

    return false;
  }

  const handleFormSubmit = async (ev: React.FormEvent<HTMLFormElement>): Promise<boolean> => {
    ev.preventDefault();

    if (!usernameValid ||
      !emailValid ||
      !passwordValid ||
      !passwordConfirmationValid) {
      return false;
    }

    const request = {
      username: username,
      email_address: email,
      password: password,
      password_confirmation: passwordConfirmation,
    };

    const response = await CreateAccount(request);

    if (CreateAccountIsError(response)) {
      if ('email_address' in response.error_fields) {
        setEmailValid(FieldTriState.FALSE);
        setEmailInvalidReason(response.error_fields['email_address'] || "");
      }
      if ('username' in response.error_fields) {
        setUsernameValid(FieldTriState.FALSE);
        setUsernameInvalidReason(response.error_fields['username'] || "");
      }
    } else if (CreateAccountIsSuccess(response)) {
      console.log('querying new session');
      props.querySessionCallback();

      // TODO: Switch to functional component.
      window.location.href = '/';
    }

    return false;
  }


  if (props.sessionWrapper.isLoggedIn()) {
    return <div>Invalid view for logged in users.</div>;
  }

  let usernameInputClass = "input";
  let usernameHelpClass = "help";
  switch (usernameValid) {
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
  switch (emailValid) {
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
  switch (passwordValid) {
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
  switch (passwordConfirmationValid) {
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
      <h1 className="title is-1">
        Pricing
      </h1>

    </div>
  )
}

export { PricingPage };