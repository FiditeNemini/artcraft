import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faKey } from "@fortawesome/free-solid-svg-icons";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Link, useHistory } from "react-router-dom";
import {
  iconPasswordField,
  iconUser,
} from "@storyteller/components/src/icons/SemanticIcons";
import {
  CreateSession,
  CreateSessionIsError,
  CreateSessionIsSuccess,
} from "@storyteller/components/src/api/session/CreateSession";

interface Props {
  sessionWrapper: SessionWrapper;
  querySessionAction: () => void;
}

function LoginPage(props: Props) {
  let history = useHistory();

  const [password, setPassword] = useState("");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

    const response = await CreateSession(request);

    if (CreateSessionIsError(response)) {
      setErrorMessage(response.error_message);
    } else if (CreateSessionIsSuccess(response)) {
      console.log("querying new session");
      props.querySessionAction();
      history.push("/");
    }

    return false;
  };

  let errorWarning = <span />;
  if (errorMessage) {
    errorWarning = (
      <div className="notification is-danger is-light">
        <strong>Login Error:</strong> {errorMessage}
      </div>
    );
  }

  return (
    <div>
      <section className="section">
        <div className="container">
          <h1 className="title is-1"> Login </h1>
          <h1 className="subtitle is-6">
            (If you have a FakeYou.com account, it'll work here too.)
          </h1>

          {errorWarning}

          <form onSubmit={handleFormSubmit}>
            <div className="field">
              <label className="label">Username or Email</label>
              <div className="control has-icons-left has-icons-right">
                <input
                  className="input"
                  type="text"
                  placeholder="Username or Email"
                  value={usernameOrEmail}
                  onChange={handleUsernameOrEmailChange}
                />
                <span className="icon is-small is-left">
                  <FontAwesomeIcon icon={iconUser} />
                </span>
              </div>
              {/*<p className="help"></p>*/}
            </div>

            <div className="field">
              <label className="label">Password</label>
              <div className="control has-icons-left has-icons-right">
                <input
                  className="input"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                />
                <span className="icon is-small is-left">
                  <FontAwesomeIcon icon={iconPasswordField} />
                </span>
              </div>
              {/*<p className="help"></p>*/}
            </div>

            <br />

            <button className="button is-link is-large is-fullwidth">
              Login
            </button>
          </form>
        </div>
      </section>

      <div className="container-panel pb-5 pt-lg-5 my-lg-5 login-panel">
        <div className="panel p-3 p-lg-4 load-hidden mt-5 mt-lg-0 px-md-4">
          <h1 className="panel-title fw-bold">Login</h1>
          <div className="py-6">
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
                  {/*<p className="help"></p>*/}
                </div>

                <button className="btn btn-primary w-100 mt-2">Login</button>
                <p>
                  Don’t have an account? &nbsp;
                  <Link to="/signup" className="text-link">
                    Create an account now.
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export { LoginPage };
