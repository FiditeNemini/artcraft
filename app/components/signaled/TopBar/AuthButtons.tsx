import { useSignals } from "@preact/signals-react/runtime";
import { faRightFromBracket } from "@fortawesome/pro-solid-svg-icons";

import { AUTH_STATUS } from "~/enums";
import { authentication, logout } from "~/signals";

import { Button, ButtonLink } from "~/components";

export const AuthButtons = () => {
  useSignals();

  const { status } = authentication;
  const handleLogout = () => {
    if (logout) logout();
  };
  if (status.value === AUTH_STATUS.LOGGED_IN) {
    return (
      <Button
        onClick={handleLogout}
        variant="secondary"
        icon={faRightFromBracket}
      >
        Logout
      </Button>
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
