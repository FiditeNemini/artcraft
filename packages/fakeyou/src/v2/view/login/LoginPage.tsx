import React, { useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { useHistory } from "react-router-dom";
import {
  CreateSession,
  CreateSessionIsError,
  CreateSessionIsSuccess,
} from "@storyteller/components/src/api/session/CreateSession";
import {
  iconUser,
  iconPasswordField,
} from "@storyteller/components/src/icons/SemanticIcons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
      <div className="alert alert-danger mb-4">
        <strong>Login Error:</strong> {errorMessage}
      </div>
    );
  }

  return (
    <div>
      <div className="container-panel pb-5 pt-lg-5 my-lg-5 login-panel">
        <div className="panel p-3 p-lg-4 load-hidden mt-5 mt-lg-0">
          <h1 className="panel-title fw-bold">Login</h1>
          <div className="py-6">
            {errorWarning}

            <form onSubmit={handleFormSubmit}>
              <div className="d-flex flex-column gap-4">
                <div>
                  <label className="sub-title">Username or Email</label>
                  <div className="form-group input-icon">
                    <span className="form-control-feedback">
                      <FontAwesomeIcon icon={iconUser} />
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
                      <FontAwesomeIcon icon={iconPasswordField} />
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

                <button className="btn btn-primary btn-lg w-100 mt-2">
                  <FontAwesomeIcon icon={iconUser} className="me-2" />
                  Login
                </button>
                <p>
                  Don’t have an account?
                  <a className="text-link">Create an account now.</a>
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
