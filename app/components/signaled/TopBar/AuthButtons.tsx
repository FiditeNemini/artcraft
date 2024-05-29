import { useSignals } from "@preact/signals-react/runtime";

import { AUTH_STATUS } from "~/enums";
import { authentication, logout } from "~/signals";

import { ButtonLink } from "~/components";
import ProfileDropdown from "./ProfileDropdown";

export const AuthButtons = () => {
  useSignals();

  const { status, userInfo } = authentication;
  const handleLogout = () => {
    if (logout) logout();
  };
  if (status.value === AUTH_STATUS.LOGGED_IN) {
    return (
      <ProfileDropdown
        username={userInfo.value?.core_info.username || ""}
        displayName={userInfo.value?.core_info.display_name || ""}
        avatarIndex={userInfo.value?.core_info.default_avatar.image_index || 0}
        backgroundColorIndex={
          userInfo.value?.core_info.default_avatar.color_index || 0
        }
        emailHash={userInfo.value?.core_info.gravatar_hash || ""}
        logoutHandler={() => handleLogout()}
      />
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
