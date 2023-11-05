import React, { useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { useHistory } from "react-router-dom";
import { usePrefixedDocumentTitle } from "../../../../common/UsePrefixedDocumentTitle";
import Container from "components/common/Container";
import PageHeader from "components/layout/PageHeader";
import Input from "components/common/Input";
import { Button } from "components/common";
import Panel from "components/common/Panel";
import { faKey } from "@fortawesome/pro-solid-svg-icons";
import BackButton from "components/common/BackButton";

interface Props {
  sessionWrapper: SessionWrapper;
}

function PasswordResetChangePage(props: Props) {
  let history = useHistory();
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (props.sessionWrapper.isLoggedIn()) {
    history.push("/");
  }

  usePrefixedDocumentTitle("Reset Password");

  const handlePasswordChange = async () => {
    // Simulate a delay using a timer (dummy timer)
    setIsLoading(true);

    setTimeout(() => {
      setIsPasswordChanged(true);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <Container type="panel" className="login-panel">
      <PageHeader
        title="Change Password"
        subText="Set your new password."
        panel={false}
      />

      <Panel padding={true}>
        {isPasswordChanged ? (
          <div className="d-flex flex-column gap-3 align-items-start">
            <p>Your password has been successfully changed!</p>
            <BackButton label="Back to Login" to="/login" />
          </div>
        ) : (
          <form>
            <div className="d-flex flex-column gap-4">
              <Input
                label="New Password"
                icon={faKey}
                placeholder="Enter new password"
              />

              <Input
                label="Confirm New Password"
                icon={faKey}
                placeholder="Confirm new password"
              />

              <Button
                label="Confirm Change"
                onClick={handlePasswordChange}
                isLoading={isLoading}
              />
            </div>
          </form>
        )}
      </Panel>
    </Container>
  );
}

export { PasswordResetChangePage };
