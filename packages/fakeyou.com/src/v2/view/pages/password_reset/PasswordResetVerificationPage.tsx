import React, { useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { useHistory } from "react-router-dom";
import { usePrefixedDocumentTitle } from "../../../../common/UsePrefixedDocumentTitle";
import Container from "components/common/Container";
import PageHeader from "components/layout/PageHeader";
import Input from "components/common/Input";
import { Button } from "components/common";
import Panel from "components/common/Panel";
import { faLock } from "@fortawesome/pro-solid-svg-icons";

interface Props {
  sessionWrapper: SessionWrapper;
}

function PasswordResetVerificationPage(props: Props) {
  let history = useHistory();
  const [isLoading, setIsLoading] = useState(false);

  if (props.sessionWrapper.isLoggedIn()) {
    history.push("/");
  }

  usePrefixedDocumentTitle("Code Verification");

  const handleVerifyCode = async () => {
    // Simulate a delay using a timer (dummy timer)
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <Container type="panel" className="login-panel">
      <PageHeader
        title="Code Verification"
        subText="Enter the 6-digit code sent to your email address."
        panel={false}
      />

      <Panel padding={true}>
        <form>
          <div className="d-flex flex-column gap-4">
            <Input
              label="Verification Code"
              icon={faLock}
              placeholder="Enter 6-digit code"
            />

            <Button
              label="Verify Code"
              onClick={handleVerifyCode}
              isLoading={isLoading}
            />
          </div>
        </form>
      </Panel>
    </Container>
  );
}

export { PasswordResetVerificationPage };
