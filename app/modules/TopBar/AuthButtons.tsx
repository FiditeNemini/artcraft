import { useContext } from "react";
import { useSignals } from "@preact/signals-react/runtime";

import { AUTH_STATUS, AuthenticationContext } from "~/contexts/Authentication";
import { Button, ButtonLink } from "~/components";
import { DialogueInference } from "../DialogueInference";
import { faRightFromBracket } from "@fortawesome/pro-solid-svg-icons";

export const AuthButtons = () => {
  useSignals();

  const { authState, logout } = useContext(AuthenticationContext);
  const handleLogout = () => {
    if (logout) logout();
  };
  if (authState && authState.authStatus === AUTH_STATUS.LOGGED_IN) {
    return (
      <>
        <DialogueInference />
        <Button
          onClick={handleLogout}
          variant="secondary"
          icon={faRightFromBracket}>
          Logout
        </Button>
      </>
    );
  } else {
    return (
      <>
        <ButtonLink variant="secondary" to="/login">
          Login
        </ButtonLink>
        <ButtonLink to="/signup">Sign Up</ButtonLink>
      </>
    );
  }
};
