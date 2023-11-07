import React from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { useHistory } from "react-router-dom";
import { usePrefixedDocumentTitle } from "../../../../common/UsePrefixedDocumentTitle";
import Container from "components/common/Container";
import PageHeader from "components/layout/PageHeader";
import Input from "components/common/Input";
import { Button } from "components/common";
import Panel from "components/common/Panel";
import { faEnvelope } from "@fortawesome/pro-solid-svg-icons";

interface Props {
  sessionWrapper: SessionWrapper;
}

function PasswordResetEmailPage(props: Props) {
  let history = useHistory();

  if (props.sessionWrapper.isLoggedIn()) {
    history.push("/");
  }

  usePrefixedDocumentTitle("Reset Password");

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
              label="Enter Email"
              icon={faEnvelope}
              placeholder="Email address"
            />

            <Button label="Reset Password" onClick={() => {}} />
          </div>
        </form>
      </Panel>
    </Container>
  );
}

export { PasswordResetEmailPage };
