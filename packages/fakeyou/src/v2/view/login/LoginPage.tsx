import React, { useState } from "react";
import { FrontendUrlConfig } from "../../../common/FrontendUrlConfig";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Link, useHistory } from "react-router-dom";
import {
  CreateSession,
  CreateSessionIsError,
  CreateSessionIsSuccess,
} from "@storyteller/components/src/api/session/CreateSession";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faKey } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { container, panel } from "../../../data/animation";
import { USE_REFRESH } from "../../../Refresh";

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
    if (!USE_REFRESH) {
      errorWarning = (
        <div className="notification is-danger is-light">
          <strong>Login Error:</strong> {errorMessage}
        </div>
      );
    } else {
      errorWarning = (
        <div className="alert alert-danger mb-4">
          <strong>Login Error:</strong> {errorMessage}
        </div>
      );
    }
  }

  if (!USE_REFRESH) {
    return (
      <div>
        <h1 className="title is-1"> Login </h1>

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
                <FontAwesomeIcon icon={faUser} />
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
                <FontAwesomeIcon icon={faKey} />
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
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <motion.div
        className="container-panel pb-5 pt-lg-5 my-lg-5 login-panel"
        variants={panel}
      >
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
                  <Link
                    to={FrontendUrlConfig.signupPage()}
                    className="text-link"
                  >
                    Create an account now.
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export { LoginPage };
