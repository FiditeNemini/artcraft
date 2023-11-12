import React, { useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Link, useHistory } from "react-router-dom";
import { usePrefixedDocumentTitle } from "../../../../common/UsePrefixedDocumentTitle";
import Container from "components/common/Container";
import PageHeader from "components/layout/PageHeader";
import Input from "components/common/Input";
import { Button } from "components/common";
import Panel from "components/common/Panel";
import { faEnvelope } from "@fortawesome/pro-solid-svg-icons";
import {
  RequestResetPassword, RequestResetPasswordIsSuccess,
} from "@storyteller/components/src/api/user/RequestResetPassword";

interface Props {
  sessionWrapper: SessionWrapper;
}

function PasswordResetEmailPage(props: Props) {
  let history = useHistory();

  usePrefixedDocumentTitle("Reset Password");

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [isSent, setIsSent] = useState(false);

  if (props.sessionWrapper.isLoggedIn()) {
    history.push("/");
  }

  const handleChange = (
    ev: React.FormEvent<HTMLInputElement>
  ) => {
    const value = (ev.target as HTMLInputElement).value;
    setEmailOrUsername(value);
  }

  const handleSubmit = async (
    ev: React.FormEvent<HTMLButtonElement>
  ) : Promise<boolean> => {
    ev.preventDefault();

    const value = emailOrUsername.trim();

    if (value.length < 4) {
      return false;
    }

    const request = {
      username_or_email: value 
    };

    const response = await RequestResetPassword(request);

    if (RequestResetPasswordIsSuccess(response)) {
      setIsSent(true);
    }

    return false;
  }

  if (isSent) {
    return (
    <Container type="panel" className="login-panel">
      <PageHeader
        title="Password Reset Sent"
        subText="If you entered a valid email or username, an email with instructions to reset your password has been sent your way. "
        panel={false}
        showBackButton={true}
      />
      <Link to={"/password-reset/verify"}>
        Click here once you have the code.
      </Link>
    </Container>
    );
  }

  return (
    <Container type="panel" className="login-panel">
      <PageHeader
        title="Reset Password"
        subText="Enter your account's email address you'd like your password
        reset information sent to."
        panel={false}
        showBackButton={true}
      />

      <Panel padding={true}>
        <form>
          <div className="d-flex flex-column gap-4">
            <Input
              label="Enter Email or Username"
              icon={faEnvelope}
              placeholder="Email address or username"
              value={emailOrUsername}
              onChange={handleChange}
            />

            <Button label="Reset Password" onClick={handleSubmit} />
          </div>
        </form>
      </Panel>
    </Container>
  );
}

export { PasswordResetEmailPage };
