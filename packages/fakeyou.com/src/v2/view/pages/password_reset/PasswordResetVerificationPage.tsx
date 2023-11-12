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
import {
  RedeemResetPassword, RedeemResetPasswordIsSuccess,
} from "@storyteller/components/src/api/user/RedeemResetPassword";

interface Props {
  sessionWrapper: SessionWrapper;
}

function PasswordResetVerificationPage(props: Props) {
  let history = useHistory();

  usePrefixedDocumentTitle("Password Reset Verification");

  const [resetToken, setResetToken] = useState(getCodeFromUrl() || "");
  const [resetTokenLooksValid, setResetTokenLooksValid] = useState(!!!getResetCodeErrors(getCodeFromUrl()));
  const [resetTokenInvalidReason, setResetTokenInvalidReason] = useState(getResetCodeErrors(getCodeFromUrl()));

  const [newPassword, setNewPassword] = useState("");
  const [newPasswordIsValid, setNewPasswordIsValid] = useState(false);
  const [newPasswordInvalidReason, setNewPasswordInvalidReason] = useState<string|undefined>("new password is too short");

  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [newPasswordConfirmationIsValid, setNewPasswordConfirmationIsValid] = useState(false);
  const [newPasswordConfirmationInvalidReason, setNewPasswordConfirmationInvalidReason] = useState<string|undefined>("new password is too short");

  if (props.sessionWrapper.isLoggedIn()) {
    history.push("/");
  }

  const handleChangeResetToken = (ev: React.FormEvent<HTMLInputElement>) => {
    const token = (ev.target as HTMLInputElement).value;
    const errors = getResetCodeErrors(token);
    setResetToken(token);
    setResetTokenLooksValid(!!!errors);
    setResetTokenInvalidReason(errors);
  }

  const handleChangePassword = (ev: React.FormEvent<HTMLInputElement>) => {
    const value = (ev.target as HTMLInputElement).value;

    let isValid = true;
    let invalidReason = undefined;

    if (value.length < 5) {
      isValid = false;
      invalidReason = "new password is too short";
    }

    setNewPassword(value);
    setNewPasswordIsValid(isValid);
    setNewPasswordInvalidReason(invalidReason)

    if (value !== newPasswordConfirmation) {
      setNewPasswordConfirmationIsValid(false);
      setNewPasswordConfirmationInvalidReason("new password does not match")
    } else if (newPasswordConfirmation.length > 4) {
      setNewPasswordConfirmationIsValid(true);
      setNewPasswordConfirmationInvalidReason(undefined)
    }
  }

  const handleChangePasswordConfirmation = (ev: React.FormEvent<HTMLInputElement>) => {
    const value = (ev.target as HTMLInputElement).value;

    let isValid = true;
    let invalidReason = undefined;

    if (value !== newPassword) {
      isValid = false;
      invalidReason = "new password does not match";
    }
    else if (value.length < 5) {
      isValid = false;
      invalidReason = "new password is too short";
    }

    setNewPasswordConfirmation(value);
    setNewPasswordConfirmationIsValid(isValid);
    setNewPasswordConfirmationInvalidReason(invalidReason)
  }

  const handleSubmit = async (
    ev: React.FormEvent<HTMLButtonElement>
  ) : Promise<boolean> => {
    ev.preventDefault();

    const password = newPassword.trim();
    const passwordConfirmation = newPasswordConfirmation.trim();

    const request = {
      reset_token: resetToken,
      new_password: password,
      new_password_validation: passwordConfirmation,
    };

    const response = await RedeemResetPassword(request);

    // TODO(bt,2023-11-12): Handle server-side errors

    if (RedeemResetPasswordIsSuccess(response)) {
      history.push("/");
    }

    return false;
  };

  const canSubmit = resetTokenLooksValid && newPasswordIsValid && newPasswordConfirmationIsValid;

  let resetTokenHelpClasses = resetTokenLooksValid ? "" : "form-control is-danger";
  let newPasswordHelpClasses = newPasswordIsValid ? "" : "form-control is-danger";
  let newPasswordConfirmationHelpClasses = newPasswordConfirmationIsValid ? "" : "form-control is-danger";

  return (
    <Container type="panel" className="login-panel">
      <PageHeader
        title="Password Reset Verification"
        subText="Enter the code sent to your email address."
        panel={false}
      />

      <Panel padding={true}>
        <form>
          <div className="d-flex flex-column gap-4">

            <Input
              label="Verification Code"
              icon={faLock}
              placeholder="Enter 6-digit code"
              value={resetToken}
              onChange={handleChangeResetToken}
            />

            <p className={resetTokenHelpClasses}>
              {resetTokenInvalidReason}
            </p>

            <Input
              type="password"
              label="New Password"
              icon={faLock}
              placeholder="Enter new password"
              value={newPassword}
              onChange={handleChangePassword}
            />

            <p className={newPasswordHelpClasses}>
              {newPasswordInvalidReason}
            </p>

            <Input
              type="password"
              label="Verify New Password"
              icon={faLock}
              placeholder="Enter new password again"
              value={newPasswordConfirmation}
              onChange={handleChangePasswordConfirmation}
            />

            <p className={newPasswordConfirmationHelpClasses}>
              {newPasswordConfirmationInvalidReason}
            </p>

            <Button
              label="Change Password"
              onClick={handleSubmit}
              disabled={!canSubmit}
            />
          </div>
        </form>
      </Panel>
    </Container>
  );
}

// Pre-load the code from a URL query string, eg https://fakeyou.com/password-reset/validate?code=codeGoesHere
function getCodeFromUrl() : string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token');
}

// Handle error state at initialization
function getResetCodeErrors(code: string | null) : string | undefined {
  if (!code) {
    return "no code set";
  }
  if (code.length < 10) {
    return "code is too short";
  };
}


export { PasswordResetVerificationPage };
