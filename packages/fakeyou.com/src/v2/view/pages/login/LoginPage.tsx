import React, { useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Link, useHistory, useLocation } from "react-router-dom";
import {
  CreateSession,
  CreateSessionIsError,
  CreateSessionIsSuccess,
} from "@storyteller/components/src/api/session/CreateSession";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faKey } from "@fortawesome/free-solid-svg-icons";

import { Analytics } from "../../../../common/Analytics";
import { usePrefixedDocumentTitle } from "../../../../common/UsePrefixedDocumentTitle";
import { PosthogClient } from "@storyteller/components/src/analytics/PosthogClient";
import Container from "components/common/Container";
import Panel from "components/common/Panel";
import { useDomainConfig } from "context/DomainConfigContext";

interface Props {
  sessionWrapper: SessionWrapper;
  querySessionAction: () => void;
  querySessionSubscriptionsAction: () => void;
}

function LoginPage(props: Props) {
  let history = useHistory();
  PosthogClient.recordPageview();
  const domain = useDomainConfig();
  const [password, setPassword] = useState("");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  let location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirectUrl = queryParams.get("redirect") || "/";

  if (props.sessionWrapper.isLoggedIn()) {
    history.push("/");
  }

  const handleUsernameOrEmailChange = (
    ev: React.FormEvent<HTMLInputElement>
  ) => {
    ev.preventDefault();
    const usernameOrEmailValue = (ev.target as HTMLInputElement).value;
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

  const handleFormSubmit = async (
    ev: React.FormEvent<HTMLFormElement>
  ): Promise<boolean> => {
    ev.preventDefault();

    const request = {
      username_or_email: usernameOrEmail,
      password: password,
    };

    Analytics.accountLoginAttempt();

    const response = await CreateSession(request);

    if (CreateSessionIsError(response)) {
      setErrorMessage(response.error_message);
    } else if (CreateSessionIsSuccess(response)) {
      props.querySessionAction();
      props.querySessionSubscriptionsAction();
      Analytics.accountLoginSuccess();
      history.push(redirectUrl);
    }

    return false;
  };

  usePrefixedDocumentTitle("Log in to your account");

  let errorWarning = <span />;
  if (errorMessage) {
    errorWarning = (
      <div className="alert alert-danger mb-4">
        <strong>Login Error:</strong> {errorMessage}
      </div>
    );
  }

  return (
    <Container
      type="panel"
      className="login-panel d-flex flex-column align-items-center"
    >
      <h2 className="fw-bold mb-0 mt-5 mb-4">Login to {domain.titlePart}</h2>

      <Panel padding={true}>
        {errorWarning}

        <form onSubmit={handleFormSubmit}>
          <div className="d-flex flex-column gap-4">
            <div>
              <label className="sub-title">Username or Email</label>
              <div className="form-group input-icon">
                <span className="form-control-feedback">
                  <FontAwesomeIcon icon={faUser} />
                </span>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Username or Email"
                  value={usernameOrEmail}
                  onChange={handleUsernameOrEmailChange}
                />
              </div>
              {/*<p className="help"></p>*/}
            </div>

            <div>
              <label className="sub-title">Password</label>
              <div className="form-group input-icon">
                <span className="form-control-feedback">
                  <FontAwesomeIcon icon={faKey} />
                </span>
                <input
                  className="form-control"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                />
              </div>
              <p className="d-flex flex-lg-row gap-2">
                <Link
                  to="/password-reset"
                  className="text-link form-text flex-grow-1"
                >
                  Forgot your password?
                </Link>
                <span className="form-text text-link">
                  Don't have an account? <Link to="/signup">Sign up</Link>
                </span>
              </p>
            </div>
          </div>
          <button className="btn btn-primary w-100 mt-4">Login</button>
        </form>
      </Panel>
    </Container>
  );
}

export { LoginPage };
